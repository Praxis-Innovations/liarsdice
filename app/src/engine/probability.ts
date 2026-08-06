import { DIE_FACES } from './constants';

function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

function binomialProbability(n: number, k: number, p: number): number {
  return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function matchProbabilityPerDie(faceValue: number, onesWild: boolean): number {
  if (faceValue === 1) return 1 / DIE_FACES;
  return onesWild ? 2 / DIE_FACES : 1 / DIE_FACES;
}

export function probabilityAtLeast(
  count: number,
  faceValue: number,
  totalDice: number,
  onesWild: boolean,
): number {
  if (count <= 0) return 1;
  if (count > totalDice) return 0;

  const p = matchProbabilityPerDie(faceValue, onesWild);
  let prob = 0;
  for (let k = count; k <= totalDice; k++) {
    prob += binomialProbability(totalDice, k, p);
  }
  return Math.min(1, Math.max(0, prob));
}

export function probabilityExact(
  count: number,
  faceValue: number,
  totalDice: number,
  onesWild: boolean,
): number {
  if (count < 0 || count > totalDice) return 0;
  const p = matchProbabilityPerDie(faceValue, onesWild);
  return binomialProbability(totalDice, count, p);
}

export function expectedCount(
  faceValue: number,
  totalDice: number,
  onesWild: boolean,
): number {
  const p = matchProbabilityPerDie(faceValue, onesWild);
  return totalDice * p;
}

export function probabilityAtLeastWithKnown(
  count: number,
  faceValue: number,
  unknownDice: number,
  knownMatches: number,
  onesWild: boolean,
): number {
  const needed = count - knownMatches;
  if (needed <= 0) return 1;
  return probabilityAtLeast(needed, faceValue, unknownDice, onesWild);
}
