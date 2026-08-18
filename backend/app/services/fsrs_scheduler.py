import math
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any

class FSRSScheduler:
    """
    Implementation of the Free Spaced Repetition Scheduler (FSRS v4.5).
    Optimized for rapid acquisition of English vocabulary and ESP economic terms.
    
    States:
    0 = New
    1 = Learning
    2 = Review
    3 = Relearning

    Ratings:
    1 = Again (Failed recall)
    2 = Hard (Recalled with extreme effort / hesitation)
    3 = Good (Successful standard recall)
    4 = Easy (Instant, effortless recall)
    """

    # FSRS default weights (calibrated for language acquisition)
    DEFAULT_WEIGHTS = [
        0.40255, 1.18385, 3.173, 15.69105, # Initial stabilities for ratings 1, 2, 3, 4
        7.1949, 0.5345, 1.4604, 0.0046,     # Difficulty parameters
        1.54575, 0.1192, 1.01925,           # Stability parameters (review)
        1.9395, 0.11, 0.29605, 2.2698,      # Stability parameters (relearning)
        0.2315, 2.9898, 0.51655, 0.6621    # Retention parameters
    ]

    REQUESTED_RETENTION = 0.90 # Target 90% retrieval probability

    def __init__(self, weights=None, requested_retention: float = 0.90):
        self.w = weights if weights else self.DEFAULT_WEIGHTS
        self.requested_retention = requested_retention

    def init_difficulty(self, rating: int) -> float:
        """Calculate initial difficulty D_0(G) in [1.0, 10.0]."""
        # D_0(G) = w[4] - exp(w[5] * (G - 1)) + 1
        d = self.w[4] - math.exp(self.w[5] * (rating - 1)) + 1
        return max(1.0, min(10.0, d))

    def init_stability(self, rating: int) -> float:
        """Calculate initial stability S_0(G) in days."""
        # S_0(G) = w[G-1]
        return max(0.1, self.w[rating - 1])

    def next_difficulty(self, d: float, rating: int) -> float:
        """Update difficulty based on rating."""
        # delta_D = -w[6] * (rating - 3)
        # D' = w[7] * D_0(3) + (1 - w[7]) * (D + delta_D)
        delta_d = -self.w[6] * (rating - 3)
        d_0_good = self.init_difficulty(3)
        next_d = self.w[7] * d_0_good + (1.0 - self.w[7]) * (d + delta_d)
        return max(1.0, min(10.0, next_d))

    def retrievability(self, elapsed_days: float, stability: float) -> float:
        """Calculate current probability of recall R(t, S)."""
        if stability <= 0:
            return 0.0
        # R(t, S) = (1 + factor * (t / S))^-w[18]
        # In standard FSRS-4.5: R = (1 + 19/81 * t / S)^(-0.5)
        factor = 19.0 / 81.0
        return math.pow(1.0 + factor * (elapsed_days / stability), -0.5)

    def next_stability_good_or_easy(self, d: float, s: float, r: float, rating: int) -> float:
        """Calculate next stability on successful recall (Good or Easy)."""
        hard_penalty = self.w[15] if rating == 2 else 1.0
        easy_bonus = self.w[16] if rating == 4 else 1.0
        
        # S'(D, S, R, G) = S * (1 + exp(w[8]) * (11 - D) * S^(-w[9]) * (exp((1 - R) * w[10]) - 1) * hard_penalty * easy_bonus)
        s_inc = 1.0 + math.exp(self.w[8]) * (11.0 - d) * math.pow(s, -self.w[9]) * (math.exp((1.0 - r) * self.w[10]) - 1.0) * hard_penalty * easy_bonus
        return max(s + 0.1, s * s_inc)

    def next_stability_again(self, d: float, s: float, r: float) -> float:
        """Calculate next stability on lapse (Again)."""
        # S_lapse = min(S, w[11] * D^(-w[12]) * ((S + 1)^w[13] - 1) * exp((1 - R) * w[14]))
        s_lapse = self.w[11] * math.pow(d, -self.w[12]) * (math.pow(s + 1.0, self.w[13]) - 1.0) * math.exp((1.0 - r) * self.w[14])
        return max(0.1, min(s, s_lapse))

    def calculate_interval(self, stability: float) -> int:
        """Calculate interval in days to reach target retention."""
        if stability <= 0:
            return 1
        # I(r, s) = (s / factor) * (r^(-1/0.5) - 1)
        factor = 19.0 / 81.0
        interval = (stability / factor) * (math.pow(self.requested_retention, -2.0) - 1.0)
        return max(1, round(interval))

    def step(
        self,
        current_state: int,
        stability: float,
        difficulty: float,
        elapsed_days: float,
        rating: int, # 1=Again, 2=Hard, 3=Good, 4=Easy
        now: datetime = None
    ) -> Dict[str, Any]:
        """
        Process a review card step and return new metrics and next due date.
        """
        if now is None:
            now = datetime.now(timezone.utc)

        if current_state == 0: # New card
            new_stability = self.init_stability(rating)
            new_difficulty = self.init_difficulty(rating)
            if rating == 1:
                new_state = 1 # Learning
                scheduled_days = 0 # Review again in same session or next day
                interval_days = 1
            elif rating == 2:
                new_state = 1
                scheduled_days = 1
                interval_days = 1
            elif rating == 3:
                new_state = 2 # Review
                interval_days = self.calculate_interval(new_stability)
                scheduled_days = interval_days
            else: # Easy (4)
                new_state = 2
                interval_days = max(4, self.calculate_interval(new_stability))
                scheduled_days = interval_days
        else: # Existing card
            r = self.retrievability(elapsed_days, stability)
            new_difficulty = self.next_difficulty(difficulty, rating)

            if rating == 1: # Again
                new_state = 3 # Relearning
                new_stability = self.next_stability_again(new_difficulty, stability, r)
                interval_days = 1
                scheduled_days = 1
            elif rating == 2: # Hard
                new_state = 2
                new_stability = self.next_stability_good_or_easy(new_difficulty, stability, r, 2)
                interval_days = max(1, round(self.calculate_interval(new_stability) * 0.8))
                scheduled_days = interval_days
            elif rating == 3: # Good
                new_state = 2
                new_stability = self.next_stability_good_or_easy(new_difficulty, stability, r, 3)
                interval_days = max(1, self.calculate_interval(new_stability))
                scheduled_days = interval_days
            else: # Easy
                new_state = 2
                new_stability = self.next_stability_good_or_easy(new_difficulty, stability, r, 4)
                interval_days = max(interval_days if 'interval_days' in locals() else 1, round(self.calculate_interval(new_stability) * 1.3))
                scheduled_days = interval_days

        next_due = now + timedelta(days=interval_days)

        return {
            "stability": round(new_stability, 4),
            "difficulty": round(new_difficulty, 4),
            "state": new_state,
            "scheduled_days": scheduled_days,
            "interval_days": interval_days,
            "due_date": next_due,
            "last_review": now
        }

fsrs_engine = FSRSScheduler()
