import { BotProfile, BotSettings, BotSystemStats, PlayingCard, Rank, Suit } from '../types/rummy';
import {
  isPureSequence,
  isImpureSequence,
  isValidSet,
  validateRummyHand,
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
  turnDelaySeconds: 1.6,
  smartDiscardEnabled: true,
  smartDrawEnabled: true,
  dropProbabilityPercent: 6,
  chatFrequencyPercent: 22,
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
 */
export function selectOpponentsForTable(
  count: number,
  tableVariant: string,
  entryFee: number
): BotProfile[] {
  const chosen: BotProfile[] = [];
  const usedIndices = new Set<number>();
  const now = Date.now();

  while (chosen.length < count) {
    const randIndex = Math.floor((Math.sin(now + chosen.length * 7919) * 0.5 + 0.5) * 100000);
    if (!usedIndices.has(randIndex)) {
      usedIndices.add(randIndex);
      const bot = getBotByIndex(randIndex);
      // Adjust chips proportionally to table stakes so it looks authentic
      bot.chips = Math.max(bot.chips, entryFee * (count === 1 ? 5 : 10) + Math.floor(Math.random() * 5000));
      chosen.push(bot);
    }
  }

  return chosen;
}

/**
 * Determines whether a bot should take the open discard card or draw from closed deck.
 */
export function shouldBotTakeDiscardCard(
  botHand: PlayingCard[],
  openCard: PlayingCard | undefined,
  wildJokerRank: Rank | null,
  smartDrawEnabled: boolean
): boolean {
  if (!openCard || !smartDrawEnabled) return false;

  // 1. If open card is a Wild Joker, definitely take it!
  if (wildJokerRank && openCard.rank === wildJokerRank) {
    return true;
  }

  // 2. Check if open card completes or extends an existing suit sequence
  const sameSuitCards = botHand.filter((c) => c.suit === openCard.suit);
  if (sameSuitCards.length >= 2) {
    const rankValues = sameSuitCards.map((c) => c.value);
    // If adjacent or completes an inside straight
    const targetVal = openCard.value;
    const hasAdj1 = rankValues.includes(targetVal - 1);
    const hasAdj2 = rankValues.includes(targetVal + 1);
    const hasSkip1 = rankValues.includes(targetVal - 2);
    const hasSkip2 = rankValues.includes(targetVal + 2);

    if ((hasAdj1 && hasAdj2) || (hasAdj1 && hasSkip2) || (hasAdj2 && hasSkip1)) {
      return true; // Completes a pure sequence run!
    }
  }

  // 3. Check if open card completes a Set (same rank, different suits)
  const sameRankCards = botHand.filter((c) => c.rank === openCard.rank && c.suit !== openCard.suit);
  if (sameRankCards.length >= 2) {
    return true; // Completes a 3-of-a-kind set!
  }

  return false;
}

/**
 * Advanced Discard AI: Chooses the optimal card for the bot to discard.
 * Prioritizes high deadwood cards (Kings, Queens, Jacks, 10s that do not belong to combinations).
 */
export function chooseBotOptimalDiscard(
  hand: PlayingCard[],
  wildJokerRank: Rank | null,
  smartDiscardEnabled: boolean
): PlayingCard {
  if (!smartDiscardEnabled || hand.length === 0) {
    return hand[0];
  }

  // Never discard a wild joker if possible
  const nonJokers = hand.filter((c) => !c.isJoker && (wildJokerRank ? c.rank !== wildJokerRank : true));
  const pool = nonJokers.length > 0 ? nonJokers : hand;

  // Score each card by how "isolated" or "high value" it is
  const scored = pool.map((card) => {
    let penaltyScore = card.points; // Face cards have high points (10)

    // Check suit connectivity
    const sameSuitCards = pool.filter((c) => c.suit === card.suit && c.id !== card.id);
    const hasNeighbour = sameSuitCards.some((c) => Math.abs(c.value - card.value) <= 2);
    if (!hasNeighbour) {
      penaltyScore += 25; // Isolated card, great to discard!
    }

    // Check rank connectivity (pairs/sets)
    const sameRankCount = pool.filter((c) => c.rank === card.rank && c.id !== card.id).length;
    if (sameRankCount === 0) {
      penaltyScore += 15;
    } else {
      penaltyScore -= sameRankCount * 12; // Part of potential set, retain it!
    }

    return { card, score: penaltyScore };
  });

  // Sort by highest penalty score descending (first to discard)
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.card || hand[0];
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
  const {
    botTurnsCount,
    botWinRatePercent,
    aiMode,
    forceWinner,
  } = params;

  // 1. Force Winner Override from Admin Panel
  if (forceWinner === 'BOT') return true;
  if (forceWinner === 'PLAYER') return false;

  // 2. Minimum turn check so bots don't declare on turn 0 before dealing completes
  if (botTurnsCount < 3) return false;

  // 3. Evaluation based on AI Mode:
  if (aiMode === 'MASTER_97') {
    // Master 97% Bot Win Rate:
    // Bots mature their hand rapidly between turn 4 and 8.
    // By turn 5-7, probability of winning declare is extremely high (~97%).
    const baseWinChance = Math.min(0.97, (botTurnsCount - 3) * 0.26 + 0.35);
    const winRoll = Math.random();
    return winRoll < (baseWinChance * (botWinRatePercent / 100));
  }

  if (aiMode === 'PLAYER_ADVANTAGE_67_78') {
    // Real Player Target Win Rate (67% - 78%):
    // Real player has the strong edge. Bots only declare after extended turns (turn 9+) or if player stalls.
    if (botTurnsCount < 7) return false;
    const botChance = 1 - (params.playerTargetWinRatePercent / 100); // ~22% - 33%
    return Math.random() < (botChance * 0.3);
  }

  if (aiMode === 'BALANCED_50') {
    if (botTurnsCount < 5) return false;
    return Math.random() < 0.45;
  }

  // Custom AI Mode
  const customChance = (botWinRatePercent / 100) * Math.min(1.0, (botTurnsCount - 2) * 0.2);
  return Math.random() < customChance;
}

/**
 * Returns a realistic Hinglish / Hindi chat message for bots.
 */
export function getRandomBotChat(): string {
  const idx = Math.floor(Math.random() * BOT_CHAT_MESSAGES.length);
  return BOT_CHAT_MESSAGES[idx];
}
