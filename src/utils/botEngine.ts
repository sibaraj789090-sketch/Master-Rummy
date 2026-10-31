import { BotProfile, BotSettings, BotSystemStats, PlayingCard, Rank, Suit } from '../types/rummy';
import {
  isPureSequence,
  isImpureSequence,
  isValidSet,
  validateRummyHand,
  autoSortHand,
  RANKS,
} from './rummyRules';

// 100k+ Bot Pool Generator Data
const INDIAN_FIRST_NAMES = [
  'Rahul', 'Rohit', 'Amit', 'Vikram', 'Pooja', 'Sunita', 'Deepak', 'Sanjay',
  'Priya', 'Ananya', 'Ramesh', 'Suresh', 'Manish', 'Kunal', 'Abhishek', 'Rajesh',
  'Arjun', 'Vijay', 'Manoj', 'Karan', 'Neha', 'Kavita', 'Ritu', 'Simran',
  'Gaurav', 'Aditya', 'Nikhil', 'Pawan', 'Ajay', 'Vikas', 'Dinesh', 'Sachin',
  'Harish', 'Ashok', 'Mahesh', 'Brijesh', 'Alok', 'Vivek', 'Prateek', 'Shubham',
  'Ankit', 'Sourabh', 'Mukesh', 'Santosh', 'Kamal', 'Chandan', 'Naveen', 'Rakesh',
  'Sunil', 'Hemant', 'Mohan', 'Krishna', 'Suraj', 'Akash', 'Mayank', 'Chetan',
  'Devendra', 'Jitendra', 'Bhupendra', 'Satish', 'Umesh', 'Pankaj', 'Babloo', 'Sonu',
  'Monu', 'Bunty', 'Golu', 'Chhotu', 'Lucky', 'Rocky', 'Raja', 'Prince',
  'Aryan', 'Aarav', 'Vihaan', 'Reyansh', 'Shaurya', 'Kabir', 'Rudra', 'Devansh',
  'Dhruv', 'Avyan', 'Ishaan', 'Ayaan', 'Atharv', 'Shivansh', 'Ansh', 'Samarth',
  'Tanvi', 'Isha', 'Aarohi', 'Diya', 'Anushka', 'Riya', 'Sneha', 'Khushi',
  'Shreya', 'Siddhi', 'Kashish', 'Prisha', 'Avni', 'Meera', 'Navya', 'Aditi'
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Gupta', 'Patel', 'Kumar', 'Yadav', 'Mishra',
  'Choudhary', 'Rathore', 'Deshmukh', 'Patil', 'Joshi', 'Kulkarni', 'Reddy', 'Rao',
  'Nair', 'Menon', 'Pillai', 'Iyer', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Bose',
  'Das', 'Dutta', 'Ghosh', 'Chakraborty', 'Agarwal', 'Bansal', 'Goyal', 'Mittal',
  'Jindal', 'Singhal', 'Kansal', 'Jain', 'Shah', 'Mehta', 'Parikh', 'Trivedi',
  'Pandya', 'Thakur', 'Chauhan', 'Solanki', 'Rawat', 'Bisht', 'Negi', 'Bhatt',
  'Malhotra', 'Kapoor', 'Khanna', 'Bhatia', 'Arora', 'Sahni', 'Grover', 'Sethi',
  'Ahluwalia', 'Sandhu', 'Gill', 'Sidhu', 'Dhillon', 'Grewal', 'Brar', 'Chahal'
];

const INDIAN_LOCATIONS = [
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'] },
  { state: 'Delhi NCR', cities: ['New Delhi', 'Noida', 'Gurugram', 'Ghaziabad'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Siliguri', 'Durgapur', 'Howrah'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'] },
  { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'] },
  { state: 'Madhya Pradesh', cities: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur'] },
  { state: 'Haryana', cities: ['Faridabad', 'Panipat', 'Ambala', 'Karnal'] },
  { state: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'] },
  { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'] }
];

const BOT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
];

const BOT_CHAT_MESSAGES = [
  'Jaldi chalo bhai! ⏱️',
  'Bhai ek joker dede plzz 🙏',
  'Good move dost 👍',
  'Bahut bekaar patte aaye hain 😅',
  'Kismat hi kharab hai aaj!',
  'Lagta hai mera show ban gaya 🔥',
  'Well played bro!',
  'Waiting for next round ⚡',
  'Drop karu ya khelu? 🤔',
  'Shandar khel rahe ho!',
  'Dil se rummy! 🃏',
  'Bass ek card chahiye declare ke liye ✨',
];

// Default Settings
export const DEFAULT_BOT_SETTINGS: BotSettings = {
  enabled: true,
  aiMode: 'MASTER_97',
  botWinRatePercent: 97,
  playerTargetWinRatePercent: 72,
  turnDelaySeconds: 2.2,
  smartDiscardEnabled: true,
  smartDrawEnabled: true,
  dropProbabilityPercent: 12,
  chatFrequencyPercent: 25,
  fillEmptySeatsInstantly: true,
  forceNextWinner: 'NONE',
};

export const DEFAULT_BOT_STATS: BotSystemStats = {
  totalBotPoolSize: 105420,
  activeBotsPlaying: 14820,
  totalGamesTracked: 84210,
  botWinsCount: 81683,
  playerWinsCount: 2527,
  totalBotRakeCollected: 524000,
};

// Deterministic Pseudo-Random Generator for consistent 100k+ bot generation
function pseudoHash(n: number): number {
  let x = Math.sin(n + 1) * 100000;
  return x - Math.floor(x);
}

/**
 * Deterministically generates or looks up any Bot Profile by index (0 to 120,000+).
 * This allows 100,000+ realistic bots without loading hundreds of megabytes into RAM.
 */
export function getBotByIndex(index: number): BotProfile {
  const seed = (index * 9301 + 49297) % 233280;
  const rand1 = pseudoHash(seed);
  const rand2 = pseudoHash(seed + 1);
  const rand3 = pseudoHash(seed + 2);
  const rand4 = pseudoHash(seed + 3);
  const rand5 = pseudoHash(seed + 4);

  const firstName = INDIAN_FIRST_NAMES[Math.floor(rand1 * INDIAN_FIRST_NAMES.length)];
  const lastName = INDIAN_LAST_NAMES[Math.floor(rand2 * INDIAN_LAST_NAMES.length)];
  const location = INDIAN_LOCATIONS[Math.floor(rand3 * INDIAN_LOCATIONS.length)];
  const city = location.cities[Math.floor(rand4 * location.cities.length)];
  const avatar = BOT_AVATARS[Math.floor(rand5 * BOT_AVATARS.length)];

  const numTag = Math.floor(rand1 * 900) + 100;
  const username = `${firstName.toLowerCase()}_${numTag}`;
  const fullName = `${firstName} ${lastName.charAt(0)}.`;

  const vipTiers: BotProfile['vipTier'][] = [
    'VIP 1', 'VIP 2', 'VIP 3', 'VIP 4', 'VIP 5', 'VIP 6', 'Crown', 'Master'
  ];
  const vipIndex = Math.min(vipTiers.length - 1, Math.floor(rand2 * vipTiers.length));
  const vipTier = vipTiers[vipIndex];

  const gamesPlayed = Math.floor(rand3 * 4500) + 120;
  // Bot individual win rate between 94.0% and 99.4%
  const winRate = Number((94 + rand4 * 5.4).toFixed(1));
  const rating = Math.floor(1800 + rand5 * 1100);
  const chips = Math.floor(rand1 * 85000) + 5000;

  const playStyles: BotProfile['playStyle'][] = ['Aggressive', 'Strategic', 'Adaptive', 'Master'];
  const playStyle = playStyles[Math.floor(rand3 * playStyles.length)];

  return {
    id: `bot_pool_${index + 1}`,
    name: fullName,
    username,
    avatar,
    state: location.state,
    city,
    vipTier,
    chips,
    gamesPlayed,
    winRate,
    rating,
    isOnline: true,
    playStyle,
    badge: vipIndex >= 6 ? 'PRO' : vipIndex >= 4 ? 'ELITE' : 'ACTIVE',
  };
}

/**
 * Searches across the 100k+ bot pool with query, filter by state, VIP, and pagination.
 */
export function queryBotPool(params: {
  searchQuery?: string;
  state?: string;
  vipTier?: string;
  page?: number;
  pageSize?: number;
}): { bots: BotProfile[]; totalMatching: number } {
  const { searchQuery = '', state, vipTier, page = 1, pageSize = 20 } = params;
  const results: BotProfile[] = [];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Scan a diverse sample partition of 1,000 bots per query window
  const sampleScanLimit = 800;
  const offset = (page - 1) * pageSize;

  let matchedCount = 0;
  for (let i = 0; i < sampleScanLimit; i++) {
    const bot = getBotByIndex((i * 127) % 100000);
    const matchesSearch =
      !normalizedQuery ||
      bot.name.toLowerCase().includes(normalizedQuery) ||
      bot.username.toLowerCase().includes(normalizedQuery) ||
      bot.city.toLowerCase().includes(normalizedQuery) ||
      bot.state.toLowerCase().includes(normalizedQuery);

    const matchesState = !state || bot.state === state;
    const matchesVip = !vipTier || bot.vipTier === vipTier;

    if (matchesSearch && matchesState && matchesVip) {
      if (matchedCount >= offset && results.length < pageSize) {
        results.push(bot);
      }
      matchedCount++;
    }
  }

  // Simulated total matching across 100k+ pool
  const totalMatching = Math.max(matchedCount * 125, 100000);

  return { bots: results, totalMatching };
}

/**
 * Selects distinct realistic opponents for a table based on player count and table stakes.
 * Includes defensive iteration bounds to guarantee zero loop freezing.
 */
export function selectOpponentsForTable(
  count: number,
  tableVariant: string,
  entryFee: number
): BotProfile[] {
  const safeCount = Math.max(1, Math.min(count, 5));
  const chosen: BotProfile[] = [];
  const usedIndices = new Set<number>();
  const now = Date.now();
  let attempts = 0;

  while (chosen.length < safeCount && attempts < 120) {
    attempts++;
    const randIndex = Math.floor(Math.abs(Math.sin(now + attempts * 7919 + chosen.length * 1013)) * 100000) % 100000;
    if (!usedIndices.has(randIndex)) {
      usedIndices.add(randIndex);
      const bot = getBotByIndex(randIndex);
      // Adjust chips proportionally to table stakes so it looks authentic
      bot.chips = Math.max(bot.chips, entryFee * (safeCount === 1 ? 5 : 10) + Math.floor(Math.random() * 5000));
      chosen.push(bot);
    }
  }

  // Guaranteed fallback so chosen array is never empty or short
  while (chosen.length < safeCount) {
    const fallbackIdx = ((chosen.length + 1) * 313) % 100000;
    const bot = getBotByIndex(fallbackIdx);
    bot.chips = Math.max(bot.chips, entryFee * 8);
    chosen.push(bot);
  }

  return chosen;
}

/**
 * Evaluates whether a bot should strategically Drop its hand (First Drop or Middle Drop)
 * like an experienced real Indian Rummy player.
 * Fully guarded against incomplete hands, undefined cards, and edge cases.
 */
export function shouldBotDropHand(params: {
  botTurnsCount: number;
  botHand: PlayingCard[];
  wildJokerRank: Rank | null;
  dropProbabilityPercent: number; // e.g. 6 to 10
  gameVariant: string;
  forceWinner?: 'NONE' | 'BOT' | 'PLAYER';
}): { shouldDrop: boolean; isMiddleDrop: boolean; reason: string } {
  try {
    const { botTurnsCount = 0, botHand, wildJokerRank, dropProbabilityPercent = 8, forceWinner } = params;

    // Never drop if admin forced bot to win
    if (forceWinner === 'BOT') return { shouldDrop: false, isMiddleDrop: false, reason: '' };
    if (!botHand || !Array.isArray(botHand) || botHand.length === 0) {
      return { shouldDrop: false, isMiddleDrop: false, reason: '' };
    }

    const boost = forceWinner === 'PLAYER' ? 1.6 : 1.0;

    const isJokerCard = (c: PlayingCard) => Boolean(c && (c.rank === wildJokerRank || c.isJoker || c.value === 0));
    const jokersCount = botHand.filter(isJokerCard).length;
    const naturalCards = botHand.filter((c) => c && !isJokerCard(c));

    // Count high deadwood face cards (A, K, Q, J, 10)
    const highPointsCount = naturalCards.filter((c) => c && c.points === 10).length;

    // Check if hand already has a pure sequence
    if (wildJokerRank && botHand.length >= 13) {
      try {
        const sortedGroups = autoSortHand(botHand, wildJokerRank);
        if (Array.isArray(sortedGroups)) {
          const hasPure = sortedGroups.some((g) => Array.isArray(g) && isPureSequence(g));
          // If bot has already formed a pure sequence, pro players NEVER drop!
          if (hasPure) return { shouldDrop: false, isMiddleDrop: false, reason: '' };
        }
      } catch {
        // Safe fallback
      }
    }

    // 1. FIRST DROP EVALUATION (Turn 0 / Before drawing or on first turn)
    if (botTurnsCount === 0) {
      const dropRoll = Math.random() * 100;
      // Condition A: Terrible hand with 0 jokers and >= 5 high deadwood cards
      if (jokersCount === 0 && highPointsCount >= 5 && dropRoll < (dropProbabilityPercent * 2.2 * boost)) {
        return {
          shouldDrop: true,
          isMiddleDrop: false,
          reason: 'Poor deal with 0 Jokers and high deadwood',
        };
      }
      // Condition B: Standard strategic drop roll when having 0 jokers
      if (jokersCount === 0 && dropRoll < (dropProbabilityPercent * boost)) {
        return {
          shouldDrop: true,
          isMiddleDrop: false,
          reason: 'Strategic First Drop (Concede 20 pts)',
        };
      }
    }

    // 2. MIDDLE DROP EVALUATION (Turns 1 to 3)
    if (botTurnsCount >= 1 && botTurnsCount <= 3) {
      const dropRoll = Math.random() * 100;
      // If by turn 2 or 3, hand has no jokers and no sequence
      if (jokersCount === 0 && dropRoll < (dropProbabilityPercent * 0.45 * boost)) {
        return {
          shouldDrop: true,
          isMiddleDrop: true,
          reason: 'Middle Drop to minimize penalty points',
        };
      }
    }

    return { shouldDrop: false, isMiddleDrop: false, reason: '' };
  } catch {
    return { shouldDrop: false, isMiddleDrop: false, reason: '' };
  }
}

/**
 * Determines whether a bot should take the open discard card or draw from closed deck.
 * Advanced Pro Strategy with complete crash guards.
 */
export function shouldBotTakeDiscardCard(
  botHand: PlayingCard[],
  openCard: PlayingCard | undefined,
  wildJokerRank: Rank | null,
  smartDrawEnabled: boolean
): boolean {
  try {
    if (!openCard || !smartDrawEnabled || !botHand || !Array.isArray(botHand) || botHand.length === 0) {
      return false;
    }

    // 1. If open card is a Wild Joker, definitely take it!
    if (wildJokerRank && (openCard.rank === wildJokerRank || openCard.isJoker)) {
      return true;
    }

    // 2. Check if taking openCard would produce an immediate winning show
    if (wildJokerRank && botHand.length >= 13) {
      try {
        const simulated14 = [...botHand, openCard];
        const sorted14 = autoSortHand(simulated14, wildJokerRank);
        if (Array.isArray(sorted14) && sorted14.length > 0) {
          const validCheck = validateRummyHand(sorted14.slice(0, 4), wildJokerRank);
          if (validCheck.isValidDeclaration || (validCheck.hasPureSequence && validCheck.sequencesCount >= 2)) {
            return true; // Game winning pick!
          }
        }
      } catch {
        // Ignore sorting edge cases safely
      }
    }

    // 3. Check if open card completes or extends a Pure Sequence in same suit
    const sameSuitCards = botHand.filter(
      (c) => c && c.suit === openCard.suit && !c.isJoker && (wildJokerRank ? c.rank !== wildJokerRank : true)
    );
    if (sameSuitCards.length >= 2) {
      const rankValues = sameSuitCards.map((c) => c.value);
      const targetVal = openCard.value;
      const hasAdj1 = rankValues.includes(targetVal - 1);
      const hasAdj2 = rankValues.includes(targetVal + 1);
      const hasSkip1 = rankValues.includes(targetVal - 2);
      const hasSkip2 = rankValues.includes(targetVal + 2);

      // Adjacent on both sides (e.g. 4 and 6, open card is 5)
      if (hasAdj1 && hasAdj2) return true;
      // Inside connectors
      if (hasAdj1 && hasSkip2) return true;
      if (hasAdj2 && hasSkip1) return true;
      // Two consecutive in hand, open card extends either side
      if ((hasAdj1 && rankValues.includes(targetVal - 2)) || (hasAdj2 && rankValues.includes(targetVal + 2))) {
        return true;
      }
    }

    // 4. Check if open card completes a Set (same rank, different suits)
    const sameRankCards = botHand.filter(
      (c) => c && c.rank === openCard.rank && c.suit !== openCard.suit && !c.isJoker && (wildJokerRank ? c.rank !== wildJokerRank : true)
    );
    if (sameRankCards.length >= 2) {
      return true; // Completes 3 or 4-of-a-kind set!
    }

    // 5. If open card is high deadwood (10 pts) and doesn't directly complete a meld, refuse it
    if (openCard.points === 10) {
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Advanced Discard AI: Chooses the optimal card for the bot to discard.
 * Preserves formed sequences/sets, retains connected potential runs,
 * and dumps isolated high-point deadwood (Kings, Queens, Jacks, 10s).
 * Guaranteed to return a valid PlayingCard without ever crashing.
 */
export function chooseBotOptimalDiscard(
  hand: PlayingCard[],
  wildJokerRank: Rank | null,
  smartDiscardEnabled: boolean
): PlayingCard {
  const fallbackCard: PlayingCard = {
    id: `safe_card_${Date.now()}`,
    suit: 'clubs',
    rank: '7',
    value: 7,
    points: 7,
  };

  if (!hand || !Array.isArray(hand) || hand.length === 0) {
    return fallbackCard;
  }

  // Filter out invalid items
  const validHand = hand.filter(Boolean);
  if (validHand.length === 0) return fallbackCard;

  if (!smartDiscardEnabled) {
    return validHand[0];
  }

  try {
    // Never discard a wild joker or printed joker
    const nonJokers = validHand.filter(
      (c) => !c.isJoker && c.value > 0 && (wildJokerRank ? c.rank !== wildJokerRank : true)
    );
    const pool = nonJokers.length > 0 ? nonJokers : validHand;

    // Group hand with autoSortHand to identify melded cards vs deadwood
    let meldedCardIds = new Set<string>();
    if (wildJokerRank) {
      try {
        const groups = autoSortHand(validHand, wildJokerRank);
        if (Array.isArray(groups)) {
          for (const grp of groups) {
            if (Array.isArray(grp) && (isPureSequence(grp) || isImpureSequence(grp, wildJokerRank) || isValidSet(grp, wildJokerRank))) {
              grp.forEach((c) => {
                if (c && c.id) meldedCardIds.add(c.id);
              });
            }
          }
        }
      } catch {
        // Safe fallback if grouping throws
      }
    }

    // Score each card by deadwood penalty priority
    const scored = pool.map((card) => {
      let penaltyScore = card.points || 0; // Base face value (10 for A, K, Q, J, 10)

      // Heavily penalize discarding a card that is already part of a valid meld!
      if (meldedCardIds.has(card.id)) {
        penaltyScore -= 200;
      }

      // Check suit connectivity with other non-jokers
      const sameSuitCards = pool.filter((c) => c && c.suit === card.suit && c.id !== card.id);
      const hasDirectNeighbour = sameSuitCards.some((c) => Math.abs(c.value - card.value) === 1);
      const hasGapNeighbour = sameSuitCards.some((c) => Math.abs(c.value - card.value) === 2);

      if (!hasDirectNeighbour && !hasGapNeighbour) {
        penaltyScore += 35; // Completely isolated suit, top discard candidate!
      } else if (hasDirectNeighbour) {
        penaltyScore -= 25; // Keep connected run
      }

      // Check rank connectivity (pairs/sets)
      const sameRankCount = pool.filter((c) => c && c.rank === card.rank && c.id !== card.id).length;
      if (sameRankCount === 0) {
        penaltyScore += 18;
      } else if (sameRankCount >= 1) {
        // Check for duplicate suit (e.g. two 8♠ in 2-deck rummy)
        const hasDuplicateSuit = pool.some((c) => c && c.rank === card.rank && c.suit === card.suit && c.id !== card.id);
        if (hasDuplicateSuit) {
          penaltyScore += 30; // Discard redundant duplicate!
        } else {
          penaltyScore -= sameRankCount * 20; // Part of potential set, protect it!
        }
      }

      return { card, score: penaltyScore };
    });

    // Sort by highest penalty score descending (first card is best discard)
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.card || validHand[0];
  } catch {
    return validHand[0];
  }
}

/**
 * Determines whether a bot declares a winning show on their turn.
 * Evaluates hand maturity, current round turn count, and botWinRatePercent / playerTargetWinRate.
 */
export function shouldBotDeclareWin(params: {
  botTurnsCount: number;
  botHand: PlayingCard[];
  wildJokerRank: Rank | null;
  botWinRatePercent: number; // e.g. 97
  playerTargetWinRatePercent: number; // e.g. 72
  aiMode: BotSettings['aiMode'];
  forceWinner: 'NONE' | 'BOT' | 'PLAYER';
}): boolean {
  try {
    const {
      botTurnsCount = 0,
      botHand,
      wildJokerRank,
      botWinRatePercent = 97,
      aiMode = 'MASTER_97',
      forceWinner = 'NONE',
    } = params;

    // 1. Force Winner Override from Admin Panel
    if (forceWinner === 'BOT') return true;
    if (forceWinner === 'PLAYER') return false;

    // 2. Minimum turn check so bots don't declare on turn 0 before dealing completes
    if (botTurnsCount < 3) return false;

    if (!botHand || !Array.isArray(botHand) || botHand.length < 13) {
      return false;
    }

    // 3. Genuine Hand Check: if the bot's 14 cards form a full valid declaration
    if (wildJokerRank && botHand.length >= 13) {
      try {
        const groups = autoSortHand(botHand, wildJokerRank);
        if (Array.isArray(groups) && groups.length > 0) {
          const validation = validateRummyHand(groups.slice(0, 4), wildJokerRank);
          if (validation.isValidDeclaration) {
            return true; // Genuine winning declare!
          }
        }
      } catch {
        // Safe fallback
      }
    }

    // 4. Strategic Win Rate Progression based on AI Mode:
    if (aiMode === 'MASTER_97') {
      const baseWinChance = Math.min(0.97, (botTurnsCount - 3) * 0.28 + 0.38);
      const winRoll = Math.random();
      return winRoll < (baseWinChance * (botWinRatePercent / 100));
    }

    if (aiMode === 'PLAYER_ADVANTAGE_67_78') {
      if (botTurnsCount < 7) return false;
      const botChance = 1 - (params.playerTargetWinRatePercent / 100);
      return Math.random() < (botChance * 0.3);
    }

    if (aiMode === 'BALANCED_50') {
      if (botTurnsCount < 5) return false;
      return Math.random() < 0.45;
    }

    // Custom AI Mode
    const customChance = (botWinRatePercent / 100) * Math.min(1.0, (botTurnsCount - 2) * 0.22);
    return Math.random() < customChance;
  } catch {
    return false;
  }
}

/**
 * Returns a realistic Hinglish / Hindi chat message for bots.
 */
export function getRandomBotChat(): string {
  const idx = Math.floor(Math.random() * BOT_CHAT_MESSAGES.length);
  return BOT_CHAT_MESSAGES[idx];
}
