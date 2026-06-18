import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operation import Operation


def _date_range(year: int | None) -> tuple[datetime, datetime, date, date]:
    now = datetime.now(timezone.utc)
    if year is not None:
        start = datetime(year, 1, 1, tzinfo=timezone.utc)
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        # trailing 365 days, GitHub-style
        start = now - timedelta(days=365)
        end = now
    return start, end, start.date(), (end - timedelta(seconds=1)).date()


def _streaks(active: set[date], today: date) -> tuple[int, int]:
    if not active:
        return 0, 0

    ordered = sorted(active)
    longest = run = 1
    for prev, cur in zip(ordered, ordered[1:]):
        run = run + 1 if (cur - prev).days == 1 else 1
        longest = max(longest, run)

    # current streak counts back from today (or yesterday, if today isn't done yet)
    if today in active:
        anchor = today
    elif (today - timedelta(days=1)) in active:
        anchor = today - timedelta(days=1)
    else:
        return 0, longest

    current = 0
    day = anchor
    while day in active:
        current += 1
        day -= timedelta(days=1)
    return current, longest


async def get_user_activity(
    db: AsyncSession, user_id: uuid.UUID, *, year: int | None = None
) -> dict:
    start, end, from_date, to_date = _date_range(year)

    day_expr = func.date(Operation.created_at)
    stmt = (
        select(day_expr.label("day"), func.count().label("count"))
        .where(
            Operation.created_by == user_id,
            Operation.created_at >= start,
            Operation.created_at < end,
        )
        .group_by(day_expr)
        .order_by(day_expr)
    )
    rows = (await db.execute(stmt)).all()

    daily = [{"date": r.day, "count": r.count} for r in rows]
    active = {r.day for r in rows}
    today = datetime.now(timezone.utc).date()
    current_streak, longest_streak = _streaks(active, today)

    return {
        "from_date": from_date,
        "to_date": to_date,
        "total_contributions": sum(r.count for r in rows),
        "active_days": len(active),
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "daily": daily,
    }
