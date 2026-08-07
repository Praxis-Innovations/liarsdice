import {
  getBreakpoint,
  getDiceBand,
  getPlatformMetrics,
  placeDiceOnPlatform,
} from "../dicePlatformLayout";

describe("getBreakpoint", () => {
  it("classifies phone, tablet, and laptop widths (Tailwind md/lg)", () => {
    expect(getBreakpoint(375)).toBe("phone");
    expect(getBreakpoint(767)).toBe("phone");
    expect(getBreakpoint(768)).toBe("tablet");
    expect(getBreakpoint(1023)).toBe("tablet");
    expect(getBreakpoint(1024)).toBe("laptop");
    expect(getBreakpoint(1440)).toBe("laptop");
  });
});

describe("getDiceBand", () => {
  it("always returns six dice", () => {
    expect(getDiceBand("phone", 390).count).toBe(6);
    expect(getDiceBand("tablet", 800).count).toBe(6);
    expect(getDiceBand("laptop", 1280).count).toBe(6);
  });

  it("shrinks dice as the viewport gets narrower", () => {
    const phone = getDiceBand("phone", 360);
    const tablet = getDiceBand("tablet", 800);
    const laptopWide = getDiceBand("laptop", 1400);
    const laptopNarrow = getDiceBand("laptop", 920);

    expect(phone.maxSize).toBeLessThan(tablet.maxSize);
    expect(tablet.maxSize).toBeLessThanOrEqual(laptopWide.maxSize);
    expect(laptopNarrow.maxSize).toBeLessThan(laptopWide.maxSize);
    expect(phone.minSize).toBeLessThanOrEqual(phone.maxSize);
  });
});

describe("getPlatformMetrics", () => {
  it("keeps phone/tablet platforms centered", () => {
    const phone = getPlatformMetrics(390, 700);
    expect(phone.left).toBeCloseTo((390 - phone.width) / 2, 5);
    expect(phone.surfaceTop).toBe(phone.top);

    const tablet = getPlatformMetrics(800, 800);
    expect(tablet.left).toBeCloseTo((800 - tablet.width) / 2, 5);
  });

  it("right-biases the laptop platform", () => {
    const laptop = getPlatformMetrics(1280, 800);
    expect(laptop.left).toBeGreaterThan(1280 * 0.35);
    expect(laptop.left + laptop.width).toBeLessThanOrEqual(1280);
    expect(laptop.surfaceTop).toBe(laptop.top);
  });
});

describe("placeDiceOnPlatform", () => {
  it("places six non-overlapping dice on a shared floor line", () => {
    const metrics = getPlatformMetrics(1280, 800);
    const band = getDiceBand("laptop", 1280);
    const placed = placeDiceOnPlatform(metrics, band.count, band.minSize, band.maxSize);

    expect(placed).toHaveLength(6);
    for (const die of placed) {
      expect(die.top + die.size).toBeCloseTo(metrics.surfaceTop, 5);
      expect(die.left).toBeGreaterThanOrEqual(metrics.left);
      expect(die.left + die.size).toBeLessThanOrEqual(metrics.left + metrics.width);
      expect(die.size).toBeLessThanOrEqual(band.maxSize);
    }

    const sorted = [...placed].sort((a, b) => a.left - b.left);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].left).toBeGreaterThanOrEqual(sorted[i - 1].left);
    }
  });

  it("caps die size to the platform slot width", () => {
    const metrics = getPlatformMetrics(390, 700);
    const placed = placeDiceOnPlatform(metrics, 6, 80, 120);
    const slotW = (metrics.width - 32) / 6;
    for (const die of placed) {
      expect(die.size).toBeLessThanOrEqual(slotW * 0.72 + 0.01);
    }
  });
});
