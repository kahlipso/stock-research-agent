# Data lineage

Every new provider record carries provider, source identifier, retrieval time, effective time, publication time, and mock status. Prices preserve observation/effective time separately from retrieval. Facts preserve reporting period, publication date, and retrieval date; historical calculations must require both `publishedAt <= asOf` and `retrievedAt <= asOf`. Restatements create distinguishable observations and must not rewrite old feature snapshots.

SEC EDGAR is the intended official fundamentals source. The existing Yahoo integration is unofficial and delayed; it must not be described as real-time. Missing values remain null. Production ranking queries require `FactorScoreSnapshot.isMock = false`.
