# Normalization

Defaults are 2.5/97.5 percentile winsorization and percentile ranks. A feature uses its industry when at least 10 observations exist, sector when at least 20 exist, otherwise the eligible universe. Ties receive a stable midrank. Lower-is-better features are reversed after ranking. Missing observations are omitted, never assigned zero. Stored output includes raw/winsorized value, percentile, peer type/value/size, direction, and calculation time.
