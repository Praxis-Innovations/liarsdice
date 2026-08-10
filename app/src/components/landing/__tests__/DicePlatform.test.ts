import {
  buildHeroDiceSpecs,
  createSeededRng,
  getBreakpoint,
  getDiceBand,
  getHeroStageMetrics,
  getPlatformMetrics,
  isHeroDiceTossComplete,
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

describe("getHeroStageMetrics", () => {
  it("places phone dice at 80% of device height inside a full-height hero", () => {
    const vh = 1200;
    const header = 64;
    const stage = getHeroStageMetrics(390, vh, header);

    expect(stage.bp).toBe("phone");
    expect(stage.heroHeight).toBe(vh - header);
    expect(stage.flowBandHeight).toBe(stage.platform.surfaceTop);
    expect(stage.diceCanvasOffset).toBe(header);

    const diceScreenY = header + stage.platform.surfaceTop;
    expect(diceScreenY / vh).toBeCloseTo(0.8, 2);

    // Copy band is the space above the landing line → mid ≈ 40% of device.
    const copyMidScreen = header + (stage.flowBandHeight ?? 0) / 2;
    expect(copyMidScreen / vh).toBeCloseTo(0.4, 1);
  });

  it("grows the phone landing line with taller viewports", () => {
    const short = getHeroStageMetrics(390, 700, 64);
    const tall = getHeroStageMetrics(390, 1100, 64);
    expect(tall.platform.surfaceTop).toBeGreaterThan(short.platform.surfaceTop);
    expect(tall.flowBandHeight!).toBeGreaterThan(short.flowBandHeight!);
    expect(tall.heroHeight).toBeGreaterThan(short.heroHeight);
  });

  it("places tablet dice at 80% of device height like phone", () => {
    const vh = 900;
    const header = 64;
    const stage = getHeroStageMetrics(800, vh, header);
    const diceScreenY = header + stage.platform.surfaceTop;
    expect(stage.bp).toBe("tablet");
    expect(diceScreenY / vh).toBeCloseTo(0.8, 2);
    expect(stage.heroHeight).toBe(vh - header);
  });

  it("aligns laptop dice to the bottom of the centered copy block", () => {
    const vh = 1000;
    const header = 64;
    const stage = getHeroStageMetrics(1280, vh, header);
    const copyBlock = 400;
    const wrapperH = stage.contentTopPad + copyBlock + stage.contentBottomPad;
    const wrapperTop = (stage.heroHeight - wrapperH) / 2;
    const textBottom = wrapperTop + stage.contentTopPad + copyBlock;

    expect(stage.bp).toBe("laptop");
    expect(stage.justifyContent).toBe("center");
    expect(stage.flowBandHeight).toBeNull();
    expect(stage.diceSlotHeight).toBeNull();
    expect(stage.heroHeight).toBe(vh - header);
    expect(stage.platform.surfaceTop).toBeCloseTo(textBottom + 56, 0);
    // Dice sit below mid-hero (not mid-copy).
    expect(stage.platform.surfaceTop).toBeGreaterThan(stage.heroHeight * 0.5);
  });

  it("treats width=0 as phone so SSR matches the mobile layout PSI tests", () => {
    const stage = getHeroStageMetrics(0, 900, 64);
    expect(stage.layoutWidth).toBe(375);
    expect(stage.bp).toBe("phone");
  });

  it("keeps compact hero full-height while the copy band ends at 80%", () => {
    const vh = 800;
    const header = 64;
    const stage = getHeroStageMetrics(390, vh, header);
    expect(stage.heroHeight).toBe(vh - header);
    expect(stage.flowBandHeight).toBe(0.8 * vh - header);
    expect(stage.platform.surfaceTop).toBe(stage.flowBandHeight);
    // Breathing room below the landing line inside the hero.
    expect(stage.heroHeight).toBeGreaterThan(stage.platform.surfaceTop);
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

describe("isHeroDiceTossComplete", () => {
  it("gates the WebGL idle stop after the last die lands", () => {
    expect(isHeroDiceTossComplete(1.4, 0.44, 1.05)).toBe(false);
    expect(isHeroDiceTossComplete(1.49, 0.44, 1.05)).toBe(true);
  });
});
