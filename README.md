<<<<<<< HEAD
# Local Stock Research Dashboard

A local Streamlit prototype for comparing a personal stock watchlist with Yahoo Finance data through `yfinance`. It shows market performance, company fundamentals, moving averages, valuation metrics, missing-data warnings, and a deterministic 0–100 research score.

This project is for personal educational research only. It does not execute trades or provide investment advice, and a high score does not guarantee future returns. Yahoo Finance fields can be delayed, incomplete, or reported over differing periods. Missing values remain `N/A` and are never estimated.

## Requirements

- Python 3.10 or newer
- Internet access while the dashboard retrieves data

## Setup (PowerShell on Windows)

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If Python 3.12 is not installed, replace `py -3.12` with `python` (Python 3.10+).

## Run

```powershell
streamlit run app.py
```

Streamlit prints the local URL, normally `http://localhost:8501`. Enter comma-separated ticker symbols in the sidebar and use **Refresh data** to clear the 15-minute cache.

## Test

```powershell
python -m pytest
```

The tests cover scoring thresholds, caps, missing and non-finite values, completeness, P/E fallback behavior, score bounds, and repeatability. Scoring lives in `stock_dashboard/scoring.py`, fully separate from the Streamlit interface.

## Scoring summary

| Category | Maximum |
|---|---:|
| Growth | 25 |
| Profitability and cash flow | 20 |
| Balance sheet | 15 |
| Valuation | 20 |
| Price trend | 10 |
| Data completeness | 10 |

The dashboard's **Scoring methodology** panel states every threshold and interpolation rule, and its score table exposes every awarded point. Forward P/E is preferred; trailing P/E is used only as an explicitly labeled fallback. Missing inputs receive zero points for the affected metric and also reduce completeness.

## Data dates and sources

Every company view displays the last price observation date, UTC retrieval timestamp, and source. Prices and derived moving averages/returns come from downloaded history. Fundamental and valuation fields are the latest values returned by Yahoo Finance through `yfinance`; their underlying statement dates may differ.

=======
# stock-research-agent
>>>>>>> 51453eae793196f81ee43ea5cab58518aa42e957
