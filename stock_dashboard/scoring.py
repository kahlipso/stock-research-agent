"""Deterministic, UI-independent stock scoring rules."""

from __future__ import annotations

from math import isfinite
from typing import Any


def _number(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if isfinite(result) else None


def _linear(value: Any, low: float, high: float, points: float, *, inverse: bool = False) -> float:
    number = _number(value)
    if number is None:
        return 0.0
    ratio = (number - low) / (high - low)
    if inverse:
        ratio = 1 - ratio
    return round(max(0.0, min(1.0, ratio)) * points, 2)


COMPLETENESS_FIELDS = (
    "current_price", "change_1m", "change_6m", "change_1y",
    "revenue_growth", "earnings_growth", "profit_margin", "free_cash_flow",
    "cash", "debt", "trailing_pe", "forward_pe", "price_to_sales",
    "ma_50", "ma_200", "distance_from_52w_high",
)


def score_stock(metrics: dict[str, Any]) -> dict[str, Any]:
    """Return an exact 0-100 score and its component-level audit trail.

    Rates are decimals (0.20 means 20%). Currency inputs must use the same unit.
    Missing/non-finite values receive zero metric points and reduce completeness.
    """
    details: dict[str, dict[str, float]] = {}

    details["Growth"] = {
        "Revenue growth": _linear(metrics.get("revenue_growth"), -0.10, 0.25, 12.5),
        "Earnings growth": _linear(metrics.get("earnings_growth"), -0.20, 0.30, 12.5),
    }

    fcf = _number(metrics.get("free_cash_flow"))
    revenue = _number(metrics.get("revenue"))
    fcf_margin = fcf / revenue if fcf is not None and revenue and revenue > 0 else None
    details["Profitability and cash flow"] = {
        "Profit margin": _linear(metrics.get("profit_margin"), -0.05, 0.30, 10),
        "Free cash flow margin": _linear(fcf_margin, 0.0, 0.15, 10),
    }

    cash, debt, market_cap = (_number(metrics.get(k)) for k in ("cash", "debt", "market_cap"))
    net_cash_ratio = ((cash - debt) / market_cap
                      if cash is not None and debt is not None and market_cap and market_cap > 0 else None)
    details["Balance sheet"] = {
        "Net cash / market cap": _linear(net_cash_ratio, -0.50, 0.20, 15),
    }

    # Forward P/E is preferred; trailing P/E is a transparent fallback.
    pe = _number(metrics.get("forward_pe"))
    pe_source = "Forward P/E"
    if pe is None:
        pe = _number(metrics.get("trailing_pe"))
        pe_source = "Trailing P/E (fallback)"
    details["Valuation"] = {
        pe_source: _linear(pe, 10, 40, 10, inverse=True),
        "Price / sales": _linear(metrics.get("price_to_sales"), 2, 15, 10, inverse=True),
    }

    price = _number(metrics.get("current_price"))
    ma50, ma200 = _number(metrics.get("ma_50")), _number(metrics.get("ma_200"))
    details["Price trend"] = {
        "Price vs 50-day average": 3.0 if price is not None and ma50 is not None and price >= ma50 else 0.0,
        "Price vs 200-day average": 4.0 if price is not None and ma200 is not None and price >= ma200 else 0.0,
        "Distance from 52-week high": _linear(metrics.get("distance_from_52w_high"), -0.50, 0.0, 3),
    }

    present = sum(_number(metrics.get(field)) is not None for field in COMPLETENESS_FIELDS)
    details["Data completeness"] = {
        f"Available fields ({present}/{len(COMPLETENESS_FIELDS)})": round(10 * present / len(COMPLETENESS_FIELDS), 2)
    }

    categories = {name: round(sum(parts.values()), 2) for name, parts in details.items()}
    total = round(min(100.0, max(0.0, sum(categories.values()))), 2)
    return {"total": total, "categories": categories, "details": details}

