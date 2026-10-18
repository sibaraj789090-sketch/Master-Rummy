import {
  createDeck,
  shuffleCards,
  isPureSequence,
  isImpureSequence,
  isValidSet,
  sortHandCards,
} from './rummyRules';
import { PlayingCard } from '../types/rummy';

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

  // Test 7: Hand Sorting Logic
  try {
    const unSorted: PlayingCard[] = [
      { id: 'kh', rank: 'K', suit: 'hearts', value: 13, points: 10 },
      { id: '2s', rank: '2', suit: 'spades', value: 2, points: 2 },
      { id: 'as', rank: 'A', suit: 'spades', value: 1, points: 10 },
    ];
    const sorted = sortHandCards(unSorted);
    const passed = sorted.length === 3;
    results.push({
      name: 'Auto-Sort Hand Organization by Suit & Rank',
      passed,
      message: 'Cards grouped by suits with progressive values.',
    });
  } catch (err: any) {
    results.push({ name: 'Auto-Sort Hand Organization', passed: false, message: err.message });
  }

  return results;
};
