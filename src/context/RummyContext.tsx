import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  WithdrawalRequest,
  Transaction,
  Tournament,
  ActiveGameTable,
  Coupon,
  AdminSettings,
  BankAccount,
  GameRoom,
  RoomPlayer,
  GameSession,
  BotSettings,
  BotSystemStats,
} from '../types/rummy';
import { DEFAULT_BOT_SETTINGS, DEFAULT_BOT_STATS } from '../utils/botEngine';
import { sounds } from '../utils/sound';
import { triggerWinConfetti } from '../utils/confetti';
import { getSavedAuthUser, checkIsUserAdmin } from '../lib/supabase';

interface RummyContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  withdrawalRequests: WithdrawalRequest[];
  transactions: Transaction[];
  tournaments: Tournament[];
  activeTables: ActiveGameTable[];
  coupons: Coupon[];
  adminSettings: AdminSettings;
  soundEnabled: boolean;
  activeScreen: 'LOBBY' | 'CHALLENGER' | 'TOURNAMENTS' | 'REFER_EARN' | 'WALLET' | 'WITHDRAW' | 'ADD_CASH' | 'GAME_TABLE';
  activeGameConfig: {
    category: 'CASH' | 'TOURNAMENTS';
    variant: 'Points' | 'Pool' | 'Deals';
    playersCount: 2 | 6;
    entryFee: number;
    pointValue?: number;
    gameTypeDetail?: string; // 'Classic' | 'Double' | '101' | '201' | '3' | '6'
    roomId?: string;
    isMultiplayer?: boolean;
  } | null;
  multiplayerRoom: import('../types/rummy').GameRoom | null;
  multiplayerPlayer: import('../types/rummy').RoomPlayer | null;
  multiplayerSession: import('../types/rummy').GameSession | null;
  notificationBadgeCount: number;
  unreadBroadcast: string | null;
  isAdmin: boolean;
  checkAdminPermissions: () => Promise<boolean>;

  // Actions
  setActiveScreen: (screen: 'LOBBY' | 'CHALLENGER' | 'TOURNAMENTS' | 'REFER_EARN' | 'WALLET' | 'WITHDRAW' | 'ADD_CASH' | 'GAME_TABLE') => void;
  setSoundEnabled: (enabled: boolean) => void;
  dismissBroadcast: () => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  setMultiplayerState: (
    room: import('../types/rummy').GameRoom | null,
    player: import('../types/rummy').RoomPlayer | null,
    session?: import('../types/rummy').GameSession | null
  ) => void;
  addCash: (amount: number, couponCode?: string) => { success: boolean; bonusAdded: number };
  requestWithdrawal: (amount: number, bankAccount: BankAccount) => { success: boolean; message: string };
  joinTournament: (tournamentId: string) => { success: boolean; message: string };
  launchGame: (config: NonNullable<RummyContextType['activeGameConfig']>) => boolean;
  settleGameWin: (winnings: number, practice?: boolean) => void;
  exitGame: () => void;
  refillPracticeChips: () => void;

  // Admin Actions
  approveWithdrawal: (requestId: string, remark?: string) => void;
  rejectWithdrawal: (requestId: string, remark?: string) => void;
  adminModifyUserBalance: (userId: string, depositDelta: number, withdrawalDelta: number, bonusDelta: number) => void;
  adminToggleUserBan: (userId: string) => void;
  adminVerifyKyc: (userId: string) => void;
  submitKycDocument: (doc: {
    type: 'AADHAAR' | 'PAN';
    documentNumber: string;
    holderName: string;
    dob?: string;
    frontImage?: string;
    backImage?: string;
  }) => { success: boolean; message: string };
  adminApproveKycDoc: (userId: string, docType: 'AADHAAR' | 'PAN' | 'ALL') => void;
  adminRejectKycDoc: (userId: string, docType: 'AADHAAR' | 'PAN', reason: string) => void;
  adminCreateTournament: (tournament: Omit<Tournament, 'id' | 'joinedCount' | 'registeredUserIds'>) => void;
  adminUpdateSettings: (settings: Partial<AdminSettings>) => void;
  adminSendBroadcast: (message: string) => void;
  adminAddCoupon: (coupon: Coupon) => void;
  activeLiveTables: import('../types/rummy').ActiveGameTable[];
  adminTerminateLiveTable: (tableId: string) => void;
  adminCreateSponsoredTable: (table: Omit<import('../types/rummy').ActiveGameTable, 'id' | 'currentPlayers' | 'status'>) => void;
  adminResetTableStakes: (tableId: string, pointValue: number, entryFee: number) => void;
  adminAddManualTransaction: (params: {
    userId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'PRACTICE_CHIPS';
    amount: number;
    description: string;
  }) => void;

  // Bot AI System & 100k+ Bot Pool Control (Admin Hidden)
  botSettings: BotSettings;
  botStats: BotSystemStats;
  updateBotSettings: (updates: Partial<BotSettings>) => void;
  resetBotSettings: () => void;
  triggerAdminBotWinOverride: (target: 'BOT' | 'PLAYER' | 'NONE') => void;
  recordBotGameResult: (winnerIsPlayer: boolean, rakeAmount?: number) => void;
  simulateBotBatchGames: (count: number) => { botWins: number; playerWins: number; winRate: number };
}

const RummyContext = createContext<RummyContextType | null>(null);

const STORAGE_KEY = 'master_rummy_v1_store';

export const createDefaultGuestUser = (): UserProfile => ({
  id: `guest_${Date.now()}`,
  username: 'Guest Player',
  phone: '',
  whatsappNumber: '',
  isWhatsappVerified: false,
  is18PlusConfirmed: false,
  email: '',
  telegram: '',
  dob: '',
  gender: 'Male',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  depositBalance: 0.0,
  withdrawalBalance: 0.0,
  bonusBalance: 50.0, // Default ₹50 for all users!
  practiceChips: 10000,
  isKycVerified: false,
  isRegistered: false,
  hasDeposited: false,
  totalDeposited: 0,
  kycDetails: {
    is18PlusConfirmed: false,
    overallStatus: 'UNVERIFIED',
    aadhaar: {
      type: 'AADHAAR',
      documentNumber: '',
      holderName: '',
      status: 'NOT_SUBMITTED',
    },
    pan: {
      type: 'PAN',
      documentNumber: '',
      holderName: '',
      status: 'NOT_SUBMITTED',
    },
  },
  isBanned: false,
  referralCode: 'MRGUEST',
  createdAt: new Date().toISOString().split('T')[0],
});

const DEFAULT_USER: UserProfile = createDefaultGuestUser();

const INITIAL_USERS: UserProfile[] = [
  DEFAULT_USER,
  {
    id: '1000001',
    username: 'SufiyanZ***',
    phone: '9876543210',
    whatsappNumber: '9876543210',
    isWhatsappVerified: true,
    is18PlusConfirmed: true,
    email: 'sufiyan@example.com',
    telegram: '@sufiyan_pro',
    dob: '1995-04-12',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    depositBalance: 24500,
    withdrawalBalance: 14327000,
    bonusBalance: 1760000,
    practiceChips: 50000,
    isKycVerified: true,
    kycDetails: {
      is18PlusConfirmed: true,
      overallStatus: 'VERIFIED',
      aadhaar: {
        type: 'AADHAAR',
        documentNumber: '4928-1092-3841',
        holderName: 'Sufiyan Z',
        dob: '1995-04-12',
        status: 'VERIFIED',
        submittedAt: '2026-01-15',
        verifiedAt: '2026-01-16',
      },
      pan: {
        type: 'PAN',
        documentNumber: 'SUFYZ1234K',
        holderName: 'Sufiyan Z',
        dob: '1995-04-12',
        status: 'VERIFIED',
        submittedAt: '2026-01-15',
        verifiedAt: '2026-01-16',
      },
    },
    isBanned: false,
    referralCode: 'SUF999',
    createdAt: '2026-01-15',
  },
  {
    id: '1000002',
    username: 'AjayMaha***',
    phone: '9811223344',
    whatsappNumber: '9811223344',
    isWhatsappVerified: true,
    is18PlusConfirmed: true,
    email: 'ajay@example.com',
    telegram: '',
    dob: '1992-08-20',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    depositBalance: 18000,
    withdrawalBalance: 10193000,
    bonusBalance: 978000,
    practiceChips: 25000,
    isKycVerified: false,
    kycDetails: {
      is18PlusConfirmed: true,
      overallStatus: 'PENDING',
      aadhaar: {
        type: 'AADHAAR',
        documentNumber: '7182-9381-0021',
        holderName: 'Ajay Mahajan',
        dob: '1992-08-20',
        status: 'PENDING',
        submittedAt: '2026-10-17',
        frontImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      },
      pan: {
        type: 'PAN',
        documentNumber: 'AJAYM5678P',
        holderName: 'Ajay Mahajan',
        dob: '1992-08-20',
        status: 'PENDING',
        submittedAt: '2026-10-17',
        frontImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
    },
    isBanned: false,
    referralCode: 'AJAY77',
    createdAt: '2026-02-10',
  },
  {
    id: '1000003',
    username: 'Bismilab***',
    phone: '9798991122',
    email: 'bismil@example.com',
    telegram: '',
    dob: '1997-11-03',
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    depositBalance: 12000,
    withdrawalBalance: 6319000,
    bonusBalance: 2738000,
    practiceChips: 20000,
    isKycVerified: true,
    isBanned: false,
    referralCode: 'BISMI3',
    createdAt: '2026-03-01',
  },
  {
    id: '1000004',
    username: 'player82***',
    phone: '9123456780',
    email: 'p82@example.com',
    telegram: '',
    dob: '1990-06-15',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    depositBalance: 500,
    withdrawalBalance: 2000,
    bonusBalance: 708000,
    practiceChips: 10000,
    isKycVerified: true,
    isBanned: false,
    referralCode: 'P82WIN',
    createdAt: '2026-05-18',
  },
];

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour_1',
    title: 'Daily Flash 50K Blast',
    timeDisplay: 'Starting in 15 mins',
    startTime: '2026-10-18T18:45:00Z',
    entryFee: 50,
    prizePool: 50000,
    maxParticipants: 250,
    joinedCount: 184,
    status: 'OPEN',
    registeredUserIds: ['1000001'],
  },
  {
    id: 'tour_2',
    title: 'Super Sunday ₹5 Lakh Mega Series',
    timeDisplay: '08:00 PM, Today',
    startTime: '2026-10-18T20:00:00Z',
    entryFee: 100,
    prizePool: 500000,
    maxParticipants: 1000,
    joinedCount: 642,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_3',
    title: 'Night Owl Super Cash Series',
    timeDisplay: '10:00 PM, Tonight',
    startTime: '2026-10-18T22:00:00Z',
    entryFee: 10,
    prizePool: 15000,
    maxParticipants: 500,
    joinedCount: 312,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_4',
    title: 'Mega Afternoon Delight',
    timeDisplay: '02:00 PM, Today',
    startTime: '2026-10-18T14:00:00Z',
    entryFee: 25,
    prizePool: 25000,
    maxParticipants: 400,
    joinedCount: 280,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_5',
    title: 'High Roller Elite Championship',
    timeDisplay: '09:00 PM, Today',
    startTime: '2026-10-18T21:00:00Z',
    entryFee: 500,
    prizePool: 1000000,
    maxParticipants: 200,
    joinedCount: 114,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_6',
    title: 'Morning Boost Cash Jackpot',
    timeDisplay: '09:30 AM, Tomorrow',
    startTime: '2026-10-19T09:30:00Z',
    entryFee: 5,
    prizePool: 10000,
    maxParticipants: 500,
    joinedCount: 215,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_7',
    title: 'Pro Rumble 6-Max Express',
    timeDisplay: '06:00 PM, Today',
    startTime: '2026-10-18T18:00:00Z',
    entryFee: 15,
    prizePool: 20000,
    maxParticipants: 300,
    joinedCount: 142,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_8',
    title: 'Midnight Bounty Hunter 30K',
    timeDisplay: '11:59 PM, Tonight',
    startTime: '2026-10-18T23:59:00Z',
    entryFee: 20,
    prizePool: 30000,
    maxParticipants: 350,
    joinedCount: 88,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_9',
    title: 'Speed Rummy Knockout 40K',
    timeDisplay: 'Starting in 45 mins',
    startTime: '2026-10-18T19:15:00Z',
    entryFee: 35,
    prizePool: 40000,
    maxParticipants: 200,
    joinedCount: 96,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_10',
    title: 'Grand Master Real Cash Cup',
    timeDisplay: '07:00 PM, Today',
    startTime: '2026-10-18T19:00:00Z',
    entryFee: 250,
    prizePool: 250000,
    maxParticipants: 250,
    joinedCount: 135,
    status: 'OPEN',
    registeredUserIds: [],
  },
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wd_101',
    userId: '1000004',
    userName: 'player82***',
    phone: '9123456780',
    amount: 2000,
    tdsFee: 100,
    netPayable: 1900,
    bankAccount: {
      accountHolder: 'Ramesh Patel',
      accountNumber: '918237461928',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
    },
    status: 'PENDING',
    requestTime: '2026-10-17 14:20:00',
  },
  {
    id: 'wd_102',
    userId: '1000002',
    userName: 'AjayMaha***',
    phone: '9811223344',
    amount: 5000,
    tdsFee: 250,
    netPayable: 4750,
    bankAccount: {
      accountHolder: 'Ajay Mahajan',
      accountNumber: '320987461122',
      ifsc: 'SBIN0005544',
      bankName: 'State Bank of India',
    },
    status: 'APPROVED',
    requestTime: '2026-10-16 11:30:00',
    processedTime: '2026-10-16 12:00:00',
    adminRemark: 'Auto-approved via IMPS payout',
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'EXTRA004',
    bonusPercent: 160,
    maxBonus: 10000,
    minDeposit: 100,
    description: 'Get 160% Instant Bonus cash on deposits!',
    active: true,
  },
  {
    code: 'FIRST100',
    bonusPercent: 100,
    maxBonus: 5000,
    minDeposit: 50,
    description: '100% First Deposit Match',
    active: true,
  },
  {
    code: 'FESTIVAL300',
    bonusPercent: 200,
    maxBonus: 20000,
    minDeposit: 500,
    description: 'Festival Special: 200% Bonus up to ₹20,000',
    active: true,
  },
];

export const RummyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial persistent state if available
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it's the old hardcoded default demo account (player35150 or 19098975) or not registered, reset to fresh guest with ₹50
        if (parsed.id === '19098975' || parsed.username === 'player35150') {
          return createDefaultGuestUser();
        }
        if (parsed.bonusBalance === undefined || parsed.bonusBalance === null) {
          parsed.bonusBalance = 50.0;
        }
        return parsed;
      }
      return createDefaultGuestUser();
    } catch {
      return createDefaultGuestUser();
    }
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_all_users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_withdrawals`);
      return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'tx_init_1',
          userId: DEFAULT_USER.id,
          type: 'DEPOSIT',
          amount: 100,
          status: 'SUCCESS',
          description: 'UPI Deposit - Successful',
          timestamp: '2026-10-16 10:15',
          balanceAfter: 6.54,
        },
        {
          id: 'tx_init_2',
          userId: DEFAULT_USER.id,
          type: 'COUPON_BONUS',
          amount: 71.36,
          status: 'SUCCESS',
          description: 'Bonus credited via EXTRA004',
          timestamp: '2026-10-16 10:15',
          balanceAfter: 6.54,
        },
      ];
    } catch {
      return [];
    }
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tournaments`);
      return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    houseRakePercent: 3,
    minWithdrawal: 200,
    maxWithdrawal: 50000,
    welcomeBonus: 50,
    referralBonus: 1100,
    bannerBroadcast: 'BUY 1 GET 3: Recharge once and get instant extra 2-day cash rewards!',
    soundEnabled: true,
    maintenanceMode: false,
    adminUpiId: 'masterrummy@okaxis',
    adminMerchantName: 'Master Rummy Online (Gaming Ops)',
    adminQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=masterrummy@okaxis&pn=MasterRummy&cu=INR',
    minDeposit: 100,
    maxDeposit: 50000,
    customApkUrl: '/downloads/MasterRummy.apk',
    apkVersion: 'v2.4.1',
    apkFileSize: '18.4 MB',
  });

  const [activeLiveTables, setActiveLiveTables] = useState<import('../types/rummy').ActiveGameTable[]>([
    {
      id: 'tbl_pt_2p_rapid',
      name: 'Rapid Points 2P Cash',
      category: 'CASH',
      variant: 'Points',
      playersCount: 2,
      pointValue: 0.1,
      entryFee: 8,
      prizePool: 15.52,
      status: 'IN_PLAY',
      currentPlayers: 2,
      gameTypeDetail: 'Classic',
    },
    {
      id: 'tbl_pt_6p_classic',
      name: 'Classic Points 6-Max',
      category: 'CASH',
      variant: 'Points',
      playersCount: 6,
      pointValue: 0.5,
      entryFee: 40,
      prizePool: 232.8,
      status: 'IN_PLAY',
      currentPlayers: 6,
      gameTypeDetail: 'Classic',
    },
    {
      id: 'tbl_pool_101',
      name: '101 Pool Elimination Table',
      category: 'CASH',
      variant: 'Pool',
      playersCount: 6,
      entryFee: 50,
      prizePool: 291.0,
      status: 'IN_PLAY',
      currentPlayers: 5,
      gameTypeDetail: '101',
    },
    {
      id: 'tbl_pool_201',
      name: '201 Pool Marathon Arena',
      category: 'CASH',
      variant: 'Pool',
      playersCount: 6,
      entryFee: 100,
      prizePool: 582.0,
      status: 'WAITING',
      currentPlayers: 3,
      gameTypeDetail: '201',
    },
    {
      id: 'tbl_deals_2',
      name: '2-Deals Best of Two',
      category: 'CASH',
      variant: 'Deals',
      playersCount: 2,
      entryFee: 25,
      prizePool: 48.5,
      status: 'IN_PLAY',
      currentPlayers: 2,
      gameTypeDetail: '2',
    },
    {
      id: 'tbl_deals_3',
      name: '3-Deals Grand Series',
      category: 'CASH',
      variant: 'Deals',
      playersCount: 6,
      entryFee: 75,
      prizePool: 436.5,
      status: 'WAITING',
      currentPlayers: 4,
      gameTypeDetail: '3',
    },
    {
      id: 'tbl_high_stakes',
      name: 'VIP High Roller Points Rummy',
      category: 'CASH',
      variant: 'Points',
      playersCount: 2,
      pointValue: 2.0,
      entryFee: 160,
      prizePool: 310.4,
      status: 'IN_PLAY',
      currentPlayers: 2,
      gameTypeDetail: 'VIP',
    },
  ]);

  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'LOBBY' | 'CHALLENGER' | 'TOURNAMENTS' | 'REFER_EARN' | 'WALLET' | 'WITHDRAW' | 'ADD_CASH' | 'GAME_TABLE'>('LOBBY');
  const [activeGameConfig, setActiveGameConfig] = useState<RummyContextType['activeGameConfig']>(null);
  const [multiplayerRoom, setMultiplayerRoom] = useState<GameRoom | null>(null);
  const [multiplayerPlayer, setMultiplayerPlayer] = useState<RoomPlayer | null>(null);
  const [multiplayerSession, setMultiplayerSession] = useState<GameSession | null>(null);

  const [notificationBadgeCount, setNotificationBadgeCount] = useState(1);
  const [unreadBroadcast, setUnreadBroadcast] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Bot AI System & 100k+ Bot Pool State (Admin Controlled)
  const [botSettings, setBotSettings] = useState<BotSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_bot_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_BOT_SETTINGS;
    } catch {
      return DEFAULT_BOT_SETTINGS;
    }
  });

  const [botStats, setBotStats] = useState<BotSystemStats>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_bot_stats`);
      return saved ? JSON.parse(saved) : DEFAULT_BOT_STATS;
    } catch {
      return DEFAULT_BOT_STATS;
    }
  });

  const updateBotSettings = (updates: Partial<BotSettings>) => {
    setBotSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(`${STORAGE_KEY}_bot_settings`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetBotSettings = () => {
    setBotSettings(DEFAULT_BOT_SETTINGS);
    try {
      localStorage.setItem(`${STORAGE_KEY}_bot_settings`, JSON.stringify(DEFAULT_BOT_SETTINGS));
    } catch {}
  };

  const triggerAdminBotWinOverride = (target: 'BOT' | 'PLAYER' | 'NONE') => {
    updateBotSettings({ forceNextWinner: target });
  };

  const recordBotGameResult = (winnerIsPlayer: boolean, rakeAmount = 0) => {
    setBotStats((prev) => {
      const next: BotSystemStats = {
        ...prev,
        totalGamesTracked: prev.totalGamesTracked + 1,
        playerWinsCount: winnerIsPlayer ? prev.playerWinsCount + 1 : prev.playerWinsCount,
        botWinsCount: !winnerIsPlayer ? prev.botWinsCount + 1 : prev.botWinsCount,
        totalBotRakeCollected: prev.totalBotRakeCollected + rakeAmount,
      };
      try {
        localStorage.setItem(`${STORAGE_KEY}_bot_stats`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const simulateBotBatchGames = (count: number) => {
    const targetWinRate = botSettings.botWinRatePercent / 100;
    let bWins = 0;
    let pWins = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < targetWinRate) {
        bWins++;
      } else {
        pWins++;
      }
    }
    setBotStats((prev) => {
      const next: BotSystemStats = {
        ...prev,
        totalGamesTracked: prev.totalGamesTracked + count,
        botWinsCount: prev.botWinsCount + bWins,
        playerWinsCount: prev.playerWinsCount + pWins,
      };
      try {
        localStorage.setItem(`${STORAGE_KEY}_bot_stats`, JSON.stringify(next));
      } catch {}
      return next;
    });
    return {
      botWins: bWins,
      playerWins: pWins,
      winRate: Number(((bWins / count) * 100).toFixed(1)),
    };
  };

  const checkAdminPermissions = async (): Promise<boolean> => {
    const admin = await checkIsUserAdmin();
    setIsAdmin(admin);
    return admin;
  };

  // Restore saved auth user on initial launch and check admin role
  useEffect(() => {
    const saved = getSavedAuthUser();
    if (saved) {
      setCurrentUser((prev) => ({
        ...prev,
        id: saved.id,
        username: saved.username,
        avatar: saved.avatar,
        practiceChips: saved.practiceChips || prev.practiceChips,
        email: saved.email || prev.email,
      }));
    }
    checkIsUserAdmin(saved).then((admin) => setIsAdmin(admin));
  }, []);

  const setMultiplayerState = (
    room: GameRoom | null,
    player: RoomPlayer | null,
    session?: GameSession | null
  ) => {
    setMultiplayerRoom(room);
    setMultiplayerPlayer(player);
    if (session !== undefined) {
      setMultiplayerSession(session);
    }
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_all_users`, JSON.stringify(allUsers));
      localStorage.setItem(`${STORAGE_KEY}_withdrawals`, JSON.stringify(withdrawalRequests));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_tournaments`, JSON.stringify(tournaments));
    } catch {
      // Ignore quota error in sandboxes
    }
  }, [currentUser, allUsers, withdrawalRequests, transactions, tournaments]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sounds.enabled = enabled;
  };

  const dismissBroadcast = () => {
    setUnreadBroadcast(null);
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      setAllUsers((users) => users.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  // Add Cash Function
  const addCash = (amount: number, couponCode?: string) => {
    sounds.playCoinSound();
    let bonusRate = 0;
    if (couponCode) {
      const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (coupon) {
        bonusRate = coupon.bonusPercent;
      }
    } else {
      bonusRate = 160; // Default EXTRA004 promo
    }

    const bonusAmount = Math.round((amount * bonusRate) / 100);
    const newDeposit = currentUser.depositBalance + amount;
    const newBonus = (currentUser.bonusBalance || 0) + bonusAmount;
    const newTotalDeposited = (currentUser.totalDeposited || 0) + amount;

    const newTxDeposit: Transaction = {
      id: `tx_${Date.now()}_dep`,
      userId: currentUser.id,
      type: 'DEPOSIT',
      amount,
      status: 'SUCCESS',
      description: `Deposit via UPI - ₹${amount}`,
      timestamp: new Date().toLocaleString(),
      balanceAfter: newDeposit + currentUser.withdrawalBalance,
    };

    const newTxBonus: Transaction = {
      id: `tx_${Date.now()}_bon`,
      userId: currentUser.id,
      type: 'COUPON_BONUS',
      amount: bonusAmount,
      status: 'SUCCESS',
      description: `Bonus Credited (${couponCode || 'EXTRA004'})`,
      timestamp: new Date().toLocaleString(),
      balanceAfter: newDeposit + currentUser.withdrawalBalance,
    };

    setCurrentUser((prev) => ({
      ...prev,
      depositBalance: Number(newDeposit.toFixed(2)),
      bonusBalance: Number(newBonus.toFixed(2)),
      hasDeposited: true,
      totalDeposited: newTotalDeposited,
    }));

    setTransactions((prev) => [newTxDeposit, newTxBonus, ...prev]);

    return { success: true, bonusAdded: bonusAmount };
  };

  // Request Withdrawal
  const requestWithdrawal = (amount: number, bankAccount: BankAccount) => {
    const isKycApproved = currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED';
    if (!isKycApproved) {
      return {
        success: false,
        message: 'Strict 18+ KYC Required: You must complete and have your Aadhaar Card & PAN Card approved before requesting withdrawals.',
      };
    }

    const minDepositRequired = 100;
    const totalUserDeposits = currentUser.totalDeposited || 0;
    if (!currentUser.hasDeposited || totalUserDeposits < minDepositRequired) {
      return {
        success: false,
        message: `Minimum Deposit Required: To activate bank withdrawals, you must complete at least one minimum deposit of ₹${minDepositRequired}.`,
      };
    }

    if (amount < adminSettings.minWithdrawal) {
      return { success: false, message: `Minimum withdrawal amount is ₹${adminSettings.minWithdrawal}` };
    }
    if (amount > currentUser.withdrawalBalance) {
      return { success: false, message: `Insufficient withdrawal balance (₹${currentUser.withdrawalBalance.toFixed(2)})` };
    }

    sounds.playCoinSound();
    const tdsFee = Math.round(amount * 0.05); // 5% TDS / Processing fee preview
    const netPayable = amount - tdsFee;

    const newRequest: WithdrawalRequest = {
      id: `wd_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.username,
      phone: currentUser.phone,
      amount,
      tdsFee,
      netPayable,
      bankAccount,
      status: 'PENDING',
      requestTime: new Date().toLocaleString(),
    };

    const newWithdrawalBalance = currentUser.withdrawalBalance - amount;

    setCurrentUser((prev) => ({
      ...prev,
      withdrawalBalance: Number(newWithdrawalBalance.toFixed(2)),
    }));

    setWithdrawalRequests((prev) => [newRequest, ...prev]);

    const newTx: Transaction = {
      id: `tx_${Date.now()}_wd`,
      userId: currentUser.id,
      type: 'WITHDRAWAL',
      amount,
      status: 'PENDING',
      description: `Withdrawal Request to ${bankAccount.bankName} (${bankAccount.accountNumber.slice(-4)})`,
      timestamp: new Date().toLocaleString(),
      balanceAfter: currentUser.depositBalance + newWithdrawalBalance,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return { success: true, message: 'Withdrawal request submitted for Admin approval!' };
  };

  // Join Tournament
  const joinTournament = (tournamentId: string) => {
    const t = tournaments.find((item) => item.id === tournamentId);
    if (!t) return { success: false, message: 'Tournament not found' };

    if (t.joinedCount >= t.maxParticipants) {
      return { success: false, message: 'Tournament is full' };
    }
    if (t.registeredUserIds.includes(currentUser.id)) {
      return { success: false, message: 'Already registered for this tournament' };
    }

    if (t.entryFee > 0) {
      const totalCash = currentUser.depositBalance + currentUser.withdrawalBalance;
      if (totalCash < t.entryFee) {
        return { success: false, message: `Insufficient balance (Need ₹${t.entryFee})` };
      }

      // Deduct entry fee
      let remaining = t.entryFee;
      let newDeposit = currentUser.depositBalance;
      let newWithdrawal = currentUser.withdrawalBalance;

      if (newDeposit >= remaining) {
        newDeposit -= remaining;
      } else {
        remaining -= newDeposit;
        newDeposit = 0;
        newWithdrawal -= remaining;
      }

      setCurrentUser((prev) => ({
        ...prev,
        depositBalance: Number(newDeposit.toFixed(2)),
        withdrawalBalance: Number(newWithdrawal.toFixed(2)),
      }));

      const newTx: Transaction = {
        id: `tx_${Date.now()}_tour`,
        userId: currentUser.id,
        type: 'GAME_ENTRY',
        amount: t.entryFee,
        status: 'SUCCESS',
        description: `Entry fee for ${t.title}`,
        timestamp: new Date().toLocaleString(),
        balanceAfter: newDeposit + newWithdrawal,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    sounds.playCardClick();

    setTournaments((prev) =>
      prev.map((item) =>
        item.id === tournamentId
          ? {
              ...item,
              joinedCount: item.joinedCount + 1,
              status: item.joinedCount + 1 >= item.maxParticipants ? 'FULL' : item.status,
              registeredUserIds: [...item.registeredUserIds, currentUser.id],
            }
          : item
      )
    );

    return { success: true, message: `Successfully registered for ${t.title}!` };
  };

  // Launch Game (Real Cash & Welcome Bonus Entry)
  const launchGame = (config: NonNullable<RummyContextType['activeGameConfig']>) => {
    const totalPlayableCash = currentUser.depositBalance + currentUser.withdrawalBalance + (currentUser.bonusBalance || 0);
    if (totalPlayableCash < config.entryFee) {
      return false;
    }

    // Deduct entry fee: priority bonus balance (enabling new users to play with their ₹50 welcome bonus!), then deposit, then withdrawal
    let remaining = config.entryFee;
    let newBonus = currentUser.bonusBalance || 0;
    let newDeposit = currentUser.depositBalance;
    let newWithdrawal = currentUser.withdrawalBalance;

    if (newBonus >= remaining) {
      newBonus -= remaining;
      remaining = 0;
    } else {
      remaining -= newBonus;
      newBonus = 0;
    }

    if (remaining > 0) {
      if (newDeposit >= remaining) {
        newDeposit -= remaining;
        remaining = 0;
      } else {
        remaining -= newDeposit;
        newDeposit = 0;
        newWithdrawal = Math.max(0, newWithdrawal - remaining);
      }
    }

    setCurrentUser((prev) => ({
      ...prev,
      bonusBalance: Number(newBonus.toFixed(2)),
      depositBalance: Number(newDeposit.toFixed(2)),
      withdrawalBalance: Number(newWithdrawal.toFixed(2)),
    }));

    const newTx: Transaction = {
      id: `tx_${Date.now()}_game`,
      userId: currentUser.id,
      type: 'GAME_ENTRY',
      amount: config.entryFee,
      status: 'SUCCESS',
      description: `${config.variant} Cash Rummy entry fee`,
      timestamp: new Date().toLocaleString(),
      balanceAfter: newDeposit + newWithdrawal,
    };
    setTransactions((prev) => [newTx, ...prev]);

    sounds.playCardDeal();
    setActiveGameConfig(config);
    setActiveScreen('GAME_TABLE');
    return true;
  };

  // Game Won (100% Real Cash Net Winnings Settlement)
  const settleGameWin = (winnings: number) => {
    triggerWinConfetti();
    sounds.playWinFanfare();

    const rake = (winnings * adminSettings.houseRakePercent) / 100;
    const netWin = Number((winnings - rake).toFixed(2));

    const newWithdrawalBal = currentUser.withdrawalBalance + netWin;

    setCurrentUser((prev) => ({
      ...prev,
      withdrawalBalance: Number(newWithdrawalBal.toFixed(2)),
    }));

    const newTx: Transaction = {
      id: `tx_${Date.now()}_win`,
      userId: currentUser.id,
      type: 'GAME_WIN',
      amount: netWin,
      status: 'SUCCESS',
      description: `Won Cash Rummy Game (Prize: ₹${winnings}, Rake: ₹${rake.toFixed(2)})`,
      timestamp: new Date().toLocaleString(),
      balanceAfter: currentUser.depositBalance + newWithdrawalBal,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const exitGame = () => {
    setActiveGameConfig(null);
    setActiveScreen('LOBBY');
  };

  const refillPracticeChips = () => {
    sounds.playCoinSound();
    setCurrentUser((prev) => ({
      ...prev,
      practiceChips: (prev.practiceChips || 0) + 10000,
    }));
  };

  // ADMIN ACTIONS
  const approveWithdrawal = (requestId: string, remark = 'Approved by Admin') => {
    sounds.playCoinSound();
    setWithdrawalRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'APPROVED',
              processedTime: new Date().toLocaleString(),
              adminRemark: remark,
            }
          : req
      )
    );

    // Update matching transaction status
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.description.includes(requestId) || (tx.type === 'WITHDRAWAL' && tx.status === 'PENDING')
          ? { ...tx, status: 'SUCCESS', description: `${tx.description} (Approved)` }
          : tx
      )
    );
  };

  const rejectWithdrawal = (requestId: string, remark = 'Rejected by Admin') => {
    const target = withdrawalRequests.find((r) => r.id === requestId);
    if (!target) return;

    sounds.playBell();

    setWithdrawalRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'REJECTED',
              processedTime: new Date().toLocaleString(),
              adminRemark: remark,
            }
          : req
      )
    );

    // Refund withdrawal balance to user
    if (target.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        withdrawalBalance: Number((prev.withdrawalBalance + target.amount).toFixed(2)),
      }));
    } else {
      setAllUsers((users) =>
        users.map((u) =>
          u.id === target.userId
            ? { ...u, withdrawalBalance: Number((u.withdrawalBalance + target.amount).toFixed(2)) }
            : u
        )
      );
    }
  };

  const adminModifyUserBalance = (
    userId: string,
    depositDelta: number,
    withdrawalDelta: number,
    bonusDelta: number
  ) => {
    sounds.playCoinSound();
    if (userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        depositBalance: Math.max(0, Number((prev.depositBalance + depositDelta).toFixed(2))),
        withdrawalBalance: Math.max(0, Number((prev.withdrawalBalance + withdrawalDelta).toFixed(2))),
        bonusBalance: Math.max(0, Number((prev.bonusBalance + bonusDelta).toFixed(2))),
      }));
    }
    setAllUsers((users) =>
      users.map((u) =>
        u.id === userId
          ? {
              ...u,
              depositBalance: Math.max(0, Number((u.depositBalance + depositDelta).toFixed(2))),
              withdrawalBalance: Math.max(0, Number((u.withdrawalBalance + withdrawalDelta).toFixed(2))),
              bonusBalance: Math.max(0, Number((u.bonusBalance + bonusDelta).toFixed(2))),
            }
          : u
      )
    );
  };

  const adminToggleUserBan = (userId: string) => {
    sounds.playBell();
    if (userId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, isBanned: !prev.isBanned }));
    }
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const submitKycDocument = (doc: {
    type: 'AADHAAR' | 'PAN';
    documentNumber: string;
    holderName: string;
    dob?: string;
    frontImage?: string;
    backImage?: string;
  }) => {
    sounds.playCoinSound();
    const now = new Date().toISOString().split('T')[0];

    const fallbackDoc = (type: 'AADHAAR' | 'PAN'): import('../types/rummy').KycDocument => ({
      type,
      documentNumber: '',
      holderName: '',
      status: 'NOT_SUBMITTED',
    });

    setCurrentUser((prev) => {
      const existingKyc = prev.kycDetails || {
        is18PlusConfirmed: true,
        overallStatus: 'UNVERIFIED' as const,
        aadhaar: fallbackDoc('AADHAAR'),
        pan: fallbackDoc('PAN'),
      };

      const updatedDoc: import('../types/rummy').KycDocument = {
        ...doc,
        status: 'PENDING',
        submittedAt: now,
      };

      const newAadhaar = doc.type === 'AADHAAR' ? updatedDoc : existingKyc.aadhaar;
      const newPan = doc.type === 'PAN' ? updatedDoc : existingKyc.pan;

      const isBothVerified = newAadhaar.status === 'VERIFIED' && newPan.status === 'VERIFIED';
      const overallStatus = isBothVerified ? 'VERIFIED' : 'PENDING';

      const updatedUser: UserProfile = {
        ...prev,
        is18PlusConfirmed: true,
        isKycVerified: isBothVerified,
        kycDetails: {
          is18PlusConfirmed: true,
          overallStatus,
          aadhaar: newAadhaar,
          pan: newPan,
        },
      };

      setAllUsers((users) => users.map((u) => (u.id === prev.id ? updatedUser : u)));
      return updatedUser;
    });

    return {
      success: true,
      message: `${doc.type === 'AADHAAR' ? 'Aadhaar Card' : 'PAN Card'} submitted successfully! Verification under review.`,
    };
  };

  const adminApproveKycDoc = (userId: string, docType: 'AADHAAR' | 'PAN' | 'ALL') => {
    sounds.playWinFanfare();
    const now = new Date().toISOString().split('T')[0];

    const updateUserKyc = (u: UserProfile): UserProfile => {
      const kyc = u.kycDetails || {
        is18PlusConfirmed: true,
        overallStatus: 'UNVERIFIED' as const,
        aadhaar: { type: 'AADHAAR', documentNumber: '8492-3847-1920', holderName: u.username, status: 'PENDING' },
        pan: { type: 'PAN', documentNumber: 'ABCDE1234F', holderName: u.username, status: 'PENDING' },
      };

      const newAadhaar =
        docType === 'AADHAAR' || docType === 'ALL'
          ? { ...kyc.aadhaar, status: 'VERIFIED' as const, verifiedAt: now }
          : kyc.aadhaar;

      const newPan =
        docType === 'PAN' || docType === 'ALL'
          ? { ...kyc.pan, status: 'VERIFIED' as const, verifiedAt: now }
          : kyc.pan;

      const isBoth = newAadhaar.status === 'VERIFIED' && newPan.status === 'VERIFIED';

      return {
        ...u,
        is18PlusConfirmed: true,
        isKycVerified: isBoth,
        kycDetails: {
          is18PlusConfirmed: true,
          overallStatus: isBoth ? 'VERIFIED' : 'PENDING',
          aadhaar: newAadhaar,
          pan: newPan,
        },
      };
    };

    if (userId === currentUser.id) {
      setCurrentUser((prev) => updateUserKyc(prev));
    }
    setAllUsers((users) => users.map((u) => (u.id === userId ? updateUserKyc(u) : u)));
  };

  const adminRejectKycDoc = (userId: string, docType: 'AADHAAR' | 'PAN', reason: string) => {
    sounds.playBell();

    const updateUserKyc = (u: UserProfile): UserProfile => {
      if (!u.kycDetails) return u;
      return {
        ...u,
        isKycVerified: false,
        kycDetails: {
          ...u.kycDetails,
          overallStatus: 'REJECTED',
          aadhaar:
            docType === 'AADHAAR'
              ? { ...u.kycDetails.aadhaar, status: 'REJECTED', rejectionReason: reason }
              : u.kycDetails.aadhaar,
          pan:
            docType === 'PAN'
              ? { ...u.kycDetails.pan, status: 'REJECTED', rejectionReason: reason }
              : u.kycDetails.pan,
        },
      };
    };

    if (userId === currentUser.id) {
      setCurrentUser((prev) => updateUserKyc(prev));
    }
    setAllUsers((users) => users.map((u) => (u.id === userId ? updateUserKyc(u) : u)));
  };

  const adminVerifyKyc = (userId: string) => {
    adminApproveKycDoc(userId, 'ALL');
  };

  const adminCreateTournament = (tournamentData: Omit<Tournament, 'id' | 'joinedCount' | 'registeredUserIds'>) => {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tour_${Date.now()}`,
      joinedCount: 0,
      registeredUserIds: [],
    };
    sounds.playCoinSound();
    setTournaments((prev) => [newTournament, ...prev]);
  };

  const adminUpdateSettings = (settings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...settings }));
  };

  const adminSendBroadcast = (message: string) => {
    sounds.playBell();
    setUnreadBroadcast(message);
    setNotificationBadgeCount((prev) => prev + 1);
    setAdminSettings((prev) => ({ ...prev, bannerBroadcast: message }));
  };

  const adminAddCoupon = (coupon: Coupon) => {
    sounds.playCoinSound();
    setCoupons((prev) => [coupon, ...prev]);
  };

  const adminTerminateLiveTable = (tableId: string) => {
    sounds.playBell();
    setActiveLiveTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'FINISHED' as const, currentPlayers: 0 } : t))
    );
  };

  const adminCreateSponsoredTable = (table: Omit<import('../types/rummy').ActiveGameTable, 'id' | 'currentPlayers' | 'status'>) => {
    sounds.playWinFanfare();
    const newTable: import('../types/rummy').ActiveGameTable = {
      ...table,
      id: `table_sponsored_${Date.now()}`,
      status: 'WAITING',
      currentPlayers: 1,
    };
    setActiveLiveTables((prev) => [newTable, ...prev]);
  };

  const adminResetTableStakes = (tableId: string, pointValue: number, entryFee: number) => {
    sounds.playCoinSound();
    setActiveLiveTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, pointValue, entryFee } : t))
    );
  };

  const adminAddManualTransaction = (params: {
    userId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'PRACTICE_CHIPS';
    amount: number;
    description: string;
  }) => {
    sounds.playCoinSound();
    const { userId, type, amount, description } = params;

    let targetUserDep = 0;
    let targetUserWdl = 0;

    const updateUser = (u: UserProfile): UserProfile => {
      let dep = u.depositBalance;
      let wdl = u.withdrawalBalance;
      let bon = u.bonusBalance;
      let chips = u.practiceChips;

      if (type === 'DEPOSIT') dep = Math.max(0, Number((dep + amount).toFixed(2)));
      else if (type === 'WITHDRAWAL') wdl = Math.max(0, Number((wdl + amount).toFixed(2)));
      else if (type === 'BONUS') bon = Math.max(0, Number((bon + amount).toFixed(2)));
      else if (type === 'PRACTICE_CHIPS') chips = Math.max(0, Math.round(chips + amount));

      targetUserDep = dep;
      targetUserWdl = wdl;

      return {
        ...u,
        depositBalance: dep,
        withdrawalBalance: wdl,
        bonusBalance: bon,
        practiceChips: chips,
      };
    };

    if (userId === currentUser.id) {
      setCurrentUser(updateUser);
    }
    setAllUsers((users) => users.map((u) => (u.id === userId ? updateUser(u) : u)));

    const newTx: Transaction = {
      id: `tx_admin_${Date.now()}`,
      userId,
      type: type === 'PRACTICE_CHIPS' || type === 'BONUS' ? 'COUPON_BONUS' : type,
      amount: Math.abs(amount),
      status: 'SUCCESS',
      description: `Admin Adjust: ${description} (${amount >= 0 ? '+' : '-'}₹${Math.abs(amount)})`,
      timestamp: new Date().toLocaleString(),
      balanceAfter: targetUserDep + targetUserWdl,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <RummyContext.Provider
      value={{
        currentUser,
        allUsers,
        withdrawalRequests,
        transactions,
        tournaments,
        activeTables: [],
        coupons,
        adminSettings,
        soundEnabled,
        activeScreen,
        activeGameConfig,
        multiplayerRoom,
        multiplayerPlayer,
        multiplayerSession,
        notificationBadgeCount,
        unreadBroadcast,
        isAdmin,
        checkAdminPermissions,
        setActiveScreen,
        setSoundEnabled,
        dismissBroadcast,
        updateCurrentUserProfile,
        setMultiplayerState,
        addCash,
        requestWithdrawal,
        joinTournament,
        launchGame,
        settleGameWin,
        exitGame,
        refillPracticeChips,
        approveWithdrawal,
        rejectWithdrawal,
        adminModifyUserBalance,
        adminToggleUserBan,
        adminVerifyKyc,
        submitKycDocument,
        adminApproveKycDoc,
        adminRejectKycDoc,
        adminCreateTournament,
        adminUpdateSettings,
        adminSendBroadcast,
        adminAddCoupon,
        activeLiveTables,
        adminTerminateLiveTable,
        adminCreateSponsoredTable,
        adminResetTableStakes,
        adminAddManualTransaction,
        botSettings,
        botStats,
        updateBotSettings,
        resetBotSettings,
        triggerAdminBotWinOverride,
        recordBotGameResult,
        simulateBotBatchGames,
      }}
    >
      {children}
    </RummyContext.Provider>
  );
};

export const useRummy = () => {
  const context = useContext(RummyContext);
  if (!context) {
    throw new Error('useRummy must be used within a RummyProvider');
  }
  return context;
};
