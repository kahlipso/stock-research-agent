"""Streamlit entry point for the local stock research dashboard."""

from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from stock_dashboard.data import fetch_stock
from stock_dashboard.formatting import money, number, percent
from stock_dashboard.scoring import COMPLETENESS_FIELDS, score_stock


DEFAULT_TICKERS = "NVDA, AMD, MSFT, AMZN, GOOGL, META, AVGO"

st.set_page_config(page_title="Stock Research Dashboard", layout="wide")
st.title("Stock Research Dashboard")
st.caption("Personal educational research only — this app does not execute trades or provide investment advice. A high score does not guarantee future returns.")


@st.cache_data(ttl=900, show_spinner=False)
def load_stock(ticker: str):
    return fetch_stock(ticker)


with st.sidebar:
    st.header("Watchlist")
    raw_tickers = st.text_area("Ticker symbols (comma-separated)", DEFAULT_TICKERS, height=120)
    refresh = st.button("Refresh data", type="primary", use_container_width=True)
    st.caption("Prototype data source: Yahoo Finance via yfinance. Cached for 15 minutes.")
if refresh:
    st.cache_data.clear()

tickers = list(dict.fromkeys(item.strip().upper() for item in raw_tickers.split(",") if item.strip()))
if not tickers:
    st.warning("Enter at least one ticker symbol.")
    st.stop()

records, errors = [], []
with st.spinner("Loading market and company data..."):
    for ticker in tickers:
        try:
            item = load_stock(ticker)
            item["score"] = score_stock(item)
            records.append(item)
        except Exception as exc:
            errors.append(f"{ticker}: {exc}")

for error in errors:
    st.warning(error)
if not records:
    st.error("No ticker data could be loaded. Check the symbols and your internet connection.")
    st.stop()

ranked = sorted(records, key=lambda row: (-row["score"]["total"], row["ticker"]))
st.subheader("Ranked watchlist")
table = pd.DataFrame([
    {
        "Rank": rank,
        "Ticker": row["ticker"],
        "Company": row["company_name"],
        "Score": row["score"]["total"],
        "Price": number(row["current_price"]),
        "1M": percent(row["change_1m"]),
        "6M": percent(row["change_6m"]),
        "1Y": percent(row["change_1y"]),
        "Revenue growth": percent(row["revenue_growth"]),
        "Profit margin": percent(row["profit_margin"]),
        "Forward P/E": number(row["forward_pe"]),
        "From 52W high": percent(row["distance_from_52w_high"]),
        "Price as of": row["price_as_of"],
    }
    for rank, row in enumerate(ranked, 1)
])
st.dataframe(table, hide_index=True, use_container_width=True)

selected = st.selectbox("Company details", [row["ticker"] for row in ranked])
stock = next(row for row in ranked if row["ticker"] == selected)
st.header(f"{stock['company_name']} ({stock['ticker']})")

cols = st.columns(5)
cols[0].metric("Current price", money(stock["current_price"], stock["currency"]))
cols[1].metric("1-month change", percent(stock["change_1m"]))
cols[2].metric("6-month change", percent(stock["change_6m"]))
cols[3].metric("1-year change", percent(stock["change_1y"]))
cols[4].metric("Research score", f"{stock['score']['total']:.2f} / 100")

left, right = st.columns([3, 2])
with left:
    st.subheader("Price and moving averages")
    history = stock["history"].dropna(subset=["Close"]).copy()
    history["MA 50"] = history["Close"].rolling(50).mean()
    history["MA 200"] = history["Close"].rolling(200).mean()
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=history.index, y=history["Close"], name="Close"))
    fig.add_trace(go.Scatter(x=history.index, y=history["MA 50"], name="50-day MA"))
    fig.add_trace(go.Scatter(x=history.index, y=history["MA 200"], name="200-day MA"))
    fig.update_layout(height=430, margin=dict(l=10, r=10, t=10, b=10), yaxis_title=stock["currency"] or "Price", hovermode="x unified")
    st.plotly_chart(fig, use_container_width=True)
with right:
    st.subheader("Fundamentals and valuation")
    detail_rows = [
        ("Revenue growth", percent(stock["revenue_growth"])),
        ("Earnings growth", percent(stock["earnings_growth"])),
        ("Profit margin", percent(stock["profit_margin"])),
        ("Free cash flow", money(stock["free_cash_flow"], stock["currency"])),
        ("Cash", money(stock["cash"], stock["currency"])),
        ("Debt", money(stock["debt"], stock["currency"])),
        ("Trailing P/E", number(stock["trailing_pe"])),
        ("Forward P/E", number(stock["forward_pe"])),
        ("Price / sales", number(stock["price_to_sales"])),
        ("50-day moving average", money(stock["ma_50"], stock["currency"])),
        ("200-day moving average", money(stock["ma_200"], stock["currency"])),
        ("Distance from 52-week high", percent(stock["distance_from_52w_high"])),
    ]
    st.dataframe(pd.DataFrame(detail_rows, columns=["Metric", "Value"]), hide_index=True, use_container_width=True)

st.subheader("Exact score breakdown")
breakdown = []
for category, parts in stock["score"]["details"].items():
    for metric, points in parts.items():
        breakdown.append({"Category": category, "Metric": metric, "Points": points})
st.dataframe(pd.DataFrame(breakdown), hide_index=True, use_container_width=True)
category_caps = {"Growth": 25, "Profitability and cash flow": 20, "Balance sheet": 15, "Valuation": 20, "Price trend": 10, "Data completeness": 10}
st.caption("Category totals: " + " · ".join(f"{name} {stock['score']['categories'][name]:.2f}/{cap}" for name, cap in category_caps.items()))

missing_fields = [field.replace("_", " ") for field in COMPLETENESS_FIELDS if stock.get(field) is None]
if missing_fields:
    st.warning("Missing data (shown as N/A and never estimated): " + ", ".join(missing_fields))
else:
    st.success("All displayed scoring fields are available.")
st.caption(f"Price date: {stock['price_as_of']} · Retrieved: {stock['fetched_at']} · Source: {stock['source']}. Fundamentals are the latest values supplied by the source and may have different reporting periods.")

with st.expander("Scoring methodology"):
    st.markdown("""
Scores are deterministic and capped. Linear interpolation is used between each stated worst/best threshold:

- **Growth (25):** revenue growth −10%→0 to 25%→12.5; earnings growth −20%→0 to 30%→12.5.
- **Profitability and cash flow (20):** profit margin −5%→0 to 30%→10; free-cash-flow margin 0%→0 to 15%→10.
- **Balance sheet (15):** net cash divided by market cap −50%→0 to 20%→15.
- **Valuation (20):** forward P/E 40→0 to 10→10 (trailing P/E fallback); price/sales 15→0 to 2→10.
- **Price trend (10):** 3 points above the 50-day average, 4 above the 200-day average, and 0–3 points for distance from the 52-week high (−50%→0 to 0%→3).
- **Data completeness (10):** proportion of the 16 displayed scoring fields available.

Values beyond threshold endpoints are capped. Missing values receive zero metric points; they are not invented. The score is a research organizer, not a prediction.
""")

