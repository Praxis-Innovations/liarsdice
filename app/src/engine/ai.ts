import type { GameAction, GameState, Bid, DieValue, RNGFunction } from './types';
import { isLegalBid } from './rules';
import { probabilityAtLeastWithKnown, expectedCount } from './probability';

function defaultRng(): number {
  return Math.random();
}

export function getAIDecision(
  state: GameState,
  playerId: string,
  rng: RNGFunction = defaultRng,
): GameAction {
  const player = state.players.find(p => p.id === playerId)!;
  const difficulty = player.aiDifficulty || 'medium';

  switch (difficulty) {
    case 'easy':
      return getEasyDecision(state, playerId, rng);
    case 'medium':
      return getMediumDecision(state, playerId, rng);
    case 'hard':
      return getHardDecision(state, playerId, rng);
  }
}

function countOwnMatches(dice: DieValue[], faceValue: DieValue, onesWild: boolean): number {
  let count = 0;
  for (const die of dice) {
    if (die === faceValue) count++;
    else if (onesWild && die === 1 && faceValue !== 1) count++;
  }
  return count;
}

function getTotalDice(state: GameState): number {
  return state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
}

function getUnknownDice(state: GameState, playerId: string): number {
  return getTotalDice(state) - (state.players.find(p => p.id === playerId)?.diceCount ?? 0);
}

function getCurrentBidProbability(state: GameState, playerId: string): number {
  if (!state.currentBid) return 1;
  const player = state.players.find(p => p.id === playerId)!;
  const ownMatches = countOwnMatches(player.dice, state.currentBid.faceValue, state.onesWild);
  const unknownDice = getUnknownDice(state, playerId);
  return probabilityAtLeastWithKnown(
    state.currentBid.quantity,
    state.currentBid.faceValue,
    unknownDice,
    ownMatches,
    state.onesWild,
  );
}

function findBestBid(state: GameState, playerId: string, _rng: RNGFunction): Bid | null {
  const player = state.players.find(p => p.id === playerId)!;
  const totalDice = getTotalDice(state);
  const unknownDice = getUnknownDice(state, playerId);

  const candidates: { bid: Bid; score: number }[] = [];

  for (let faceValue = 1; faceValue <= 6; faceValue++) {
    for (let quantity = 1; quantity <= totalDice; quantity++) {
      const bid: Bid = { quantity, faceValue: faceValue as DieValue };
      if (!isLegalBid(bid, state.currentBid, state)) continue;

      const ownMatches = countOwnMatches(player.dice, faceValue as DieValue, state.onesWild);
      const prob = probabilityAtLeastWithKnown(
        quantity, faceValue, unknownDice, ownMatches, state.onesWild,
      );

      if (prob > 0.25) {
        candidates.push({ bid, score: prob });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].bid;
}

function getEasyDecision(state: GameState, playerId: string, rng: RNGFunction): GameAction {
  if (state.currentBid) {
    const prob = getCurrentBidProbability(state, playerId);
    if (prob < 0.2) {
      return { type: 'challenge', playerId };
    }
  }

  const player = state.players.find(p => p.id === playerId)!;
  const totalDice = getTotalDice(state);

  const possibleBids: Bid[] = [];
  for (let faceValue = 1; faceValue <= 6; faceValue++) {
    for (let quantity = 1; quantity <= totalDice; quantity++) {
      const bid: Bid = { quantity, faceValue: faceValue as DieValue };
      if (isLegalBid(bid, state.currentBid, state)) {
        possibleBids.push(bid);
      }
    }
  }

  if (possibleBids.length === 0) {
    return { type: 'challenge', playerId };
  }

  const ownDiceCounts = new Map<number, number>();
  for (const die of player.dice) {
    ownDiceCounts.set(die, (ownDiceCounts.get(die) || 0) + 1);
  }

  const safeBids = possibleBids.filter(bid => {
    const ownCount = countOwnMatches(player.dice, bid.faceValue, state.onesWild);
    const expected = expectedCount(bid.faceValue, getUnknownDice(state, playerId), state.onesWild);
    return bid.quantity <= ownCount + expected + (rng() < 0.4 ? 2 : 0);
  });

  const bids = safeBids.length > 0 ? safeBids : possibleBids;
  const minBids = bids.filter(b => {
    if (!state.currentBid) return b.quantity <= 2;
    return b.quantity <= (state.currentBid.quantity + 1);
  });

  const pool = minBids.length > 0 ? minBids : bids.slice(0, 5);
  const chosen = pool[Math.floor(rng() * pool.length)];

  return { type: 'bid', playerId, bid: chosen };
}

function getMediumDecision(state: GameState, playerId: string, rng: RNGFunction): GameAction {
  if (state.currentBid) {
    const prob = getCurrentBidProbability(state, playerId);

    if (prob < 0.35) {
      return { type: 'challenge', playerId };
    }

    if (state.settings.enableSpotOn && state.roundHistory.length >= 2) {
      const player = state.players.find(p => p.id === playerId)!;
      const ownMatches = countOwnMatches(player.dice, state.currentBid.faceValue, state.onesWild);
      const unknownDice = getUnknownDice(state, playerId);
      const needed = state.currentBid.quantity - ownMatches;
      const expected = expectedCount(state.currentBid.faceValue, unknownDice, state.onesWild);
      if (Math.abs(needed - expected) < 0.5 && rng() < 0.15) {
        return { type: 'spot-on', playerId };
      }
    }
  }

  const bid = findBestBid(state, playerId, rng);
  if (!bid) {
    return { type: 'challenge', playerId };
  }

  if (rng() < 0.2) {
    const player = state.players.find(p => p.id === playerId)!;
    const strongFaces = player.dice.reduce((acc, d) => {
      acc.set(d, (acc.get(d) || 0) + 1);
      return acc;
    }, new Map<number, number>());

    let bestFace: DieValue = bid.faceValue;
    let bestCount = 0;
    for (const [face, count] of strongFaces) {
      if (face === 1 && state.onesWild) continue;
      if (count > bestCount) {
        bestCount = count;
        bestFace = face as DieValue;
      }
    }

    const bluffBid: Bid = { quantity: bid.quantity, faceValue: bestFace as DieValue };
    if (isLegalBid(bluffBid, state.currentBid, state)) {
      return { type: 'bid', playerId, bid: bluffBid };
    }
  }

  return { type: 'bid', playerId, bid };
}

function getHardDecision(state: GameState, playerId: string, rng: RNGFunction): GameAction {
  if (state.currentBid) {
    const prob = getCurrentBidProbability(state, playerId);

    if (prob < 0.28) {
      return { type: 'challenge', playerId };
    }

    if (state.settings.enableSpotOn && state.roundHistory.length >= 2 && prob > 0.4) {
      const player = state.players.find(p => p.id === playerId)!;
      const ownMatches = countOwnMatches(player.dice, state.currentBid.faceValue, state.onesWild);
      const unknownDice = getUnknownDice(state, playerId);
      const needed = state.currentBid.quantity - ownMatches;
      const expected = expectedCount(state.currentBid.faceValue, unknownDice, state.onesWild);

      if (Math.abs(needed - expected) < 0.3 && rng() < 0.25) {
        return { type: 'spot-on', playerId };
      }
    }
  }

  const player = state.players.find(p => p.id === playerId)!;
  const totalDice = getTotalDice(state);
  const unknownDice = getUnknownDice(state, playerId);

  const candidates: { bid: Bid; score: number }[] = [];

  for (let faceValue = 1; faceValue <= 6; faceValue++) {
    for (let quantity = 1; quantity <= totalDice; quantity++) {
      const bid: Bid = { quantity, faceValue: faceValue as DieValue };
      if (!isLegalBid(bid, state.currentBid, state)) continue;

      const ownMatches = countOwnMatches(player.dice, faceValue as DieValue, state.onesWild);
      const prob = probabilityAtLeastWithKnown(
        quantity, faceValue, unknownDice, ownMatches, state.onesWild,
      );

      if (prob < 0.15) continue;

      let score = prob;
      if (ownMatches > 0) score += 0.1 * ownMatches;

      const nextPlayerIdx = findNextActivePlayer(state, playerId);
      if (nextPlayerIdx !== -1) {
        const nextPlayer = state.players[nextPlayerIdx];
        if (nextPlayer.diceCount <= 2) {
          score += 0.05;
        }
      }

      candidates.push({ bid, score });
    }
  }

  if (candidates.length === 0) {
    return { type: 'challenge', playerId };
  }

  if (rng() < 0.3 && state.currentBid) {
    const bluffCandidates = candidates.filter(c => {
      const ownMatches = countOwnMatches(player.dice, c.bid.faceValue, state.onesWild);
      return ownMatches === 0 && c.score > 0.3;
    });

    if (bluffCandidates.length > 0) {
      bluffCandidates.sort((a, b) => b.score - a.score);
      return { type: 'bid', playerId, bid: bluffCandidates[0].bid };
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const topN = Math.min(3, candidates.length);
  const chosen = candidates[Math.floor(rng() * topN)];

  return { type: 'bid', playerId, bid: chosen.bid };
}

function findNextActivePlayer(state: GameState, currentPlayerId: string): number {
  const currentIdx = state.players.findIndex(p => p.id === currentPlayerId);
  let idx = (currentIdx + 1) % state.players.length;
  while (idx !== currentIdx) {
    if (!state.players[idx].isEliminated) return idx;
    idx = (idx + 1) % state.players.length;
  }
  return -1;
}
