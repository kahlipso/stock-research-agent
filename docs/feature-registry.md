# Feature registry

`lib/research/features.ts` is the typed source of truth for feature key, label, description, factor, direction, unit, required observations/periods, security and industry applicability, formula version, and missing-data policy. Calculators and presentation code consume this registry. Missing and inapplicable values remain null with a reason; they are never imputed. All initial formulas are version `1.0.0`.

Ratio calculations reject denominators within `1e-9` of zero. Growth requires a positive base. EPS growth additionally requires positive current EPS, so movement between losses is not ordinary positive growth. Momentum uses chronologically ordered adjusted-close trading observations without interpolation.
