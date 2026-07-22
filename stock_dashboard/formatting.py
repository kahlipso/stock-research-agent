"""Presentation-only format helpers."""

from __future__ import annotations

import math
from typing import Any


def missing(value: Any) -> bool:
    return value is None or (isinstance(value, float) and not math.isfinite(value))


def number(value: Any, digits: int = 2) -> str:
    return "N/A" if missing(value) else f"{float(value):,.{digits}f}"


def percent(value: Any) -> str:
    return "N/A" if missing(value) else f"{float(value):+.1%}"


def money(value: Any, currency: str | None = None) -> str:
    if missing(value):
        return "N/A"
    amount = float(value)
    prefix = f"{currency or ''} "
    for divisor, suffix in ((1e12, "T"), (1e9, "B"), (1e6, "M")):
        if abs(amount) >= divisor:
            return f"{prefix}{amount / divisor:,.2f}{suffix}".strip()
    return f"{prefix}{amount:,.2f}".strip()
