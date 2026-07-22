import math

from stock_dashboard.scoring import COMPLETENESS_FIELDS, score_stock


def complete_metrics(**overrides):
    data = {field: 1.0 for field in COMPLETENESS_FIELDS}
    data.update({"revenue": 100.0, "market_cap": 100.0})
    data.update(overrides)
    return data


def test_maximum_score_is_100():
    result = score_stock(complete_metrics(
        revenue_growth=0.25, earnings_growth=0.30, profit_margin=0.30,
        free_cash_flow=15, revenue=100, cash=20, debt=0, market_cap=100,
        forward_pe=10, price_to_sales=2, current_price=100, ma_50=90,
        ma_200=80, distance_from_52w_high=0,
    ))
    assert result["total"] == 100.0
    assert result["categories"] == {
        "Growth": 25.0, "Profitability and cash flow": 20.0,
        "Balance sheet": 15.0, "Valuation": 20.0,
        "Price trend": 10.0, "Data completeness": 10.0,
    }


def test_missing_values_are_zero_and_reduce_completeness():
    result = score_stock({})
    assert result["total"] == 0
    assert result["categories"]["Data completeness"] == 0
    assert all(points == 0 for category in result["details"].values() for points in category.values())


def test_forward_pe_is_preferred_and_trailing_is_fallback():
    forward = score_stock({"forward_pe": 40, "trailing_pe": 10})
    fallback = score_stock({"trailing_pe": 10})
    assert forward["details"]["Valuation"]["Forward P/E"] == 0
    assert fallback["details"]["Valuation"]["Trailing P/E (fallback)"] == 10


def test_thresholds_are_clamped_and_score_is_bounded():
    result = score_stock(complete_metrics(
        revenue_growth=99, earnings_growth=99, profit_margin=99,
        free_cash_flow=999, revenue=1, cash=999, debt=0, market_cap=1,
        forward_pe=-10, price_to_sales=-10, current_price=100,
        ma_50=1, ma_200=1, distance_from_52w_high=99,
    ))
    assert 0 <= result["total"] <= 100
    assert result["total"] == 100


def test_non_finite_values_are_treated_as_missing():
    result = score_stock({"revenue_growth": math.nan, "forward_pe": math.inf})
    assert result["categories"]["Growth"] == 0
    assert result["categories"]["Valuation"] == 0


def test_completeness_is_proportional_and_deterministic():
    result_a = score_stock({"current_price": 10})
    result_b = score_stock({"current_price": 10})
    expected = round(10 / len(COMPLETENESS_FIELDS), 2)
    assert result_a == result_b
    assert result_a["categories"]["Data completeness"] == expected

