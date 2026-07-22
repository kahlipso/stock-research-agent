"""Market data retrieval and normalization using yfinance."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd
import yfinance as yf


SOURCE = "Yahoo Finance via yfinance"


def _valid(value: Any) -> Any:
    if value is None or value is pd.NA:
        return None
    try:
        return None if pd.isna(value) else value
    except (TypeError, ValueError):
        return value


def _price_change(close: pd.Series, months: int | None = None, years: int | None = None) -> float | None:
    if close.empty:
        return None
    target = close.index[-1] - (pd.DateOffset(months=months) if months else pd.DateOffset(years=years))
    prior = close.loc[close.index <= target]
    if prior.empty or not prior.iloc[-1]:
        return None
    return float(close.iloc[-1] / prior.iloc[-1] - 1)


def fetch_stock(ticker: str) -> dict[str, Any]:
    symbol = ticker.strip().upper()
    if not symbol:
        raise ValueError("Ticker cannot be empty")
    asset = yf.Ticker(symbol)
    history = asset.history(period="18mo", auto_adjust=False)
    if history.empty or "Close" not in history:
        raise ValueError(f"No price history returned for {symbol}")
    close = history["Close"].dropna()
    if close.empty:
        raise ValueError(f"No closing prices returned for {symbol}")
    try:
        info = asset.info or {}
    except Exception:
        info = {}

    current = float(close.iloc[-1])
    recent = close.tail(252)
    high_52w = float(recent.max()) if not recent.empty else None
    ma50 = float(close.tail(50).mean()) if len(close) >= 50 else None
    ma200 = float(close.tail(200).mean()) if len(close) >= 200 else None
    fields = {
        "ticker": symbol,
        "company_name": info.get("longName") or info.get("shortName") or symbol,
        "currency": info.get("currency"),
        "current_price": current,
        "change_1m": _price_change(close, months=1),
        "change_6m": _price_change(close, months=6),
        "change_1y": _price_change(close, years=1),
        "revenue_growth": _valid(info.get("revenueGrowth")),
        "earnings_growth": _valid(info.get("earningsGrowth")),
        "profit_margin": _valid(info.get("profitMargins")),
        "free_cash_flow": _valid(info.get("freeCashflow")),
        "revenue": _valid(info.get("totalRevenue")),
        "cash": _valid(info.get("totalCash")),
        "debt": _valid(info.get("totalDebt")),
        "market_cap": _valid(info.get("marketCap")),
        "trailing_pe": _valid(info.get("trailingPE")),
        "forward_pe": _valid(info.get("forwardPE")),
        "price_to_sales": _valid(info.get("priceToSalesTrailing12Months")),
        "ma_50": ma50,
        "ma_200": ma200,
        "high_52w": high_52w,
        "distance_from_52w_high": current / high_52w - 1 if high_52w else None,
        "price_as_of": close.index[-1].isoformat(),
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": SOURCE,
        "history": history,
    }
    return fields

