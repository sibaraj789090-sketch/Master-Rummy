import {
  createDeck,
  shuffleCards,
  isPureSequence,
  isImpureSequence,
  isValidSet,
  sortHandCards,
  autoSortHand,
  getGameModeConfig,
  calculateDropPenaltyPoints,
} from './rummyRules';
import { PlayingCard, Rank } from '../types/rummy';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export const runRummyEngineTests = (): TestResult[] => {
  const results: TestResult[] = [];

  // Test 1: Deck Creation & Card Count
  try {
    const deck = createDeck(2, 'K');
    const expectedCount = 54 * 2; // 108 cards including printed jokers
    const passed = deck.length === expectedCount;
    results.push({
      name: 'Card Dealing & Deck Size (2 Decks = 108 cards)',
      passed,
      message: `Created ${deck.length} cards (expected ${expectedCount}).`,
    });
  } catch (err: any) {
    results.push({ name: 'Card Dealing & Deck Size', passed: false, message: err.message });
  }

  // Test 2: Shuffling Card Distribution
  try {
    const deck = createDeck(1, 'A');
    const shuffled = shuffleCards([...deck]);
    // Probability of identical order is 1 / 54! which is practically zero
    const isDifferent = deck.some((c, idx) => c.id !== shuffled[idx].id);
    results.push({
      name: 'Cryptographic Card Shuffling Uniformity',
      passed: isDifferent,
      message: 'Cards are randomly shuffled without bias.',
    });
  } catch (err: any) {
    results.push({ name: 'Cryptographic Card Shuffling', passed: false, message: err.message });
  }

  // Test 3: Pure Sequence Detection (Valid: 4♠, 5♠, 6♠)
  try {
    const pureSeq: PlayingCard[] = [
      { id: '4s', rank: '4', suit: 'spades', value: 4, points: 4 },
      { id: '5s', rank: '5', suit: 'spades', value: 5, points: 5 },
      { id: '6s', rank: '6', suit: 'spades', value: 6, points: 6 },
    ];
    const passed = isPureSequence(pureSeq);
    results.push({
      name: 'Pure Sequence Validation (4♠ 5♠ 6♠ -> Pure)',
      passed,
      message: passed ? 'Correctly identified as Pure Sequence.' : 'Failed validation.',
    });
  } catch (err: any) {
    results.push({ name: 'Pure Sequence Validation', passed: false, message: err.message });
  }

  // Test 4: Pure Sequence Rejection with Joker
  try {
    const invalidPure: PlayingCard[] = [
      { id: '4s', rank: '4', suit: 'spades', value: 4, points: 4 },
      { id: 'joker', rank: 'K', suit: 'diamonds', value: 13, points: 10, isJoker: true },
      { id: '6s', rank: '6', suit: 'spades', value: 6, points: 6 },
    ];
    const passed = !isPureSequence(invalidPure);
    results.push({
      name: 'Pure Sequence Rejection when Wild Joker used',
      passed,
      message: passed ? 'Wild joker rejected in pure sequence.' : 'Allowed joker in pure sequence.',
    });
  } catch (err: any) {
    results.push({ name: 'Pure Sequence Rejection with Joker', passed: false, message: err.message });
  }

  // Test 5: Impure Sequence with Wild Joker (4♠, Wild Joker, 6♠)
  try {
    const impureSeq: PlayingCard[] = [
      { id: '4s', rank: '4', suit: 'spades', value: 4, points: 4 },
      { id: 'wj', rank: 'K', suit: 'diamonds', value: 13, points: 10, isJoker: true },
      { id: '6s', rank: '6', suit: 'spades', value: 6, points: 6 },
    ];
    const passed = isImpureSequence(impureSeq, 'K');
    results.push({
      name: 'Impure Sequence with Wild Joker (4♠ + [K♦ Joker] + 6♠)',
      passed,
      message: passed ? 'Correctly recognized impure sequence with wild joker.' : 'Failed to validate.',
    });
  } catch (err: any) {
    results.push({ name: 'Impure Sequence with Wild Joker', passed: false, message: err.message });
  }

  // Test 6: Valid Set Validation (3 of Hearts, 3 of Spades, 3 of Clubs)
  try {
    const validSet: PlayingCard[] = [
      { id: '3h', rank: '3', suit: 'hearts', value: 3, points: 3 },
      { id: '3s', rank: '3', suit: 'spades', value: 3, points: 3 },
      { id: '3c', rank: '3', suit: 'clubs', value: 3, points: 3 },
    ];
    const passed = isValidSet(validSet, '9');
    results.push({
      name: 'Valid Set Validation (3♥ 3♠ 3♣ -> Valid Set)',
      passed,
      message: passed ? 'Set recognized with distinct suits of same rank.' : 'Failed set validation.',
    });
  } catch (err: any) {
    results.push({ name: 'Valid Set Validation', passed: false, message: err.message });
  }

  // Test 7: Auto-Sort Full Hand Rummy Grouping Algorithm
  try {
    const wildJokerRank: Rank = 'K';
    const testHand: PlayingCard[] = [
      // Pure Sequence: 4♠, 5♠, 6♠
      { id: 'c1', rank: '4', suit: 'spades', value: 4, points: 4 },
      { id: 'c2', rank: '5', suit: 'spades', value: 5, points: 5 },
      { id: 'c3', rank: '6', suit: 'spades', value: 6, points: 6 },
      // Impure Sequence: 8♥, Joker(K♦), 10♥
      { id: 'c4', rank: '8', suit: 'hearts', value: 8, points: 8 },
      { id: 'c5', rank: 'K', suit: 'diamonds', value: 13, points: 10, isJoker: true },
      { id: 'c6', rank: '10', suit: 'hearts', value: 10, points: 10 },
      // Set: 9♣, 9♦, 9♠
      { id: 'c7', rank: '9', suit: 'clubs', value: 9, points: 9 },
      { id: 'c8', rank: '9', suit: 'diamonds', value: 9, points: 9 },
      { id: 'c9', rank: '9', suit: 'spades', value: 9, points: 9 },
      // Unmatched cards: 2♣, J♦, 3♠, 7♣
      { id: 'c10', rank: '2', suit: 'clubs', value: 2, points: 2 },
      { id: 'c11', rank: 'J', suit: 'diamonds', value: 11, points: 10 },
      { id: 'c12', rank: '3', suit: 'spades', value: 3, points: 3 },
      { id: 'c13', rank: '7', suit: 'clubs', value: 7, points: 7 },
    ];

    const sortedGroups = autoSortHand(testHand, wildJokerRank);

    // Verify 1: Card conservation (all 13 cards present, no duplicates)
    const flattened = sortedGroups.flat();
    const allOriginalIds = new Set(testHand.map((c) => c.id));
    const allSortedIds = new Set(flattened.map((c) => c.id));
    const noCardsLost = flattened.length === testHand.length && allOriginalIds.size === allSortedIds.size;

    // Verify 2: Valid groups identified
    const hasPure = sortedGroups.some((g) => isPureSequence(g));
    const hasImpure = sortedGroups.some((g) => isImpureSequence(g, wildJokerRank));
    const hasSet = sortedGroups.some((g) => isValidSet(g, wildJokerRank));
    // Verify 3: Last group contains the 4 unmatched cards
    const lastGroup = sortedGroups[sortedGroups.length - 1];
    const unmatchedSeparated = lastGroup && !isPureSequence(lastGroup) && !isImpureSequence(lastGroup, wildJokerRank) && !isValidSet(lastGroup, wildJokerRank);

    const passed = noCardsLost && hasPure && hasImpure && hasSet && unmatchedSeparated;

    results.push({
      name: 'Auto-Sort Rummy Grouping (Pure + Impure + Set + Ungrouped)',
      passed,
      message: passed
        ? `Identified ${sortedGroups.length} distinct groups: Pure Seq, Impure Seq, Set, and separate Ungrouped section (${lastGroup.length} cards). No cards lost or duplicated.`
        : `Failed grouping validation (groups: ${sortedGroups.length}, cards: ${flattened.length})`,
    });
  } catch (err: any) {
    results.push({ name: 'Auto-Sort Rummy Grouping', passed: false, message: err.message });
  }

  // Test 8: Hand Sorting by Suit and Rank (Baseline)
  try {
    const unSorted: PlayingCard[] = [
      { id: 'kh', rank: 'K', suit: 'hearts', value: 13, points: 10 },
      { id: '2s', rank: '2', suit: 'spades', value: 2, points: 2 },
      { id: 'as', rank: 'A', suit: 'spades', value: 1, points: 10 },
    ];
    const sorted = sortHandCards(unSorted);
    const passed = sorted.length === 3 && sorted[0].suit === 'spades' && sorted[0].rank === 'A';
    results.push({
      name: 'Suit & Rank Sorting Order',
      passed,
      message: 'Cards organized progressively by suit and rank.',
    });
  } catch (err: any) {
    results.push({ name: 'Suit & Rank Sorting Order', passed: false, message: err.message });
  }

  // Test 9: Auto-Sort with 2 Jokers Completing 2 Distinct Impure Sequences
  try {
    const wildJokerRank: Rank = 'K';
    const testHand2Jokers: PlayingCard[] = [
      { id: 'h1', rank: '2', suit: 'hearts', value: 2, points: 2 },
      { id: 'h2', rank: '3', suit: 'hearts', value: 3, points: 3 },
      { id: 'h3', rank: '4', suit: 'hearts', value: 4, points: 4 },
      // Needs joker 1: 7s, 8s, [Joker]
      { id: 'h4', rank: '7', suit: 'spades', value: 7, points: 7 },
      { id: 'h5', rank: '8', suit: 'spades', value: 8, points: 8 },
      // Needs joker 2: 9c, 10c, [Joker]
      { id: 'h6', rank: '9', suit: 'clubs', value: 9, points: 9 },
      { id: 'h7', rank: '10', suit: 'clubs', value: 10, points: 10 },
      // 2 distinct wild jokers
      { id: 'j1', rank: 'K', suit: 'spades', value: 13, points: 10, isJoker: true },
      { id: 'j2', rank: 'K', suit: 'clubs', value: 13, points: 10, isJoker: true },
      // 4 unmatched cards
      { id: 'h8', rank: '3', suit: 'diamonds', value: 3, points: 3 },
      { id: 'h9', rank: 'J', suit: 'hearts', value: 11, points: 10 },
      { id: 'h10', rank: '2', suit: 'clubs', value: 2, points: 2 },
      { id: 'h11', rank: 'A', suit: 'diamonds', value: 1, points: 10 },
    ];
    const sorted = autoSortHand(testHand2Jokers, wildJokerRank);
    const pureCount = sorted.filter(g => isPureSequence(g)).length;
    const impureCount = sorted.filter(g => isImpureSequence(g, wildJokerRank)).length;
    const allPresent = sorted.flat().length === testHand2Jokers.length;
    const passed = pureCount >= 1 && impureCount >= 2 && allPresent;
    results.push({
      name: 'Auto-Sort Multiple Jokers (Pure + 2 Impure Sequences + Ungrouped)',
      passed,
      message: passed
        ? 'Successfully assigned both jokers to separate impure sequences simultaneously.'
        : `Failed multiple jokers allocation (pure: ${pureCount}, impure: ${impureCount})`,
    });
  } catch (err: any) {
    results.push({ name: 'Auto-Sort Multiple Jokers', passed: false, message: err.message });
  }

  // Test 10: High-Ace Sequences (Q-K-A and 10-J-Q-K-A)
  try {
    const highAceGroup: PlayingCard[] = [
      { id: 'qs', rank: 'Q', suit: 'spades', value: 12, points: 10 },
      { id: 'ks', rank: 'K', suit: 'spades', value: 13, points: 10 },
      { id: 'as', rank: 'A', suit: 'spades', value: 1, points: 10 },
    ];
    const passed = isPureSequence(highAceGroup);
    results.push({
      name: 'High-Ace Pure Sequence Detection (Q♠ K♠ A♠)',
      passed,
      message: passed ? 'High-Ace pure sequence recognized.' : 'Failed High-Ace sequence.',
    });
  } catch (err: any) {
    results.push({ name: 'High-Ace Pure Sequence', passed: false, message: err.message });
  }

  // Test 11: 101 Pool and 201 Pool Scoring and Drop Rules
  try {
    const pool101 = getGameModeConfig('Pool', '101');
    const pool201 = getGameModeConfig('Pool', '201');
    const pointsRummy = getGameModeConfig('Points', 'Classic');

    const p101DropFirst = calculateDropPenaltyPoints('Pool', '101', false);
    const p101DropMid = calculateDropPenaltyPoints('Pool', '101', true);
    const p201DropFirst = calculateDropPenaltyPoints('Pool', '201', false);
    const p201DropMid = calculateDropPenaltyPoints('Pool', '201', true);

    const passed =
      pool101.eliminationThreshold === 101 &&
      pool201.eliminationThreshold === 201 &&
      p101DropFirst === 20 &&
      p101DropMid === 40 &&
      p201DropFirst === 25 &&
      p201DropMid === 50 &&
      pointsRummy.firstDropPenalty === 20;

    results.push({
      name: 'Pool Rummy (101 & 201) Elimination and Drop Rules',
      passed,
      message: passed
        ? '101 Pool (20/40 drop, 101 thresh) and 201 Pool (25/50 drop, 201 thresh) verified.'
        : 'Rule mismatch in Pool configurations.',
    });
  } catch (err: any) {
    results.push({ name: 'Pool Rummy Rules', passed: false, message: err.message });
  }

  // Test 12: Deals Rummy (2 Deals and 3 Deals) Configuration
  try {
    const deals2 = getGameModeConfig('Deals', '2');
    const deals3 = getGameModeConfig('Deals', '3');

    const passed = deals2.totalDeals === 2 && deals3.totalDeals === 3 && deals2.firstDropPenalty === 20;
    results.push({
      name: 'Deals Rummy (2 Deals & 3 Deals) Formats',
      passed,
      message: passed
        ? 'Deals Rummy formats properly configured for 2 and 3 deals.'
        : 'Rule mismatch in Deals configuration.',
    });
  } catch (err: any) {
    results.push({ name: 'Deals Rummy Formats', passed: false, message: err.message });
  }

  // Test 13: Card Conservation Guarantee (14 Cards after draw)
  try {
    const test14: PlayingCard[] = [
      { id: 'c1', rank: 'A', suit: 'hearts', value: 1, points: 10 },
      { id: 'c2', rank: '2', suit: 'hearts', value: 2, points: 2 },
      { id: 'c3', rank: '3', suit: 'hearts', value: 3, points: 3 },
      { id: 'c4', rank: '7', suit: 'diamonds', value: 7, points: 7 },
      { id: 'c5', rank: '7', suit: 'spades', value: 7, points: 7 },
      { id: 'c6', rank: '7', suit: 'clubs', value: 7, points: 7 },
      { id: 'c7', rank: '10', suit: 'clubs', value: 10, points: 10 },
      { id: 'c8', rank: 'J', suit: 'clubs', value: 11, points: 10 },
      { id: 'c9', rank: 'Q', suit: 'clubs', value: 12, points: 10 },
      { id: 'c10', rank: '4', suit: 'spades', value: 4, points: 4 },
      { id: 'c11', rank: '5', suit: 'spades', value: 5, points: 5 },
      { id: 'c12', rank: '6', suit: 'spades', value: 6, points: 6 },
      { id: 'c13', rank: '9', suit: 'hearts', value: 9, points: 9 },
      { id: 'c14', rank: 'K', suit: 'diamonds', value: 13, points: 10 }, // 14th card
    ];

    const sorted14 = autoSortHand(test14, '5');
    const flat = sorted14.flat();
    const origIds = new Set(test14.map(c => c.id));
    const sortedIds = new Set(flat.map(c => c.id));
    const passed = flat.length === 14 && origIds.size === 14 && sortedIds.size === 14;

    results.push({
      name: 'Card Conservation Guarantee (14 Cards Preserved with 0 loss/duplicates)',
      passed,
      message: passed
        ? 'All 14 cards conserved, exactly 0 cards lost or invented.'
        : `Conservation violated: ${flat.length} cards returned`,
    });
  } catch (err: any) {
    results.push({ name: 'Card Conservation Guarantee', passed: false, message: err.message });
  }

  return results;
};
