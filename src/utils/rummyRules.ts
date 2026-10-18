import { PlayingCard, Rank, Suit } from '../types/rummy';

export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RANK_VALUE_MAP: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
};

export const RANK_POINTS_MAP: Record<Rank, number> = {
  'A': 10,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
};

export function createDeck(decksCount = 2, wildJokerRank?: Rank): PlayingCard[] {
  const cards: PlayingCard[] = [];
  let idCounter = 1;

  for (let d = 0; d < decksCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({
          id: `card_${idCounter++}_d${d}_${suit}_${rank}`,
          suit,
          rank,
          value: RANK_VALUE_MAP[rank],
          points: RANK_POINTS_MAP[rank],
          isJoker: wildJokerRank ? rank === wildJokerRank : false,
        });
      }
    }
  }

  return cards;
}

export function shuffleCards(deck: PlayingCard[]): PlayingCard[] {
  const array = [...deck];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function sortHandCards(cards: PlayingCard[]): PlayingCard[] {
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  return [...cards].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.value - b.value;
  });
}

// Check if a group forms a Pure Sequence (strictly consecutive same suit, no wild jokers)
export function isPureSequence(group: PlayingCard[]): boolean {
  if (group.length < 3) return false;
  const firstSuit = group[0].suit;
  if (!group.every(c => c.suit === firstSuit)) return false;

  const sorted = [...group].sort((a, b) => a.value - b.value);

  // Check normal consecutive
  let consecutive = true;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].value !== sorted[i].value + 1) {
      consecutive = false;
      break;
    }
  }
  if (consecutive) return true;

  // Check Ace high: Q, K, A (12, 13, 1)
  if (sorted[0].rank === 'A') {
    const highAceSorted = [...group].map(c => c.rank === 'A' ? 14 : c.value).sort((a, b) => a - b);
    let aceHighConsecutive = true;
    for (let i = 0; i < highAceSorted.length - 1; i++) {
      if (highAceSorted[i + 1] !== highAceSorted[i] + 1) {
        aceHighConsecutive = false;
        break;
      }
    }
    if (aceHighConsecutive) return true;
  }

  return false;
}

// Check if a group forms an Impure Sequence (consecutive same suit with jokers)
export function isImpureSequence(group: PlayingCard[], wildJokerRank: Rank): boolean {
  if (group.length < 3) return false;

  const nonJokers = group.filter(c => c.rank !== wildJokerRank && !c.isJoker);
  const jokersCount = group.length - nonJokers.length;

  if (nonJokers.length === 0) return true; // All jokers can form sequence
  const targetSuit = nonJokers[0].suit;
  if (!nonJokers.every(c => c.suit === targetSuit)) return false;

  const sorted = [...nonJokers].sort((a, b) => a.value - b.value);
  // Check duplicates in non-jokers
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].value === sorted[i].value) return false;
  }

  let gaps = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps += (sorted[i + 1].value - sorted[i].value - 1);
  }

  return gaps <= jokersCount;
}

// Check if a group is a valid Set (same rank, different suits or jokers)
export function isValidSet(group: PlayingCard[], wildJokerRank: Rank): boolean {
  if (group.length < 3 || group.length > 4) return false;

  const nonJokers = group.filter(c => c.rank !== wildJokerRank && !c.isJoker);
  if (nonJokers.length === 0) return true;

  const targetRank = nonJokers[0].rank;
  if (!nonJokers.every(c => c.rank === targetRank)) return false;

  // Check unique suits among non-jokers
  const suits = new Set(nonJokers.map(c => c.suit));
  return suits.size === nonJokers.length;
}

export interface HandValidation {
  isValidDeclaration: boolean;
  hasPureSequence: boolean;
  sequencesCount: number;
  pureSequencesCount: number;
  totalPoints: number;
  statusMessage: string;
}

export function validateRummyHand(groups: PlayingCard[][], wildJokerRank: Rank): HandValidation {
  const allCards = groups.flat();
  if (allCards.length !== 13) {
    return {
      isValidDeclaration: false,
      hasPureSequence: false,
      sequencesCount: 0,
      pureSequencesCount: 0,
      totalPoints: allCards.reduce((acc, c) => acc + c.points, 0),
      statusMessage: `Hand must have exactly 13 cards (currently ${allCards.length})`,
    };
  }

  let pureSeqCount = 0;
  let impureSeqCount = 0;
  let validSetsCount = 0;
  let invalidGroupsCount = 0;
  let unmeldedCards: PlayingCard[] = [];

  for (const group of groups) {
    if (isPureSequence(group)) {
      pureSeqCount++;
    } else if (isImpureSequence(group, wildJokerRank)) {
      impureSeqCount++;
    } else if (isValidSet(group, wildJokerRank)) {
      validSetsCount++;
    } else {
      invalidGroupsCount++;
      unmeldedCards.push(...group);
    }
  }

  const totalSequences = pureSeqCount + impureSeqCount;
  const hasPure = pureSeqCount >= 1;
  const hasMinSequences = totalSequences >= 2;

  let totalPoints = 0;
  if (!hasPure) {
    // If no pure sequence, full hand penalty (max 80 pts in Indian Rummy)
    totalPoints = Math.min(80, allCards.reduce((acc, c) => (c.rank === wildJokerRank || c.isJoker ? acc : acc + c.points), 0));
  } else if (!hasMinSequences) {
    // Has 1 pure sequence, penalty on all other cards
    const pureCards = groups.find(g => isPureSequence(g)) || [];
    const nonPureCards = allCards.filter(c => !pureCards.includes(c));
    totalPoints = Math.min(80, nonPureCards.reduce((acc, c) => (c.rank === wildJokerRank || c.isJoker ? acc : acc + c.points), 0));
  } else {
    // Points only on invalid groups
    totalPoints = Math.min(80, unmeldedCards.reduce((acc, c) => (c.rank === wildJokerRank || c.isJoker ? acc : acc + c.points), 0));
  }

  const isValid = hasPure && hasMinSequences && invalidGroupsCount === 0;

  let statusMessage = 'Valid Rummy Show!';
  if (!hasPure) {
    statusMessage = 'Needs at least 1 Pure Sequence';
  } else if (!hasMinSequences) {
    statusMessage = 'Needs at least 2 Sequences (1 Pure + 1 Impure/Pure)';
  } else if (invalidGroupsCount > 0) {
    statusMessage = `${invalidGroupsCount} group(s) are invalid sets/sequences`;
  }

  return {
    isValidDeclaration: isValid,
    hasPureSequence: hasPure,
    sequencesCount: totalSequences,
    pureSequencesCount: pureSeqCount,
    totalPoints: isValid ? 0 : totalPoints,
    statusMessage,
  };
}
