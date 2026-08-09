import {
  centerSeatCluster,
  evenVerticalRimVectors,
  fitDieInSeat,
  fitDieSize,
  getFeltBounds,
  layoutTableSeats,
  openCenterFromSeats,
  rimAngles,
  seatHeightForDie,
  seatWidthForCard,
  seatWidthForDie,
  stretchFeltVertically,
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

  it("spaces players equally clockwise around the circumference", () => {
    const angles = rimAngles(5, 0);
    expect(angles).toHaveLength(5);
    expect(angles[0]).toBeCloseTo(-Math.PI / 2, 5);
    const step = (2 * Math.PI) / 5;
    for (let i = 1; i < angles.length; i++) {
      // Clockwise from human = decreasing math angle.
      let delta = angles[i - 1] - angles[i];
      while (delta < 0) delta += 2 * Math.PI;
      while (delta >= 2 * Math.PI) delta -= 2 * Math.PI;
      expect(delta).toBeCloseTo(step, 5);
    }
  });

  it("places the next seat to human's left (pass-left / clockwise from above)", () => {
    const vectors = evenVerticalRimVectors(rimAngles(6, 0));
    expect(vectors[0].ny).toBeGreaterThan(0.5); // human at bottom
    expect(vectors[1].nx).toBeLessThan(0); // next player on the left
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

describe("evenVerticalRimVectors", () => {
  it("equalizes the wide mid gap for 6 players", () => {
    const vectors = evenVerticalRimVectors(rimAngles(6, 0));
    const bands = [...new Set(vectors.map((v) => Math.round(v.ny * 1000) / 1000))].sort(
      (a, b) => a - b,
    );
    expect(bands).toHaveLength(4);
    const gaps = bands.slice(1).map((y, i) => y - bands[i]);
    for (const g of gaps) {
      expect(Math.abs(g - gaps[0])).toBeLessThan(0.02);
    }
  });

  it("keeps 3-player opponents on the upper sides, not clustered at the top", () => {
    const vectors = evenVerticalRimVectors(rimAngles(3, 0));
    expect(vectors[0].ny).toBeGreaterThan(0.5); // human bottom
    const left = vectors[1];
    const right = vectors[2];
    expect(left.nx).toBeLessThan(-0.75);
    expect(right.nx).toBeGreaterThan(0.75);
    expect(left.ny).toBeCloseTo(-0.55, 2);
    expect(right.ny).toBeCloseTo(-0.55, 2);
  });

  it("keeps points on the unit ellipse", () => {
    for (const n of [2, 3, 4, 5, 6]) {
      for (const v of evenVerticalRimVectors(rimAngles(n, 0))) {
        expect(v.nx * v.nx + v.ny * v.ny).toBeCloseTo(1, 5);
      }
    }
  });
});

describe("layoutTableSeats 3-player", () => {
  it("puts opponents left and right of center, not both at the top", () => {
    const w = 700;
    const h = 500;
    const { seats } = layoutTableSeats(w, h, 3, 0, { sizeTier: "roomy" });
    const human = seats.find((s) => s.isHuman)!;
    const opponents = seats.filter((s) => !s.isHuman);
    expect(opponents).toHaveLength(2);
    const humanCx = human.x + human.width / 2;
    const humanCy = human.y + human.height / 2;
    const [a, b] = opponents.map((s) => ({
      cx: s.x + s.width / 2,
      cy: s.y + s.height / 2,
    }));
    expect(Math.min(a.cx, b.cx)).toBeLessThan(humanCx - 80);
    expect(Math.max(a.cx, b.cx)).toBeGreaterThan(humanCx + 80);
    // Clear left/right spread — not both clustered near the top center.
    expect(Math.abs(a.cx - b.cx)).toBeGreaterThan(w * 0.45);
    expect(Math.min(a.cy, b.cy)).toBeLessThan(humanCy);
  });

  it("balances leftover top and bottom margin instead of dumping slack on one side", () => {
    const h = 500;
    const padding = 8;
    const { seats } = layoutTableSeats(700, h, 3, 0, { sizeTier: "roomy", padding });
    const top = Math.min(...seats.map((s) => s.y));
    const bottom = Math.max(...seats.map((s) => s.y + s.height));
    expect(Math.abs(top - (h - bottom))).toBeLessThan(3);
  });

  it("stretches the felt oval vertically so the center is not a flat strip", () => {
    const { felt } = layoutTableSeats(900, 420, 3, 0, { sizeTier: "roomy" });
    expect(felt).not.toBeNull();
    expect(felt!.rx / felt!.ry).toBeLessThanOrEqual(2.0);
    expect(felt!.ry).toBeGreaterThan(130);
  });
});

describe("layoutTableSeats 2-player", () => {
  it("keeps a visible felt oval (not a collapsed vertical line)", () => {
    const { felt, seats } = layoutTableSeats(900, 420, 2, 0, { sizeTier: "roomy" });
    expect(felt).not.toBeNull();
    expect(seats).toHaveLength(2);
    expect(felt!.rx).toBeGreaterThan(120);
    expect(felt!.ry).toBeGreaterThan(80);
    expect(felt!.rx / felt!.ry).toBeGreaterThan(0.5);
  });
});

describe("stretchFeltVertically", () => {
  it("grows ry toward the target aspect without leaving the arena", () => {
    const flat = {
      cx: 200,
      cy: 200,
      rx: 180,
      ry: 60,
      x: 20,
      y: 140,
      width: 360,
      height: 120,
    };
    const stretched = stretchFeltVertically(flat, 400, 8, 2.2);
    expect(stretched.ry).toBeGreaterThan(flat.ry);
    expect(stretched.ry).toBeCloseTo(180 / 2.2, 5);
    expect(stretched.y).toBeGreaterThanOrEqual(8);
    expect(stretched.y + stretched.height).toBeLessThanOrEqual(400 - 8);
  });
});

describe("openCenterFromSeats", () => {
  it("keeps the open center clear of the human seat on a 3-player table", () => {
    const w = 900;
    const h = 420;
    const { seats, felt } = layoutTableSeats(w, h, 3, 0, { sizeTier: "roomy" });
    expect(felt).not.toBeNull();
    const open = openCenterFromSeats(felt!, seats, felt!.width * 0.06, felt!.height * 0.06, 10);
    const human = seats.find((s) => s.isHuman)!;
    expect(open.y + open.height).toBeLessThanOrEqual(human.y);
    expect(open.width).toBeGreaterThan(120);
    expect(open.height).toBeGreaterThan(80);
  });
});

describe("centerSeatCluster", () => {
  it("equalizes leftover top and bottom margin", () => {
    const seats = [
      {
        x: 100,
        y: 40,
        width: 120,
        height: 50,
        dieSize: 12,
        playerIndex: 1,
        isHuman: false,
        diceColumns: 5,
      },
      {
        x: 80,
        y: 200,
        width: 160,
        height: 70,
        dieSize: 16,
        playerIndex: 0,
        isHuman: true,
        diceColumns: 5,
      },
    ];
    const { seats: centered } = centerSeatCluster(seats, 390, 480, 6);
    const top = Math.min(...centered.map((s) => s.y));
    const bottom = Math.max(...centered.map((s) => s.y + s.height));
    expect(Math.abs(top - (480 - bottom))).toBeLessThan(1);
  });
});

describe("layoutTableSeats", () => {
  it("returns empty for invalid inputs", () => {
    expect(layoutTableSeats(400, 300, 0).seats).toEqual([]);
    expect(layoutTableSeats(0, 300, 2).seats).toEqual([]);
  });

  it("places human on the bottom of the felt rim", () => {
    const w = 400;
    const h = 360;
    const { seats, felt } = layoutTableSeats(w, h, 2, 0, { sizeTier: "regular" });
    expect(felt).not.toBeNull();
    const human = seats.find((s) => s.isHuman)!;
    const humanCenterY = human.y + human.height / 2;
    // Human center should sit near the felt bottom rim.
    expect(humanCenterY).toBeGreaterThan(felt!.cy + felt!.ry * 0.55);
    expect(human.x + human.width / 2).toBeCloseTo(felt!.cx, -1);
  });

  it("seats everyone including human for 6 players without overlap", () => {
    const w = 390;
    const h = 420;
    const { seats } = layoutTableSeats(w, h, 6, 0, { sizeTier: "compact" });
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
    const { seats } = layoutTableSeats(w, h, n, 0, { sizeTier: "compact" });
    expect(seats).toHaveLength(n);
    expect(noOverlap(seats)).toBe(true);
  });

  it("keeps equal rim radius for all seats on phone (no uneven clamping)", () => {
    const w = 390;
    const h = 480;
    const { seats, felt } = layoutTableSeats(w, h, 5, 0, { sizeTier: "compact" });
    expect(felt).not.toBeNull();
    const radii = seats.map((s) => {
      const cx = s.x + s.width / 2;
      const cy = s.y + s.height / 2;
      const dx = (cx - felt!.cx) / felt!.rx;
      const dy = (cy - felt!.cy) / felt!.ry;
      return Math.hypot(dx, dy);
    });
    const avg = radii.reduce((a, b) => a + b, 0) / radii.length;
    for (const r of radii) {
      expect(Math.abs(r - avg)).toBeLessThan(0.08);
    }
  });

  it("balances equal top and bottom edge gaps across aspect ratios", () => {
    for (const h of [360, 420, 520, 640]) {
      const { seats } = layoutTableSeats(390, h, 6, 0, { sizeTier: "compact" });
      const top = Math.min(...seats.map((s) => s.y));
      const bottom = Math.max(...seats.map((s) => s.y + s.height));
      expect(Math.abs(top - (h - bottom))).toBeLessThan(2);
    }
  });

  it("draws the felt oval through seat centers (no detached top rail)", () => {
    const { seats, felt } = layoutTableSeats(390, 480, 6, 0, { sizeTier: "compact" });
    expect(felt).not.toBeNull();
    const top = seats.reduce((a, b) => (a.y < b.y ? a : b));
    const topCenterY = top.y + top.height / 2;
    // Top seat center should sit on the felt's top rim.
    expect(Math.abs(topCenterY - (felt!.cy - felt!.ry))).toBeLessThan(6);
  });

  it("keeps vertical row gaps even for 6 players", () => {
    const { seats, felt } = layoutTableSeats(390, 480, 6, 0, { sizeTier: "compact" });
    expect(felt).not.toBeNull();
    const bandYs = [
      ...new Set(
        seats.map((s) => Math.round((s.y + s.height / 2 - felt!.cy) / felt!.ry / 0.05) * 0.05),
      ),
    ].sort((a, b) => a - b);
    expect(bandYs.length).toBeGreaterThanOrEqual(3);
    const gaps = bandYs.slice(1).map((y, i) => y - bandYs[i]);
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    for (const g of gaps) {
      expect(Math.abs(g - avg) / avg).toBeLessThan(0.15);
    }
  });

  it("keeps opponent seats wide enough for names at 6p", () => {
    const { seats } = layoutTableSeats(390, 480, 6, 0, {
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
    const { seats } = layoutTableSeats(600, 500, 4, 0, {
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
    const { seats } = layoutTableSeats(500, 400, 3, 2);
    expect(seats.find((s) => s.playerIndex === 2)?.isHuman).toBe(true);
    expect(seats.filter((s) => s.isHuman)).toHaveLength(1);
  });
});
