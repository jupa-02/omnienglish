from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api.v1.api_router import api_router
from app.etl.ingest_open_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database extensions and auto-seed initial units & vocabulary
    print("🚀 Initializing OmniEnglish Frontier Database & Seed Data...")
    try:
        await init_db()
        async with AsyncSessionLocal() as session:
            await seed_database(session)
    except Exception as e:
        print(f"Database startup notice: {e}")
    yield
    # Shutdown
    print("🛑 Shutting down OmniEnglish Frontier backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Accelerated English Acquisition Platform (General & Economics ESP) with FSRS, Adaptive Diagnostic Placement, and Real-time Voice Evaluations.",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to OmniEnglish Frontier API",
        "docs_url": "/docs",
        "version": settings.VERSION
    }
