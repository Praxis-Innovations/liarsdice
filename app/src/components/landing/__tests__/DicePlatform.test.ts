import {
  buildHeroDiceSpecs,
  createSeededRng,
  getBreakpoint,
  getDiceBand,
  getHeroStageMetrics,
  getPlatformMetrics,
  placeDiceOnPlatform,
  resolveLayoutWidth,
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

describe("resolveLayoutWidth", () => {
  it("falls back to a phone width when the viewport is unknown", () => {
    expect(resolveLayoutWidth(0)).toBe(375);
    expect(resolveLayoutWidth(-1)).toBe(375);
    expect(resolveLayoutWidth(390)).toBe(390);
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
  it("keeps platforms centered on all breakpoints", () => {
    const phone = getPlatformMetrics(390, 700);
    expect(phone.left).toBeCloseTo((390 - phone.width) / 2, 5);
    expect(phone.surfaceTop).toBe(phone.top);

    const tablet = getPlatformMetrics(800, 800);
    expect(tablet.left).toBeCloseTo((800 - tablet.width) / 2, 5);

    const laptop = getPlatformMetrics(1280, 800);
    expect(laptop.left).toBeCloseTo((1280 - laptop.width) / 2, 5);
    expect(laptop.surfaceTop).toBe(laptop.top);
  });
});

describe("getHeroStageMetrics", () => {
  it("pins dice near the bottom of the hero on phone", () => {
    const vh = 1200;
    const header = 64;
    const stage = getHeroStageMetrics(390, vh, header);

    expect(stage.bp).toBe("phone");
    expect(stage.heroHeight).toBe(vh - header);
    expect(stage.diceLineY).toBe(stage.heroHeight - 48);
    expect(stage.platform.surfaceTop).toBe(stage.diceLineY);
  });

  it("grows hero height with taller viewports", () => {
    const short = getHeroStageMetrics(390, 700, 64);
    const tall = getHeroStageMetrics(390, 1100, 64);
    expect(tall.diceLineY).toBeGreaterThan(short.diceLineY);
    expect(tall.heroHeight).toBeGreaterThan(short.heroHeight);
  });

  it("pins dice near the bottom on tablet", () => {
    const vh = 900;
    const header = 64;
    const stage = getHeroStageMetrics(800, vh, header);
    expect(stage.bp).toBe("tablet");
    expect(stage.diceLineY).toBe(stage.heroHeight - 56);
    expect(stage.heroHeight).toBe(vh - header);
  });

  it("pins dice near the bottom on laptop", () => {
    const vh = 1000;
    const header = 64;
    const stage = getHeroStageMetrics(1280, vh, header);
    expect(stage.bp).toBe("laptop");
    expect(stage.diceLineY).toBe(stage.heroHeight - 64);
    expect(stage.heroHeight).toBe(vh - header);
  });

  it("treats width=0 as phone so SSR matches the mobile layout PSI tests", () => {
    const stage = getHeroStageMetrics(0, 900, 64);
    expect(stage.layoutWidth).toBe(375);
    expect(stage.bp).toBe("phone");
  });

  it("enforces minimum hero height", () => {
    const phone = getHeroStageMetrics(390, 200, 64);
    expect(phone.heroHeight).toBe(640);

    const tablet = getHeroStageMetrics(800, 200, 64);
    expect(tablet.heroHeight).toBe(560);
  });
});

describe("placeDiceOnPlatform", () => {
  it("places six non-overlapping dice on a shared floor line", () => {
    const metrics = getPlatformMetrics(1280, 800);
    const band = getDiceBand("laptop", 1280);
    const placed = placeDiceOnPlatform(
      metrics,
      band.count,
      band.minSize,
      band.maxSize,
      createSeededRng(42),
    );

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

  it("is deterministic for a seeded RNG", () => {
    const metrics = getPlatformMetrics(390, 700);
    const a = placeDiceOnPlatform(metrics, 6, 28, 34, createSeededRng(99));
    const b = placeDiceOnPlatform(metrics, 6, 28, 34, createSeededRng(99));
    expect(a).toEqual(b);
  });

  it("caps die size to the platform slot width", () => {
    const metrics = getPlatformMetrics(390, 700);
    const placed = placeDiceOnPlatform(metrics, 6, 80, 120, createSeededRng(1));
    const slotW = (metrics.width - 32) / 6;
    for (const die of placed) {
      expect(die.size).toBeLessThanOrEqual(slotW * 0.72 + 0.01);
    }
  });
});

describe("buildHeroDiceSpecs", () => {
  it("builds six stable specs for a given seed", () => {
    const stage = getHeroStageMetrics(390, 800, 64);
    const band = getDiceBand(stage.bp, stage.layoutWidth);
    const a = buildHeroDiceSpecs(stage.platform, band, stage.heroHeight, 64, 3901);
    const b = buildHeroDiceSpecs(stage.platform, band, stage.heroHeight, 64, 3901);

    expect(a).toHaveLength(6);
    expect(a).toEqual(b);
    for (const die of a) {
      expect(die.face).toBeGreaterThanOrEqual(1);
      expect(die.face).toBeLessThanOrEqual(6);
      expect(die.top + die.size).toBeCloseTo(stage.platform.surfaceTop, 5);
    }
  });
});
