import {
  fitDieInSeat,
  fitDieSize,
  getFeltBounds,
  layoutTableSeats,
  rimAngles,
  seatHeightForDie,
  seatWidthForCard,
  seatWidthForDie,
} from "../tableSeating";

describe("fitDieSize", () => {
  it("fits five dice in one row without exceeding max", () => {
    const size = fitDieSize(200, 5, 2, 8, 16);
    expect(size * 5 + 2 * 4).toBeLessThanOrEqual(200);
    expect(size).toBeLessThanOrEqual(16);
    expect(size).toBeGreaterThanOrEqual(8);
  });

  it("clamps to min on tiny widths", () => {
    expect(fitDieSize(40, 5, 2, 8, 16)).toBe(8);
  });
});

describe("seatWidthForDie / seatHeightForDie", () => {
  it("grows with die size", () => {
    expect(seatWidthForDie(28)).toBeGreaterThan(seatWidthForDie(20));
    expect(seatHeightForDie(28)).toBeGreaterThan(seatHeightForDie(20));
  });

  it("keeps a readable min card width even with tiny dice", () => {
    expect(seatWidthForCard(12, 5, 120)).toBeGreaterThanOrEqual(120);
  });
});

describe("fitDieInSeat", () => {
  it("returns a die that fits a single row in the card", () => {
    const w = 130;
    const fitted = fitDieInSeat(w, 80, 5, 5, 14, 8);
    expect(fitted).toBeLessThanOrEqual(14);
    expect(seatWidthForDie(fitted, 5)).toBeLessThanOrEqual(w);
  });
});

function noOverlap(
  seats: { x: number; y: number; width: number; height: number }[],
  gap = 2,
): boolean {
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      const a = seats[i];
      const b = seats[j];
      const overlap = !(
        a.x + a.width + gap <= b.x ||
        b.x + b.width + gap <= a.x ||
        a.y + a.height + gap <= b.y ||
        b.y + b.height + gap <= a.y
      );
      if (overlap) return false;
    }
  }
  return true;
}

describe("getFeltBounds", () => {
  it("fills most of the arena", () => {
    const felt = getFeltBounds(400, 500, "roomy");
    expect(felt.width / 400).toBeGreaterThan(0.85);
    expect(felt.height / 500).toBeGreaterThan(0.85);
  });
});

describe("rimAngles", () => {
  it("puts human at bottom (-π/2)", () => {
    const angles = rimAngles(6, 0);
    expect(angles[0]).toBeCloseTo(-Math.PI / 2, 5);
  });

  it("spaces players equally around the circumference", () => {
    const angles = rimAngles(5, 0);
    expect(angles).toHaveLength(5);
    expect(angles[0]).toBeCloseTo(-Math.PI / 2, 5);
    const step = (2 * Math.PI) / 5;
    for (let i = 1; i < angles.length; i++) {
      let delta = angles[i] - angles[i - 1];
      while (delta < 0) delta += 2 * Math.PI;
      while (delta >= 2 * Math.PI) delta -= 2 * Math.PI;
      expect(delta).toBeCloseTo(step, 5);
    }
  });

  it("keeps equal spacing when human is not index 0", () => {
    const angles = rimAngles(4, 2);
    expect(angles[2]).toBeCloseTo(-Math.PI / 2, 5);
    const step = Math.PI / 2;
    const sorted = [...angles].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i] - sorted[i - 1]).toBeCloseTo(step, 5);
    }
  });
});

describe("layoutTableSeats", () => {
  it("returns empty for invalid inputs", () => {
    expect(layoutTableSeats(400, 300, 0)).toEqual([]);
    expect(layoutTableSeats(0, 300, 2)).toEqual([]);
  });

  it("places human on the bottom of the felt rim", () => {
    const w = 400;
    const h = 360;
    const seats = layoutTableSeats(w, h, 2, 0, { sizeTier: "regular" });
    const felt = getFeltBounds(w, h, "regular");
    const human = seats.find((s) => s.isHuman)!;
    const humanCenterY = human.y + human.height / 2;
    // Human center should sit near the felt bottom rim.
    expect(humanCenterY).toBeGreaterThan(felt.cy + felt.ry * 0.55);
    expect(human.x + human.width / 2).toBeCloseTo(felt.cx, -1);
  });

  it("seats everyone including human for 6 players without overlap", () => {
    const w = 390;
    const h = 420;
    const seats = layoutTableSeats(w, h, 6, 0, { sizeTier: "compact" });
    expect(seats).toHaveLength(6);
    expect(seats.filter((s) => s.isHuman)).toHaveLength(1);
    expect(noOverlap(seats)).toBe(true);
    for (const s of seats) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.x + s.width).toBeLessThanOrEqual(w);
      expect(s.y + s.height).toBeLessThanOrEqual(h);
      expect(s.diceColumns).toBe(5);
    }
  });

  it.each([2, 3, 4, 5, 6] as const)("keeps %i seats inside phone arena without overlap", (n) => {
    const w = 390;
    const h = 480;
    const seats = layoutTableSeats(w, h, n, 0, { sizeTier: "compact" });
    expect(seats).toHaveLength(n);
    expect(noOverlap(seats)).toBe(true);
  });

  it("keeps equal rim radius for all seats on phone (no uneven clamping)", () => {
    const w = 390;
    const h = 480;
    const seats = layoutTableSeats(w, h, 5, 0, { sizeTier: "compact" });
    const felt = getFeltBounds(w, h, "compact");
    const radii = seats.map((s) => {
      const cx = s.x + s.width / 2;
      const cy = s.y + s.height / 2;
      const dx = (cx - felt.cx) / felt.rx;
      const dy = (cy - felt.cy) / felt.ry;
      return Math.hypot(dx, dy);
    });
    const avg = radii.reduce((a, b) => a + b, 0) / radii.length;
    for (const r of radii) {
      expect(Math.abs(r - avg)).toBeLessThan(0.08);
    }
  });

  it("keeps opponent seats wide enough for names at 6p", () => {
    const seats = layoutTableSeats(390, 480, 6, 0, {
      maxDieSize: 15,
      minSeatWidth: 148,
      sizeTier: "compact",
    });
    const opp = seats.find((s) => !s.isHuman)!;
    // May shrink below the preferred floor to clear rim overlaps.
    expect(opp.width).toBeGreaterThanOrEqual(90);
    expect(opp.dieSize).toBeLessThanOrEqual(15);
  });

  it("keeps opponent dice smaller and your dice larger", () => {
    const seats = layoutTableSeats(600, 500, 4, 0, {
      maxDieSize: 15,
      minSeatWidth: 172,
      sizeTier: "regular",
    });
    const human = seats.find((s) => s.isHuman)!;
    const opp = seats.find((s) => !s.isHuman)!;
    expect(opp.dieSize).toBeLessThanOrEqual(15);
    expect(human.dieSize).toBeGreaterThan(opp.dieSize);
    expect(human.width).toBeGreaterThanOrEqual(opp.width);
    expect(human.diceColumns).toBe(5);
  });

  it("respects a non-zero human index", () => {
    const seats = layoutTableSeats(500, 400, 3, 2);
    expect(seats.find((s) => s.playerIndex === 2)?.isHuman).toBe(true);
    expect(seats.filter((s) => s.isHuman)).toHaveLength(1);
  });

  it("assigns outwardAlign to every seat with center for human", () => {
    const seats = layoutTableSeats(390, 480, 4, 0, { sizeTier: "compact" });
    for (const s of seats) {
      expect(["left", "right", "center"]).toContain(s.outwardAlign);
    }
    const human = seats.find((s) => s.isHuman)!;
    expect(human.outwardAlign).toBe("center");
  });

  it("gives left-side opponents left align and right-side opponents right align", () => {
    const seats = layoutTableSeats(390, 480, 4, 0, { sizeTier: "compact" });
    const opponents = seats.filter((s) => !s.isHuman);
    const felt = getFeltBounds(390, 480, "compact");
    for (const opp of opponents) {
      const cx = opp.x + opp.width / 2;
      if (cx > felt.cx + 20) {
        expect(opp.outwardAlign).toBe("right");
      } else if (cx < felt.cx - 20) {
        expect(opp.outwardAlign).toBe("left");
      }
    }
  });
});
