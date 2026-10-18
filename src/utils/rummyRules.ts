import { PlayingCard, Rank, Suit, TossCardPlayer, TossResult } from '../types/rummy';

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
    // Add 2 printed jokers per deck (54 cards per deck, 108 for 2 decks)
    for (let pj = 1; pj <= 2; pj++) {
      cards.push({
        id: `card_${idCounter++}_d${d}_joker_${pj}`,
        suit: 'spades',
        rank: wildJokerRank || 'K',
        value: 0,
        points: 0,
        isJoker: true,
      });
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

// Check if a group forms a Pure Sequence (strictly consecutive same suit, natural cards, no wildcard substitution)
export function isPureSequence(group: PlayingCard[]): boolean {
  if (group.length < 3) return false;
  // Printed jokers (value = 0) can NEVER be part of a pure sequence
  if (group.some(c => c.value === 0)) return false;

  const firstSuit = group[0].suit;
  if (!group.every(c => c.suit === firstSuit)) return false;

  // 1. Normal values (Ace = 1, 2, ..., 13)
  const normalValues = group.map(c => c.value).sort((a, b) => a - b);
  let normalConsecutive = true;
  for (let i = 0; i < normalValues.length - 1; i++) {
    if (normalValues[i + 1] !== normalValues[i] + 1) {
      normalConsecutive = false;
      break;
    }
  }
  if (normalConsecutive) return true;

  // 2. High Ace values (10, J, Q, K, A -> 10, 11, 12, 13, 14)
  if (group.some(c => c.rank === 'A')) {
    const highAceValues = group.map(c => (c.rank === 'A' ? 14 : c.value)).sort((a, b) => a - b);
    let highConsecutive = true;
    for (let i = 0; i < highAceValues.length - 1; i++) {
      if (highAceValues[i + 1] !== highAceValues[i] + 1) {
        highConsecutive = false;
        break;
      }
    }
    if (highConsecutive) return true;
  }

  return false;
}

// Check if a group forms an Impure Sequence (consecutive same suit with at least 1 joker wildcard)
export function isImpureSequence(group: PlayingCard[], wildJokerRank: Rank): boolean {
  if (group.length < 3) return false;

  const isWild = (c: PlayingCard) => c.rank === wildJokerRank || Boolean(c.isJoker) || c.value === 0;
  const nonJokers = group.filter(c => !isWild(c));
  const jokersCount = group.length - nonJokers.length;

  // Must have at least 1 joker substituting
  if (jokersCount === 0) return false;
  // If all cards in the group are jokers, it can serve as a sequence
  if (nonJokers.length === 0) return true;

  const targetSuit = nonJokers[0].suit;
  if (!nonJokers.every(c => c.suit === targetSuit)) return false;

  const checkConsecutive = (values: number[]): boolean => {
    // Duplicate values cannot be in the same sequence
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i + 1] === values[i]) return false;
    }

    let gaps = 0;
    for (let i = 0; i < values.length - 1; i++) {
      gaps += values[i + 1] - values[i] - 1;
    }

    if (gaps > jokersCount) return false;
    const span = values[values.length - 1] - values[0] + 1;
    return span <= group.length;
  };

  // 1. Normal values (Ace = 1)
  const normalValues = [...nonJokers].map(c => c.value).sort((a, b) => a - b);
  if (checkConsecutive(normalValues)) return true;

  // 2. High Ace values (Ace = 14)
  if (nonJokers.some(c => c.rank === 'A')) {
    const highAceValues = [...nonJokers].map(c => (c.rank === 'A' ? 14 : c.value)).sort((a, b) => a - b);
    if (checkConsecutive(highAceValues)) return true;
  }

  return false;
}

// Check if a group is a valid Set (3 or 4 cards of same rank with different suits or jokers)
export function isValidSet(group: PlayingCard[], wildJokerRank: Rank): boolean {
  if (group.length < 3 || group.length > 4) return false;

  const isWild = (c: PlayingCard) => c.rank === wildJokerRank || Boolean(c.isJoker) || c.value === 0;
  const nonJokers = group.filter(c => !isWild(c));
  if (nonJokers.length === 0) return true;

  const targetRank = nonJokers[0].rank;
  if (!nonJokers.every(c => c.rank === targetRank)) return false;

  // In Indian Rummy, no duplicate suits are allowed in a set
  const suits = new Set(nonJokers.map(c => c.suit));
  return suits.size === nonJokers.length;
}

/**
 * AUTO SORT ALGORITHM FOR INDIAN RUMMY
 * - Detects valid Pure Sequences, Impure Sequences, and Sets
 * - Solves the combinatorial assignment to find the highest-scoring valid grouping
 * - Places leftover unmatched cards into a separate ungrouped section at the end
 * - Preserves 100% of input cards with zero lost or duplicated cards
 */
export function autoSortHand(cards: PlayingCard[], wildJokerRank: Rank): PlayingCard[][] {
  if (!cards || cards.length === 0) return [];

  const isCardWild = (c: PlayingCard) => c.rank === wildJokerRank || Boolean(c.isJoker) || c.value === 0;

  const allCards = [...cards];
  const jokers = allCards.filter(isCardWild);
  const naturalCards = allCards.filter(c => c.value > 0);

  interface CandidateGroup {
    type: 'PURE_SEQ' | 'IMPURE_SEQ' | 'SET';
    cards: PlayingCard[];
    cardIds: string[];
    priority: number;
    scoreWeight: number;
  }

  const candidates: CandidateGroup[] = [];

  // Helper to generate combinations of K elements
  function combinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (k > arr.length) return [];
    if (k === arr.length) return [[...arr]];
    const head = arr[0];
    const tail = arr.slice(1);
    const withHead = combinations(tail, k - 1).map(c => [head, ...c]);
    const withoutHead = combinations(tail, k);
    return [...withHead, ...withoutHead];
  }

  // 1. PURE SEQUENCES (Length 3 to 6, strictly consecutive natural cards of same suit)
  for (const suit of SUITS) {
    const suitCards = naturalCards.filter(c => c.suit === suit);
    const byValue = new Map<number, PlayingCard[]>();
    for (const c of suitCards) {
      if (!byValue.has(c.value)) byValue.set(c.value, []);
      byValue.get(c.value)!.push(c);
    }

    // Normal values (A = 1 to K = 13)
    const sortedVals = Array.from(byValue.keys()).sort((a, b) => a - b);
    for (let i = 0; i < sortedVals.length; i++) {
      let cur = sortedVals[i];
      let j = i;
      const run: number[] = [];
      while (j < sortedVals.length && sortedVals[j] === cur) {
        run.push(cur);
        cur++;
        j++;
        if (run.length >= 3 && run.length <= 6) {
          const runCards = run.map(v => byValue.get(v)![0]);
          if (isPureSequence(runCards)) {
            candidates.push({
              type: 'PURE_SEQ',
              cards: runCards,
              cardIds: runCards.map(c => c.id),
              priority: 250 + runCards.length * 15,
              scoreWeight: runCards.length * 12,
            });
          }
          // If duplicate card instances exist in this suit, also add candidates with alternates
          for (let ri = 0; ri < run.length; ri++) {
            const val = run[ri];
            const list = byValue.get(val)!;
            if (list.length > 1) {
              const alt = [...runCards];
              alt[ri] = list[1];
              candidates.push({
                type: 'PURE_SEQ',
                cards: alt,
                cardIds: alt.map(c => c.id),
                priority: 250 + alt.length * 15,
                scoreWeight: alt.length * 12,
              });
            }
          }
        }
      }
    }

    // High Ace sequences (10, J, Q, K, A -> 10, 11, 12, 13, 14)
    if (byValue.has(1)) {
      const highByVal = new Map<number, PlayingCard[]>();
      for (const [v, clist] of byValue.entries()) {
        highByVal.set(v === 1 ? 14 : v, clist);
      }
      const highVals = Array.from(highByVal.keys()).sort((a, b) => a - b);
      for (let i = 0; i < highVals.length; i++) {
        let cur = highVals[i];
        let j = i;
        const run: number[] = [];
        while (j < highVals.length && highVals[j] === cur) {
          run.push(cur);
          cur++;
          j++;
          if (run.length >= 3 && run.length <= 5 && run.includes(14)) {
            const runCards = run.map(v => highByVal.get(v)![0]);
            if (isPureSequence(runCards)) {
              candidates.push({
                type: 'PURE_SEQ',
                cards: runCards,
                cardIds: runCards.map(c => c.id),
                priority: 250 + runCards.length * 15,
                scoreWeight: runCards.length * 12,
              });
            }
          }
        }
      }
    }
  }

  // 2. IMPURE SEQUENCES (Using 1 or more jokers)
  if (jokers.length > 0) {
    for (const suit of SUITS) {
      const suitCards = naturalCards.filter(c => c.suit === suit);
      const byValue = new Map<number, PlayingCard[]>();
      for (const c of suitCards) {
        if (!byValue.has(c.value)) byValue.set(c.value, []);
        byValue.get(c.value)!.push(c);
      }

      // Check spans of length 3 to 5
      const spans: { start: number; len: number; isHighAce: boolean }[] = [];
      for (let s = 1; s <= 12; s++) {
        for (let l = 3; l <= Math.min(5, 14 - s + 1); l++) {
          spans.push({ start: s, len: l, isHighAce: false });
        }
      }
      // High Ace spans (e.g. Q-K-A with jokers)
      for (let s = 10; s <= 12; s++) {
        for (let l = 3; l <= 14 - s + 1; l++) {
          spans.push({ start: s, len: l, isHighAce: true });
        }
      }

      for (const span of spans) {
        const neededVals: number[] = [];
        for (let k = 0; k < span.len; k++) neededVals.push(span.start + k);

        const valMap = span.isHighAce
          ? new Map(Array.from(byValue.entries()).map(([v, clist]) => [v === 1 ? 14 : v, clist]))
          : byValue;

        const presentVals: number[] = [];
        const missingIndices: number[] = [];
        for (let idx = 0; idx < neededVals.length; idx++) {
          const v = neededVals[idx];
          if (valMap.has(v)) {
            presentVals.push(v);
          } else {
            missingIndices.push(idx);
          }
        }

        const missingCount = missingIndices.length;
        if (missingCount >= 1 && missingCount <= jokers.length && presentVals.length >= 2) {
          const jokerCombos = combinations(jokers, missingCount);

          for (const jokerCombo of jokerCombos) {
            const seqCards: PlayingCard[] = [];
            let jIdx = 0;
            for (let idx = 0; idx < neededVals.length; idx++) {
              const v = neededVals[idx];
              if (valMap.has(v)) {
                seqCards.push(valMap.get(v)![0]);
              } else {
                seqCards.push(jokerCombo[jIdx++]);
              }
            }

            const uniqueIds = new Set(seqCards.map(c => c.id));
            if (uniqueIds.size === seqCards.length && isImpureSequence(seqCards, wildJokerRank)) {
              candidates.push({
                type: 'IMPURE_SEQ',
                cards: seqCards,
                cardIds: seqCards.map(c => c.id),
                priority: 150 + seqCards.length * 10,
                scoreWeight: seqCards.length * 8,
              });
            }
          }
        }
      }
    }
  }

  // 3. SETS (3 or 4 cards of same rank with different suits, or with jokers)
  for (const rank of RANKS) {
    const rankCards = naturalCards.filter(c => c.rank === rank);
    const bySuit = new Map<Suit, PlayingCard[]>();
    for (const c of rankCards) {
      if (!bySuit.has(c.suit)) bySuit.set(c.suit, []);
      bySuit.get(c.suit)!.push(c);
    }
    const distinctSuits = Array.from(bySuit.keys());

    // Natural set of 4
    if (distinctSuits.length >= 4) {
      const set4 = distinctSuits.slice(0, 4).map(s => bySuit.get(s)![0]);
      if (isValidSet(set4, wildJokerRank)) {
        candidates.push({
          type: 'SET',
          cards: set4,
          cardIds: set4.map(c => c.id),
          priority: 140,
          scoreWeight: 36,
        });
      }
    }

    // Natural sets of 3
    if (distinctSuits.length >= 3) {
      const suitTriplets = combinations(distinctSuits, 3);
      for (const triplet of suitTriplets) {
        const set3 = triplet.map(s => bySuit.get(s)![0]);
        if (isValidSet(set3, wildJokerRank)) {
          candidates.push({
            type: 'SET',
            cards: set3,
            cardIds: set3.map(c => c.id),
            priority: 120,
            scoreWeight: 27,
          });
        }
      }
    }

    // Sets with Jokers
    if (jokers.length >= 1) {
      // 3 natural cards + 1 joker -> Set of 4
      if (distinctSuits.length >= 3) {
        const suitTriplets = combinations(distinctSuits, 3);
        for (const triplet of suitTriplets) {
          const natCards = triplet.map(s => bySuit.get(s)![0]);
          for (const joker of jokers) {
            const setCards = [...natCards, joker];
            const uniqueIds = new Set(setCards.map(c => c.id));
            if (uniqueIds.size === setCards.length && isValidSet(setCards, wildJokerRank)) {
              candidates.push({
                type: 'SET',
                cards: setCards,
                cardIds: setCards.map(c => c.id),
                priority: 110,
                scoreWeight: 30,
              });
            }
          }
        }
      }

      // 2 natural cards + 1 joker -> Set of 3
      if (distinctSuits.length >= 2) {
        const suitPairs = combinations(distinctSuits, 2);
        for (const pair of suitPairs) {
          const natCards = pair.map(s => bySuit.get(s)![0]);
          for (const joker of jokers) {
            const setCards = [...natCards, joker];
            const uniqueIds = new Set(setCards.map(c => c.id));
            if (uniqueIds.size === setCards.length && isValidSet(setCards, wildJokerRank)) {
              candidates.push({
                type: 'SET',
                cards: setCards,
                cardIds: setCards.map(c => c.id),
                priority: 100,
                scoreWeight: 24,
              });
            }
          }
        }
      }

      // 2 natural cards + 2 jokers -> Set of 4
      if (distinctSuits.length >= 2 && jokers.length >= 2) {
        const suitPairs = combinations(distinctSuits, 2);
        const jokerPairs = combinations(jokers, 2);
        for (const pair of suitPairs) {
          const natCards = pair.map(s => bySuit.get(s)![0]);
          for (const jPair of jokerPairs) {
            const setCards = [...natCards, ...jPair];
            const uniqueIds = new Set(setCards.map(c => c.id));
            if (uniqueIds.size === setCards.length && isValidSet(setCards, wildJokerRank)) {
              candidates.push({
                type: 'SET',
                cards: setCards,
                cardIds: setCards.map(c => c.id),
                priority: 95,
                scoreWeight: 28,
              });
            }
          }
        }
      }

      // 1 natural card + 2 jokers -> Set of 3
      if (distinctSuits.length >= 1 && jokers.length >= 2) {
        const jokerPairs = combinations(jokers, 2);
        for (const s of distinctSuits) {
          const natCard = bySuit.get(s)![0];
          for (const jPair of jokerPairs) {
            const setCards = [natCard, ...jPair];
            const uniqueIds = new Set(setCards.map(c => c.id));
            if (uniqueIds.size === setCards.length && isValidSet(setCards, wildJokerRank)) {
              candidates.push({
                type: 'SET',
                cards: setCards,
                cardIds: setCards.map(c => c.id),
                priority: 85,
                scoreWeight: 20,
              });
            }
          }
        }
      }
    }
  }

  // Deduplicate candidates
  candidates.sort((a, b) => b.priority - a.priority);
  const seenCardIdSets = new Set<string>();
  const uniqueCandidates: CandidateGroup[] = [];

  for (const cand of candidates) {
    const key = cand.cardIds.slice().sort().join(',');
    if (!seenCardIdSets.has(key)) {
      seenCardIdSets.add(key);
      uniqueCandidates.push(cand);
    }
  }

  // Backtracking search for the optimal combination
  let bestScore = -Infinity;
  let bestSelection: CandidateGroup[] = [];

  function evaluate(selected: CandidateGroup[]): number {
    const usedIds = new Set(selected.flatMap(g => g.cardIds));
    const unmatched = allCards.filter(c => !usedIds.has(c.id));
    const pureCount = selected.filter(g => g.type === 'PURE_SEQ').length;
    const impureCount = selected.filter(g => g.type === 'IMPURE_SEQ').length;
    const totalSeq = pureCount + impureCount;
    const meldedCount = allCards.length - unmatched.length;

    let penalty = 0;
    if (pureCount === 0) {
      penalty = Math.min(80, allCards.reduce((acc, c) => (isCardWild(c) ? acc : acc + c.points), 0));
    } else if (totalSeq < 2) {
      const pureIds = new Set(selected.filter(g => g.type === 'PURE_SEQ').flatMap(g => g.cardIds));
      penalty = Math.min(
        80,
        allCards.filter(c => !pureIds.has(c.id)).reduce((acc, c) => (isCardWild(c) ? acc : acc + c.points), 0)
      );
    } else {
      penalty = Math.min(80, unmatched.reduce((acc, c) => (isCardWild(c) ? acc : acc + c.points), 0));
    }

    let score = meldedCount * 1000 - penalty;
    if (pureCount >= 1) score += 10000;
    if (pureCount >= 1 && totalSeq >= 2) score += 20000;
    if (unmatched.length === 0 && pureCount >= 1 && totalSeq >= 2) score += 100000;

    return score;
  }

  function search(idx: number, current: CandidateGroup[], usedIds: Set<string>) {
    const currentScore = evaluate(current);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestSelection = [...current];
    }

    // In Indian Rummy, maximum 4 valid meld groups in a hand
    if (current.length >= 4) return;

    for (let i = idx; i < uniqueCandidates.length; i++) {
      const cand = uniqueCandidates[i];

      let conflict = false;
      for (const id of cand.cardIds) {
        if (usedIds.has(id)) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      for (const id of cand.cardIds) usedIds.add(id);
      current.push(cand);

      search(i + 1, current, usedIds);

      current.pop();
      for (const id of cand.cardIds) usedIds.delete(id);
    }
  }

  search(0, [], new Set());

  // Build final ordered groups: Pure -> Impure -> Sets -> Ungrouped
  const sortedSelection = [...bestSelection].sort((a, b) => {
    const typeOrder = { PURE_SEQ: 0, IMPURE_SEQ: 1, SET: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  const matchedIds = new Set(sortedSelection.flatMap(g => g.cardIds));
  const unmatchedCards = allCards.filter(c => !matchedIds.has(c.id));

  const result: PlayingCard[][] = [];

  for (const group of sortedSelection) {
    if (group.type === 'PURE_SEQ') {
      const sortedSeq = [...group.cards].sort((a, b) => a.value - b.value);
      if (sortedSeq.some(c => c.rank === 'A') && sortedSeq.some(c => c.rank === 'K')) {
        sortedSeq.sort((a, b) => (a.rank === 'A' ? 14 : a.value) - (b.rank === 'A' ? 14 : b.value));
      }
      result.push(sortedSeq);
    } else {
      result.push(group.cards);
    }
  }

  // Ungrouped section with all unmatched cards sorted by suit and rank
  if (unmatchedCards.length > 0) {
    result.push(sortHandCards(unmatchedCards));
  }

  return result;
}

/**
 * Game Mode Configuration and Scoring Rules
 */
export interface GameModeConfig {
  mode: 'Points' | 'Pool' | 'Deals';
  detail: string; // '101' | '201' | '2' | '3' | 'Classic'
  handSize: number; // 13 cards for Indian Rummy
  firstDropPenalty: number;
  middleDropPenalty: number;
  maxPenalty: number;
  eliminationThreshold?: number;
  totalDeals?: number;
}

export function getGameModeConfig(
  mode: 'Points' | 'Pool' | 'Deals',
  detail: string = '101'
): GameModeConfig {
  if (mode === 'Pool') {
    const is201 = detail === '201';
    return {
      mode: 'Pool',
      detail: is201 ? '201' : '101',
      handSize: 13,
      firstDropPenalty: is201 ? 25 : 20,
      middleDropPenalty: is201 ? 50 : 40,
      maxPenalty: 80,
      eliminationThreshold: is201 ? 201 : 101,
    };
  }

  if (mode === 'Deals') {
    const count = detail === '3' ? 3 : 2;
    return {
      mode: 'Deals',
      detail: count.toString(),
      handSize: 13,
      firstDropPenalty: 20,
      middleDropPenalty: 40,
      maxPenalty: 80,
      totalDeals: count,
    };
  }

  // Points Rummy (Default)
  return {
    mode: 'Points',
    detail: detail || 'Classic',
    handSize: 13,
    firstDropPenalty: 20,
    middleDropPenalty: 40,
    maxPenalty: 80,
  };
}

export function calculateDropPenaltyPoints(
  mode: 'Points' | 'Pool' | 'Deals',
  detail: string,
  isMiddleDrop: boolean
): number {
  const config = getGameModeConfig(mode, detail);
  return isMiddleDrop ? config.middleDropPenalty : config.firstDropPenalty;
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

export interface PointsSettlement {
  winnerId: string;
  pointValue: number;
  opponentsScores: Record<string, number>;
  totalPenaltyPoints: number;
  grossWinnings: number;
  rakePercent: number;
  rakeAmount: number;
  netWinnings: number;
}

export function calculatePointsSettlement(
  winnerId: string,
  scores: Record<string, number>,
  pointValue: number,
  rakePercent: number = 3
): PointsSettlement {
  const opponentsScores: Record<string, number> = {};
  let totalPenaltyPoints = 0;

  for (const [userId, score] of Object.entries(scores)) {
    if (userId !== winnerId) {
      const penalty = Math.min(80, Math.max(0, score));
      opponentsScores[userId] = penalty;
      totalPenaltyPoints += penalty;
    }
  }

  const grossWinnings = Number((totalPenaltyPoints * pointValue).toFixed(2));
  const rakeAmount = Number(((grossWinnings * rakePercent) / 100).toFixed(2));
  const netWinnings = Number((grossWinnings - rakeAmount).toFixed(2));

  return {
    winnerId,
    pointValue,
    opponentsScores,
    totalPenaltyPoints,
    grossWinnings,
    rakePercent,
    rakeAmount,
    netWinnings,
  };
}

export interface PoolRoundResolution {
  newCumulativeScores: Record<string, number>;
  eliminatedIds: string[];
  remainingEligibleIds: string[];
  isTableComplete: boolean;
  tableWinnerId?: string;
}

export function resolvePoolRound(
  currentCumulativeScores: Record<string, number>,
  roundScores: Record<string, number>,
  threshold: number,
  allPlayerIds: string[]
): PoolRoundResolution {
  const newCumulativeScores: Record<string, number> = {};
  const eliminatedIds: string[] = [];
  const remainingEligibleIds: string[] = [];

  for (const id of allPlayerIds) {
    const prev = currentCumulativeScores[id] ?? 0;
    const roundPenalty = roundScores[id] ?? 0;
    const newTotal = prev + roundPenalty;
    newCumulativeScores[id] = newTotal;

    if (newTotal >= threshold) {
      eliminatedIds.push(id);
    } else {
      remainingEligibleIds.push(id);
    }
  }

  // Check table completion
  let isTableComplete = false;
  let tableWinnerId: string | undefined = undefined;

  if (remainingEligibleIds.length === 1) {
    isTableComplete = true;
    tableWinnerId = remainingEligibleIds[0];
  } else if (remainingEligibleIds.length === 0) {
    // Simultaneous elimination edge case: player with lowest cumulative score wins
    isTableComplete = true;
    let lowestScore = Infinity;
    for (const id of allPlayerIds) {
      if (newCumulativeScores[id] < lowestScore) {
        lowestScore = newCumulativeScores[id];
        tableWinnerId = id;
      }
    }
  }

  return {
    newCumulativeScores,
    eliminatedIds,
    remainingEligibleIds,
    isTableComplete,
    tableWinnerId,
  };
}

export interface DealsRoundResolution {
  newCumulativeScores: Record<string, number>;
  currentDeal: number;
  totalDeals: number;
  isTableComplete: boolean;
  rankedPlayerIds: string[];
  tableWinnerId?: string;
}

export function resolveDealsRound(
  currentCumulativeScores: Record<string, number>,
  dealScores: Record<string, number>,
  completedDealNumber: number,
  totalDeals: number,
  allPlayerIds: string[]
): DealsRoundResolution {
  const newCumulativeScores: Record<string, number> = {};

  for (const id of allPlayerIds) {
    const prev = currentCumulativeScores[id] ?? 0;
    const dealPenalty = dealScores[id] ?? 0;
    newCumulativeScores[id] = prev + dealPenalty;
  }

  const isTableComplete = completedDealNumber >= totalDeals;

  // Rank players by lowest cumulative score
  const rankedPlayerIds = [...allPlayerIds].sort((a, b) => {
    return (newCumulativeScores[a] ?? 0) - (newCumulativeScores[b] ?? 0);
  });

  return {
    newCumulativeScores,
    currentDeal: completedDealNumber,
    totalDeals,
    isTableComplete,
    rankedPlayerIds,
    tableWinnerId: isTableComplete ? rankedPlayerIds[0] : undefined,
  };
}

export interface CardMovementResult {
  success: boolean;
  newGroups: PlayingCard[][];
  message?: string;
}

/**
 * Move a single card from one meld group to another meld group (or to a new group if toGroupIdx is -1).
 * Supports reordering if fromGroupIdx === toGroupIdx.
 * Guarantees 100% card conservation (no card lost, no card duplicated).
 */
export function moveCardBetweenGroups(
  groups: PlayingCard[][],
  cardId: string,
  fromGroupIdx: number,
  toGroupIdx: number,
  insertIndex?: number
): CardMovementResult {
  if (!groups || groups.length === 0) {
    return { success: false, newGroups: groups, message: 'No card groups available' };
  }

  if (fromGroupIdx < 0 || fromGroupIdx >= groups.length) {
    return { success: false, newGroups: groups, message: 'Invalid source group index' };
  }

  const clonedGroups = groups.map((g) => [...g]);
  const sourceGroup = clonedGroups[fromGroupIdx];
  const cardIdx = sourceGroup.findIndex((c) => c.id === cardId);

  if (cardIdx === -1) {
    return { success: false, newGroups: groups, message: 'Card not found in source group' };
  }

  const [cardToMove] = sourceGroup.splice(cardIdx, 1);

  // If moving within the same group (reordering)
  if (fromGroupIdx === toGroupIdx) {
    const targetIdx =
      insertIndex !== undefined && insertIndex >= 0
        ? Math.min(insertIndex, sourceGroup.length)
        : sourceGroup.length;
    sourceGroup.splice(targetIdx, 0, cardToMove);
    return { success: true, newGroups: clonedGroups, message: 'Card reordered in group' };
  }

  // Moving to a new group
  if (toGroupIdx === -1 || toGroupIdx >= clonedGroups.length) {
    clonedGroups.push([cardToMove]);
  } else {
    // Moving to an existing destination group
    const destGroup = clonedGroups[toGroupIdx];
    const targetIdx =
      insertIndex !== undefined && insertIndex >= 0
        ? Math.min(insertIndex, destGroup.length)
        : destGroup.length;
    destGroup.splice(targetIdx, 0, cardToMove);
  }

  // Remove empty groups
  const cleanedGroups = clonedGroups.filter((g) => g.length > 0);

  // Card conservation safety assertion
  const origCount = groups.flat().length;
  const newCount = cleanedGroups.flat().length;
  if (origCount !== newCount) {
    return { success: false, newGroups: groups, message: 'Card conservation error' };
  }

  return { success: true, newGroups: cleanedGroups, message: 'Card moved successfully' };
}

/**
 * Move multiple selected cards to a destination group (or new group if toGroupIdx is -1).
 */
export function moveMultipleCardsBetweenGroups(
  groups: PlayingCard[][],
  cardIds: string[],
  toGroupIdx: number,
  insertIndex?: number
): CardMovementResult {
  if (!groups || groups.length === 0 || !cardIds || cardIds.length === 0) {
    return { success: false, newGroups: groups, message: 'No cards selected' };
  }

  const cardIdSet = new Set(cardIds);
  const cardsToMove: PlayingCard[] = [];

  // Remove selected cards from all their source groups
  const clonedGroups = groups.map((g) => {
    const remaining: PlayingCard[] = [];
    g.forEach((c) => {
      if (cardIdSet.has(c.id)) {
        cardsToMove.push(c);
      } else {
        remaining.push(c);
      }
    });
    return remaining;
  });

  if (cardsToMove.length === 0) {
    return { success: false, newGroups: groups, message: 'None of the specified cards were found' };
  }

  // Place into destination group
  if (toGroupIdx === -1 || toGroupIdx >= clonedGroups.length) {
    clonedGroups.push(cardsToMove);
  } else {
    const destGroup = clonedGroups[toGroupIdx];
    const targetIdx =
      insertIndex !== undefined && insertIndex >= 0
        ? Math.min(insertIndex, destGroup.length)
        : destGroup.length;
    destGroup.splice(targetIdx, 0, ...cardsToMove);
  }

  const cleanedGroups = clonedGroups.filter((g) => g.length > 0);

  // Card conservation assertion
  const origCount = groups.flat().length;
  const newCount = cleanedGroups.flat().length;
  if (origCount !== newCount) {
    return { success: false, newGroups: groups, message: 'Card conservation error' };
  }

  return { success: true, newGroups: cleanedGroups, message: 'Cards moved successfully' };
}

/**
 * =========================================================================
 * RUMMY TOSS & SEQUENTIAL CARD DEALING ENGINE
 * =========================================================================
 * 
 * Standard Rummy Toss Rules:
 * 1. Ace is highest: 14 pts. Followed by K(13), Q(12), J(11), 10..2.
 * 2. Suit tie-breaker: Spades (4) > Hearts (3) > Clubs (2) > Diamonds (1).
 * 3. Total score = rankScore * 10 + suitScore.
 *    Every card in the standard deck is distinct, ensuring deterministic ranking.
 * 4. Highest card player gets 1st turn. Lowest card player gets last turn.
 * 5. Other players arranged in descending order between highest and lowest.
 * 6. The lowest card player (or player preceding the 1st turn) is designated Dealer ('D').
 * 7. Dealer deals cards sequentially: 1 card to each player per pass, following the toss order,
 *    for 13 passes until everyone has 13 cards.
 */

export const TOSS_RANK_SCORE_MAP: Record<Rank, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
};

export const TOSS_SUIT_SCORE_MAP: Record<Suit, number> = {
  'spades': 4,
  'hearts': 3,
  'clubs': 2,
  'diamonds': 1,
};

export function calculateTossScore(card: PlayingCard): {
  rankScore: number;
  suitScore: number;
  totalScore: number;
} {
  const rankScore = TOSS_RANK_SCORE_MAP[card.rank] ?? 2;
  const suitScore = TOSS_SUIT_SCORE_MAP[card.suit] ?? 1;
  const totalScore = rankScore * 10 + suitScore;
  return { rankScore, suitScore, totalScore };
}

/**
 * Creates a clean, standard 52-card single deck without jokers for the Toss.
 */
export function createSingleTossDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  let id = 1;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `toss_${id++}_${suit}_${rank}`,
        suit,
        rank,
        value: RANK_VALUE_MAP[rank],
        points: RANK_POINTS_MAP[rank],
      });
    }
  }
  return shuffleCards(deck);
}

export interface SeatedPlayerInfo {
  userId: string;
  seatIndex: number;
  playerName: string;
  avatar: string;
}

/**
 * Execute an official, deterministic Rummy Toss for any table size (2P, 6P, etc.).
 * Guarantees distinct cards from a single shuffled deck with no duplicates.
 */
export function executeRummyToss(
  players: SeatedPlayerInfo[],
  roundNumber: number = 1,
  customDeck?: PlayingCard[]
): TossResult {
  if (!players || players.length === 0) {
    throw new Error('Cannot execute toss with 0 players');
  }

  // Shuffle a clean standard deck for toss
  const tossDeck = customDeck ? [...customDeck] : createSingleTossDeck();

  if (tossDeck.length < players.length) {
    throw new Error('Not enough cards in deck for toss');
  }

  // Draw 1 distinct card per player
  const evaluatedPlayers: Array<Omit<TossCardPlayer, 'turnOrder' | 'isWinner'>> = [];
  const assignedCardIds = new Set<string>();

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const card = tossDeck[i];

    if (assignedCardIds.has(card.id)) {
      throw new Error(`Duplicate toss card detected: ${card.id}`);
    }
    assignedCardIds.add(card.id);

    const scores = calculateTossScore(card);
    evaluatedPlayers.push({
      userId: p.userId,
      seatIndex: p.seatIndex,
      playerName: p.playerName,
      avatar: p.avatar,
      card,
      rankScore: scores.rankScore,
      suitScore: scores.suitScore,
      totalScore: scores.totalScore,
    });
  }

  // Sort descending by total score:
  // Ace > K > Q > ... > 2. If equal rank, Spades > Hearts > Clubs > Diamonds.
  const sorted = [...evaluatedPlayers].sort((a, b) => b.totalScore - a.totalScore);

  const finalPlayers: TossCardPlayer[] = sorted.map((p, idx) => ({
    ...p,
    turnOrder: idx + 1, // 1st, 2nd, ..., Nth
    isWinner: idx === 0,
  }));

  const winner = finalPlayers[0];
  const lowest = finalPlayers[finalPlayers.length - 1];

  // The lowest card player is the dealer ('D'), who deals to the 1st player
  const dealerSeatIndex = lowest.seatIndex;

  return {
    round: roundNumber,
    players: finalPlayers,
    winnerUserId: winner.userId,
    winnerSeatIndex: winner.seatIndex,
    winnerName: winner.playerName,
    firstTurnSeat: winner.seatIndex,
    dealerSeatIndex,
    suitTieBreakerRule: 'Spades > Hearts > Clubs > Diamonds',
    completedAt: new Date().toISOString(),
  };
}

export interface SequentialDealResult {
  handsBySeat: Record<number, PlayingCard[]>;
  dealSequence: Array<{
    pass: number;
    seatIndex: number;
    userId: string;
    card: PlayingCard;
  }>;
  firstDiscard: PlayingCard;
  remainingDeck: PlayingCard[];
}

/**
 * Sequential Dealer-Based Card Distribution:
 * Deals 1 card per player per pass in the established toss turn order
 * for exactly 13 passes (total 13 cards per player).
 * Guarantees zero duplicate cards and full state synchronization.
 */
export function executeSequentialDeal(
  deck: PlayingCard[],
  tossResult: TossResult,
  handSize: number = 13
): SequentialDealResult {
  const workingDeck = [...deck];
  const turnOrderSeats = tossResult.players.map((p) => ({
    seatIndex: p.seatIndex,
    userId: p.userId,
  }));

  const handsBySeat: Record<number, PlayingCard[]> = {};
  for (const p of tossResult.players) {
    handsBySeat[p.seatIndex] = [];
  }

  const dealSequence: SequentialDealResult['dealSequence'] = [];

  // Deal 1 card to each player per pass
  for (let pass = 1; pass <= handSize; pass++) {
    for (const player of turnOrderSeats) {
      if (workingDeck.length === 0) {
        throw new Error('Closed deck ran out of cards during sequential deal');
      }
      const card = workingDeck.shift()!;
      handsBySeat[player.seatIndex].push(card);
      dealSequence.push({
        pass,
        seatIndex: player.seatIndex,
        userId: player.userId,
        card,
      });
    }
  }

  // After all 13 cards are dealt to each player, reveal starting discard card
  if (workingDeck.length === 0) {
    throw new Error('No cards remaining for starting discard pile');
  }
  const firstDiscard = workingDeck.shift()!;

  return {
    handsBySeat,
    dealSequence,
    firstDiscard,
    remainingDeck: workingDeck,
  };
}

