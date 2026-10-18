export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface PlayingCard {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // 1 to 13
  points: number; // For rummy scoring: A=10, K/Q/J/10=10, others face value
  isJoker?: boolean;
}

export type GameCategory = 'CASH' | 'TOURNAMENTS';
export type CashGameVariant = 'Points' | 'Pool' | 'Deals';
export type PlayersCount = 2 | 6;

export interface UserProfile {
  id: string;
  username: string;
  phone: string;
  email: string;
  telegram: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  avatar: string;
  depositBalance: number;
  withdrawalBalance: number;
  bonusBalance: number;
  practiceChips: number;
  isKycVerified: boolean;
  isBanned: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface BankAccount {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  amount: number;
  tdsFee: number;
  netPayable: number;
  bankAccount: BankAccount;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestTime: string;
  processedTime?: string;
  adminRemark?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'GAME_ENTRY' | 'GAME_WIN' | 'REFERRAL_BONUS' | 'COUPON_BONUS';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface Tournament {
  id: string;
  title: string;
  timeDisplay: string;
  startTime: string;
  entryFee: number; // 0 for free
  prizePool: number;
  maxParticipants: number;
  joinedCount: number;
  status: 'OPEN' | 'FULL' | 'LIVE' | 'COMPLETED';
  registeredUserIds: string[];
}

export interface ActiveGameTable {
  id: string;
  name: string;
  category: GameCategory;
  variant: CashGameVariant;
  playersCount: PlayersCount;
  pointValue?: number;
  entryFee: number;
  prizePool: number;
  status: 'WAITING' | 'IN_PLAY' | 'FINISHED';
  currentPlayers: number;
  gameTypeDetail?: string; // '101' | '201' | '2' | '3' | 'Classic' | 'Double'
}

export interface Coupon {
  code: string;
  bonusPercent: number;
  maxBonus: number;
  minDeposit: number;
  description: string;
  active: boolean;
}

export interface AdminSettings {
  houseRakePercent: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  welcomeBonus: number;
  referralBonus: number;
  bannerBroadcast: string;
  soundEnabled: boolean;
  maintenanceMode: boolean;
}

export interface GameRoom {
  id: string;
  room_code: string;
  variant: 'Points' | 'Pool' | 'Deals';
  game_type_detail?: string; // '101' | '201' | '2' | '3' | 'Classic' | 'Double'
  max_players: 2 | 6;
  entry_chips: number;
  point_value: number;
  elimination_threshold?: number;
  total_deals?: number;
  status: 'WAITING' | 'COUNTDOWN' | 'IN_PLAY' | 'COMPLETED' | 'ABANDONED';
  created_by?: string;
  created_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar: string;
  seat_index: number;
  status: 'WAITING' | 'READY' | 'PLAYING' | 'DROPPED' | 'DISCONNECTED';
  is_dealer: boolean;
  joined_at: string;
}

export interface RoundScoreRecord {
  round: number;
  deal?: number;
  winnerId: string;
  scores: Record<string, number>;
  cumulativeScores: Record<string, number>;
  eliminatedIds?: string[];
}

export interface GameSession {
  id: string;
  room_id: string;
  round_number: number;
  deal_number?: number;
  total_deals?: number;
  elimination_threshold?: number;
  cumulative_scores?: Record<string, number>;
  eliminated_user_ids?: string[];
  round_history?: RoundScoreRecord[];
  is_table_completed?: boolean;
  wild_joker_card: PlayingCard;
  closed_deck_count: number;
  discard_pile: PlayingCard[];
  current_turn_seat: number;
  turn_timer: number;
  status: 'ACTIVE' | 'ROUND_FINISHED' | 'FINISHED';
  winner_user_id?: string;
}

export interface PlayerGameState {
  id: string;
  session_id: string;
  user_id: string;
  seat_index: number;
  hand_cards: PlayingCard[];
  card_groups: PlayingCard[][];
  has_drawn: boolean;
  score: number;
  status: 'PLAYING' | 'DROPPED' | 'SHOW' | 'WON';
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar: string;
  wins: number;
  matches_played: number;
  practice_chips: number;
  win_rate: number;
}

