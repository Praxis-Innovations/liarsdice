import { probabilityAtLeast, probabilityExact, expectedCount, probabilityAtLeastWithKnown } from '../probability';

describe('probabilityAtLeast', () => {
  it('returns 1 when count is 0 or negative', () => {
    expect(probabilityAtLeast(0, 2, 10, false)).toBe(1);
    expect(probabilityAtLeast(-1, 2, 10, false)).toBe(1);
  });

  it('returns 0 when count exceeds total dice', () => {
    expect(probabilityAtLeast(11, 2, 10, false)).toBe(0);
  });

  it('calculates correct probability for simple case without wilds', () => {
    const prob = probabilityAtLeast(1, 3, 1, false);
    expect(prob).toBeCloseTo(1 / 6, 4);
  });

  it('calculates higher probability with ones wild for non-one face', () => {
    const probNoWild = probabilityAtLeast(1, 3, 1, false);
    const probWild = probabilityAtLeast(1, 3, 1, true);
    expect(probWild).toBeGreaterThan(probNoWild);
    expect(probWild).toBeCloseTo(2 / 6, 4);
  });

  it('ones wild does not boost probability for bidding on ones', () => {
    const probNoWild = probabilityAtLeast(1, 1, 1, false);
    const probWild = probabilityAtLeast(1, 1, 1, true);
    expect(probWild).toBeCloseTo(probNoWild, 4);
  });

  it('expected count is totalDice/6 without wilds', () => {
    const expected = expectedCount(3, 30, false);
    expect(expected).toBeCloseTo(5, 4);
  });

  it('expected count is totalDice/3 with wilds for non-one face', () => {
    const expected = expectedCount(3, 30, true);
    expect(expected).toBeCloseTo(10, 4);
  });
});

describe('probabilityExact', () => {
  it('returns correct probability for exactly 0 out of 1 die', () => {
    const prob = probabilityExact(0, 3, 1, false);
    expect(prob).toBeCloseTo(5 / 6, 4);
  });

  it('returns correct probability for exactly 1 out of 1 die', () => {
    const prob = probabilityExact(1, 3, 1, false);
    expect(prob).toBeCloseTo(1 / 6, 4);
  });
});

describe('probabilityAtLeastWithKnown', () => {
  it('returns 1 when own matches already satisfy count', () => {
    expect(probabilityAtLeastWithKnown(2, 3, 10, 3, false)).toBe(1);
  });

  it('reduces needed count by known matches', () => {
    const prob = probabilityAtLeastWithKnown(3, 3, 10, 2, false);
    const probDirect = probabilityAtLeast(1, 3, 10, false);
    expect(prob).toBeCloseTo(probDirect, 4);
  });
});
