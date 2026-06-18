from datetime import date

from pydantic import BaseModel


class ActivityDay(BaseModel):
    date: date
    count: int


class ActivitySummary(BaseModel):
    from_date: date
    to_date: date
    total_contributions: int
    active_days: int
    current_streak: int
    longest_streak: int
    daily: list[ActivityDay]
