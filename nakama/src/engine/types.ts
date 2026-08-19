export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type ActionType = 'bid' | 'challenge' | 'spot-on';

export interface Bid {
  quantity: number;
  faceValue: DieValue;
}

export interface Player {
  id: string;
  name: string;
  dice: DieValue[];
  diceCount: number;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  isEliminated: boolean;
  hasTriggeredPalifico: boolean;
}

export interface GameAction {
  type: ActionType;
  playerId: string;
  bid?: Bid;
}

export interface RoundResult {
  challenger: string;
  challengedPlayer: string;
  challengeType: 'liar' | 'spot-on';
  currentBid: Bid;
  allDice: Record<string, DieValue[]>;
  actualCount: number;
  challengerWins: boolean;
  loser: string;
  diceGained: boolean;
}

export interface GameSettings {
  enableSpotOn: boolean;
  enablePalifico: boolean;
  playerCount: number;
  aiDifficulty: AIDifficulty;
  playerName: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentBid: Bid | null;
  lastBidder: string | null;
  roundHistory: GameAction[];
  roundNumber: number;
  isFirstBidOfRound: boolean;
  isPalificoRound: boolean;
  palificoPlayerId: string | null;
  onesWild: boolean;
  gameOver: boolean;
  winner: string | null;
  lastRoundResult: RoundResult | null;
  settings: GameSettings;
}

export type RNGFunction = () => number;
