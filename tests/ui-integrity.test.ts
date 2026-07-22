import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("UI integrity guards", () => {
  it("keeps mock-data labels visible", () => expect(source("components/ui/mock-banner.tsx")).toContain("Mock data:"));
  it("includes textual positive and negative daily-change formatting", () => {
    const table = source("components/dashboard/watchlist-table.tsx");
    expect(table).toContain("formatSignedCurrency"); expect(table).toContain(") today");
  });
  it("makes score breakdown accessible with native details", () => expect(source("components/dashboard/watchlist-table.tsx")).toContain("<details"));
  it("does not use the original blue-tinted dark surfaces", () => {
    const css = source("app/globals.css"); expect(css).not.toContain("#09111f"); expect(css).not.toContain("#111c2d");
  });
  it("uses linear, nonanimated chart lines without smoothing", () => {
    const chart = source("components/charts/price-chart.tsx");
    expect(chart).toContain('type="linear"'); expect(chart).toContain("isAnimationActive={false}"); expect(chart).not.toContain('type="monotone"');
  });
});
