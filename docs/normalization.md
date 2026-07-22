# Normalization

Defaults are 2.5/97.5 percentile winsorization and percentile ranks. A feature uses its industry when at least 10 observations exist, sector when at least 20 exist, otherwise the eligible universe. Ties receive a stable midrank. Lower-is-better features are reversed after ranking. Missing observations are omitted, never assigned zero. Stored output includes raw/winsorized value, percentile, peer type/value/size, direction, and calculation time.

Configuration version is `PERCENTILE_2_5_97_5_V1`. Winsor bounds are selected from the eligible cross-section before peer ranking. Industry applicability is applied before normalization. A one-member group receives the 50th percentile; this does not replace missing observations.
