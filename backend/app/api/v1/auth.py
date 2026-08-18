import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user = User(
        email=user_in.email,
        full_name=user_in.full_name or user_in.email.split("@")[0],
        hashed_password=get_password_hash(user_in.password),
        current_cefr_level=user_in.current_cefr_level or "A1",
        xp_points=0,
        current_streak=1,
        streak_freeze_count=2,
        last_activity_date=date.today(),
        created_at=datetime.utcnow()
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/demo-guest", response_model=Token)
async def get_demo_guest_user(db: AsyncSession = Depends(get_db)):
    """Provides an instant guest user session for fast onboarding and testing."""
    demo_email = "frontier_scholar@omnienglish.edu"
    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalars().first()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=demo_email,
            full_name="Sandra Carolina",
            hashed_password=get_password_hash("omnipassword"),
            current_cefr_level="B1",
            xp_points=420,
            current_streak=5,
            streak_freeze_count=2,
            last_activity_date=date.today(),
            created_at=datetime.utcnow()
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))
