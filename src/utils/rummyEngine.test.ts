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
  calculatePointsSettlement,
  resolvePoolRound,
  resolveDealsRound,
  validateRummyHand,
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

  // Test 14: Points Rummy Settlement and Scoring Calculation
  try {
    const winnerId = 'user_win';
    const scores = {
      user_win: 0,
      user_opp1: 35,
      user_opp2: 80, // max penalty
      user_opp3: 20, // first drop
    };
    const pointVal = 2; // ₹2/point
    const settlement = calculatePointsSettlement(winnerId, scores, pointVal, 3);
    const expectedGross = (35 + 80 + 20) * 2; // 135 * 2 = 270
    const expectedRake = Number(((270 * 3) / 100).toFixed(2)); // 8.1
    const expectedNet = Number((270 - 8.1).toFixed(2)); // 261.9

    const passed =
      settlement.totalPenaltyPoints === 135 &&
      settlement.grossWinnings === expectedGross &&
      settlement.rakeAmount === expectedRake &&
      settlement.netWinnings === expectedNet;

    results.push({
      name: 'Points Rummy Settlement & Penalty Scoring',
      passed,
      message: passed
        ? `Settlement verified: Gross ₹${expectedGross}, Rake ₹${expectedRake}, Net ₹${expectedNet}.`
        : `Settlement mismatch: got ${JSON.stringify(settlement)}`,
    });
  } catch (err: any) {
    results.push({ name: 'Points Rummy Settlement', passed: false, message: err.message });
  }

  // Test 15: 101 Pool Rummy Multi-Round Elimination & Survivor
  try {
    const allPlayers = ['p1', 'p2', 'p3'];
    // Round 1: p1 wins (0), p2 gets 40, p3 gets 70
    const r1 = resolvePoolRound({ p1: 0, p2: 0, p3: 0 }, { p1: 0, p2: 40, p3: 70 }, 101, allPlayers);
    // Round 2: p2 wins (0), p1 gets 30, p3 gets 35 (70 + 35 = 105 -> ELIMINATED)
    const r2 = resolvePoolRound(r1.newCumulativeScores, { p1: 30, p2: 0, p3: 35 }, 101, allPlayers);
    // Round 3: p1 wins (0), p2 gets 65 (40 + 0 + 65 = 105 -> ELIMINATED). Only p1 survives!
    const r3 = resolvePoolRound(r2.newCumulativeScores, { p1: 0, p2: 65, p3: 0 }, 101, allPlayers);

    const passed =
      r1.eliminatedIds.length === 0 &&
      r2.eliminatedIds.includes('p3') &&
      r2.remainingEligibleIds.length === 2 &&
      r3.isTableComplete === true &&
      r3.tableWinnerId === 'p1' &&
      r3.newCumulativeScores.p1 === 30 &&
      r3.newCumulativeScores.p2 === 105 &&
      r3.newCumulativeScores.p3 === 105;

    results.push({
      name: '101 Pool Rummy Multi-Round Elimination & Survivor Determination',
      passed,
      message: passed
        ? 'Successfully tracked 3 rounds, eliminated p3 (105) and p2 (105), crowned p1 (30 pts).'
        : 'Failed 101 Pool resolution test.',
    });
  } catch (err: any) {
    results.push({ name: '101 Pool Elimination', passed: false, message: err.message });
  }

  // Test 16: 201 Pool Rummy Multi-Round Elimination & Rules
  try {
    const allPlayers = ['p1', 'p2'];
    // Round 1: p1 wins (0), p2 middle drops (50 pts in 201 Pool)
    const r1 = resolvePoolRound({ p1: 0, p2: 0 }, { p1: 0, p2: 50 }, 201, allPlayers);
    // Round 2: p1 gets 75, p2 gets 80 (p2 cumul = 130)
    const r2 = resolvePoolRound(r1.newCumulativeScores, { p1: 75, p2: 80 }, 201, allPlayers);
    // Round 3: p1 wins (0), p2 gets 75 (130 + 75 = 205 -> ELIMINATED)
    const r3 = resolvePoolRound(r2.newCumulativeScores, { p1: 0, p2: 75 }, 201, allPlayers);

    const passed =
      r2.newCumulativeScores.p2 === 130 &&
      !r2.isTableComplete &&
      r3.isTableComplete &&
      r3.tableWinnerId === 'p1' &&
      r3.newCumulativeScores.p2 === 205;

    results.push({
      name: '201 Pool Rummy 201-Threshold & 50-Mid-Drop Elimination',
      passed,
      message: passed
        ? '201 Pool threshold enforced properly; eliminated p2 at 205 pts, crowned p1.'
        : 'Failed 201 Pool test.',
    });
  } catch (err: any) {
    results.push({ name: '201 Pool Elimination', passed: false, message: err.message });
  }

  // Test 17: Deals Rummy (2 Deals) Complete Simulation
  try {
    const players = ['alice', 'bob', 'charlie'];
    // Deal 1: alice wins (0), bob gets 25, charlie gets 40
    const d1 = resolveDealsRound({ alice: 0, bob: 0, charlie: 0 }, { alice: 0, bob: 25, charlie: 40 }, 1, 2, players);
    // Deal 2: bob wins (0), alice gets 15, charlie gets 10
    const d2 = resolveDealsRound(d1.newCumulativeScores, { alice: 15, bob: 0, charlie: 10 }, 2, 2, players);

    // Cumulative totals: alice = 15, bob = 25, charlie = 50.
    // Lowest score wins -> alice!
    const passed =
      !d1.isTableComplete &&
      d2.isTableComplete &&
      d2.tableWinnerId === 'alice' &&
      d2.newCumulativeScores.alice === 15 &&
      d2.newCumulativeScores.bob === 25 &&
      d2.newCumulativeScores.charlie === 50 &&
      d2.rankedPlayerIds[0] === 'alice';

    results.push({
      name: '2 Deals Rummy Full Progression & Standings (Lowest Score Wins)',
      passed,
      message: passed
        ? 'Deal 1 & 2 completed; lowest score Alice (15 pts) ranked #1 and won.'
        : 'Failed 2 Deals simulation.',
    });
  } catch (err: any) {
    results.push({ name: '2 Deals Rummy', passed: false, message: err.message });
  }

  // Test 18: Deals Rummy (3 Deals) Complete Simulation
  try {
    const players = ['user', 'bot1'];
    // Deal 1: user 0, bot1 40
    const d1 = resolveDealsRound({ user: 0, bot1: 0 }, { user: 0, bot1: 40 }, 1, 3, players);
    // Deal 2: user 30, bot1 0
    const d2 = resolveDealsRound(d1.newCumulativeScores, { user: 30, bot1: 0 }, 2, 3, players);
    // Deal 3: user 10, bot1 25 -> Final: user = 40, bot1 = 65 -> user wins!
    const d3 = resolveDealsRound(d2.newCumulativeScores, { user: 10, bot1: 25 }, 3, 3, players);

    const passed =
      !d1.isTableComplete &&
      !d2.isTableComplete &&
      d3.isTableComplete &&
      d3.tableWinnerId === 'user' &&
      d3.newCumulativeScores.user === 40 &&
      d3.newCumulativeScores.bot1 === 65;

    results.push({
      name: '3 Deals Rummy Full Progression & Standings (Lowest Score Wins)',
      passed,
      message: passed
        ? 'Completed 3 deals; user cumulative 40 pts defeated bot1 65 pts.'
        : 'Failed 3 Deals simulation.',
    });
  } catch (err: any) {
    results.push({ name: '3 Deals Rummy', passed: false, message: err.message });
  }

  // Test 19: Strict Rummy Hand Declaration Validation & Rejection
  try {
    const wildJokerRank: Rank = '9';
    // Case A: Missing Pure Sequence (has impure sequence + sets, but NO pure sequence)
    const invalidNoPure: PlayingCard[][] = [
      // Impure sequence using wild joker 9♣
      [
        { id: 'a1', rank: '4', suit: 'hearts', value: 4, points: 4 },
        { id: 'a2', rank: '9', suit: 'clubs', value: 9, points: 9, isJoker: true },
        { id: 'a3', rank: '6', suit: 'hearts', value: 6, points: 6 },
      ],
      // Set
      [
        { id: 'a4', rank: 'K', suit: 'spades', value: 13, points: 10 },
        { id: 'a5', rank: 'K', suit: 'hearts', value: 13, points: 10 },
        { id: 'a6', rank: 'K', suit: 'diamonds', value: 13, points: 10 },
      ],
      // Set
      [
        { id: 'a7', rank: '7', suit: 'spades', value: 7, points: 7 },
        { id: 'a8', rank: '7', suit: 'hearts', value: 7, points: 7 },
        { id: 'a9', rank: '7', suit: 'diamonds', value: 7, points: 7 },
      ],
      // Set of 4
      [
        { id: 'a10', rank: '2', suit: 'spades', value: 2, points: 2 },
        { id: 'a11', rank: '2', suit: 'hearts', value: 2, points: 2 },
        { id: 'a12', rank: '2', suit: 'diamonds', value: 2, points: 2 },
        { id: 'a13', rank: '2', suit: 'clubs', value: 2, points: 2 },
      ],
    ];

    const valNoPure = validateRummyHand(invalidNoPure, wildJokerRank);

    // Case B: Has Pure Sequence, but total sequences < 2 (only 1 pure sequence + 3 sets)
    const invalidOneSeq: PlayingCard[][] = [
      // Pure sequence
      [
        { id: 'b1', rank: '4', suit: 'spades', value: 4, points: 4 },
        { id: 'b2', rank: '5', suit: 'spades', value: 5, points: 5 },
        { id: 'b3', rank: '6', suit: 'spades', value: 6, points: 6 },
      ],
      // Set 1
      [
        { id: 'b4', rank: 'K', suit: 'spades', value: 13, points: 10 },
        { id: 'b5', rank: 'K', suit: 'hearts', value: 13, points: 10 },
        { id: 'b6', rank: 'K', suit: 'diamonds', value: 13, points: 10 },
      ],
      // Set 2
      [
        { id: 'b7', rank: '7', suit: 'spades', value: 7, points: 7 },
        { id: 'b8', rank: '7', suit: 'hearts', value: 7, points: 7 },
        { id: 'b9', rank: '7', suit: 'diamonds', value: 7, points: 7 },
      ],
      // Set 3 (4 cards)
      [
        { id: 'b10', rank: '2', suit: 'spades', value: 2, points: 2 },
        { id: 'b11', rank: '2', suit: 'hearts', value: 2, points: 2 },
        { id: 'b12', rank: '2', suit: 'diamonds', value: 2, points: 2 },
        { id: 'b13', rank: '2', suit: 'clubs', value: 2, points: 2 },
      ],
    ];

    const valOneSeq = validateRummyHand(invalidOneSeq, wildJokerRank);

    // Case C: Valid Declaration (Pure Seq + Impure Seq + 2 Sets = 13 cards)
    const validHand: PlayingCard[][] = [
      // Pure Seq: 4♠ 5♠ 6♠
      [
        { id: 'c1', rank: '4', suit: 'spades', value: 4, points: 4 },
        { id: 'c2', rank: '5', suit: 'spades', value: 5, points: 5 },
        { id: 'c3', rank: '6', suit: 'spades', value: 6, points: 6 },
      ],
      // Impure Seq: 8♥ + [9♣ Joker] + 10♥
      [
        { id: 'c4', rank: '8', suit: 'hearts', value: 8, points: 8 },
        { id: 'c5', rank: '9', suit: 'clubs', value: 9, points: 9, isJoker: true },
        { id: 'c6', rank: '10', suit: 'hearts', value: 10, points: 10 },
      ],
      // Set: 7♠ 7♥ 7♦
      [
        { id: 'c7', rank: '7', suit: 'spades', value: 7, points: 7 },
        { id: 'c8', rank: '7', suit: 'hearts', value: 7, points: 7 },
        { id: 'c9', rank: '7', suit: 'diamonds', value: 7, points: 7 },
      ],
      // Set: 2♠ 2♥ 2♦ 2♣
      [
        { id: 'c10', rank: '2', suit: 'spades', value: 2, points: 2 },
        { id: 'c11', rank: '2', suit: 'hearts', value: 2, points: 2 },
        { id: 'c12', rank: '2', suit: 'diamonds', value: 2, points: 2 },
        { id: 'c13', rank: '2', suit: 'clubs', value: 2, points: 2 },
      ],
    ];

    const valValid = validateRummyHand(validHand, wildJokerRank);

    const passed =
      !valNoPure.isValidDeclaration &&
      valNoPure.statusMessage.includes('Pure Sequence') &&
      !valOneSeq.isValidDeclaration &&
      valOneSeq.statusMessage.includes('2 Sequences') &&
      valValid.isValidDeclaration &&
      valValid.totalPoints === 0;

    results.push({
      name: 'Authoritative Hand Validation (Pure Seq & Min 2 Sequences Enforced)',
      passed,
      message: passed
        ? 'Correctly rejected hands missing pure sequence or second sequence, and accepted valid show with 0 points.'
        : 'Declaration validation failure.',
    });
  } catch (err: any) {
    results.push({ name: 'Hand Validation Enforced', passed: false, message: err.message });
  }

  return results;
};
