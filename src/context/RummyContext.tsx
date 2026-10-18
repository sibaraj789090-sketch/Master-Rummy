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
} from '../types/rummy';
import { sounds } from '../utils/sound';
import { getSavedAuthUser } from '../lib/supabase';

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
  activeScreen: 'LOBBY' | 'CHALLENGER' | 'REFER_EARN' | 'WALLET' | 'WITHDRAW' | 'ADD_CASH' | 'GAME_TABLE';
  activeGameConfig: {
    category: 'CASH' | 'TOURNAMENTS' | 'PRACTICE';
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

  // Actions
  setActiveScreen: (screen: 'LOBBY' | 'CHALLENGER' | 'REFER_EARN' | 'WALLET' | 'WITHDRAW' | 'ADD_CASH' | 'GAME_TABLE') => void;
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
  adminCreateTournament: (tournament: Omit<Tournament, 'id' | 'joinedCount' | 'registeredUserIds'>) => void;
  adminUpdateSettings: (settings: Partial<AdminSettings>) => void;
  adminSendBroadcast: (message: string) => void;
  adminAddCoupon: (coupon: Coupon) => void;
}

const RummyContext = createContext<RummyContextType | null>(null);

const STORAGE_KEY = 'master_rummy_v1_store';

const DEFAULT_USER: UserProfile = {
  id: '19098975',
  username: 'player35150',
  phone: '8438242692',
  email: '',
  telegram: '',
  dob: '',
  gender: 'Male',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  depositBalance: 1500.0,
  withdrawalBalance: 3500.0,
  bonusBalance: 500.0,
  practiceChips: 10000,
  isKycVerified: true,
  isBanned: false,
  referralCode: 'MR35150',
  createdAt: '2026-10-10',
};

const INITIAL_USERS: UserProfile[] = [
  DEFAULT_USER,
  {
    id: '1000001',
    username: 'SufiyanZ***',
    phone: '9876543210',
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
    isBanned: false,
    referralCode: 'SUF999',
    createdAt: '2026-01-15',
  },
  {
    id: '1000002',
    username: 'AjayMaha***',
    phone: '9811223344',
    email: 'ajay@example.com',
    telegram: '',
    dob: '1992-08-20',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    depositBalance: 18000,
    withdrawalBalance: 10193000,
    bonusBalance: 978000,
    practiceChips: 25000,
    isKycVerified: true,
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
    title: 'Night Owl Freeroll Series',
    timeDisplay: '07:00 AM, Today',
    startTime: '2026-10-18T07:00:00Z',
    entryFee: 0,
    prizePool: 100.6,
    maxParticipants: 500,
    joinedCount: 500,
    status: 'FULL',
    registeredUserIds: ['1000001', '1000002'],
  },
  {
    id: 'tour_2',
    title: 'Mega Afternoon Delight',
    timeDisplay: '08:00 AM, Today',
    startTime: '2026-10-18T08:00:00Z',
    entryFee: 3,
    prizePool: 1000,
    maxParticipants: 370,
    joinedCount: 370,
    status: 'FULL',
    registeredUserIds: ['1000003'],
  },
  {
    id: 'tour_3',
    title: 'Morning Boost Jackpot',
    timeDisplay: '09:00 AM, Today',
    startTime: '2026-10-18T09:00:00Z',
    entryFee: 1,
    prizePool: 500,
    maxParticipants: 550,
    joinedCount: 550,
    status: 'FULL',
    registeredUserIds: [],
  },
  {
    id: 'tour_4',
    title: 'Morning Boost Jackpot',
    timeDisplay: '03:00 PM, Today',
    startTime: '2026-10-18T15:00:00Z',
    entryFee: 1,
    prizePool: 500,
    maxParticipants: 500,
    joinedCount: 247,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_5',
    title: 'Mega Afternoon Delight',
    timeDisplay: '04:00 PM, Today',
    startTime: '2026-10-18T16:00:00Z',
    entryFee: 3,
    prizePool: 1000,
    maxParticipants: 400,
    joinedCount: 57,
    status: 'OPEN',
    registeredUserIds: [],
  },
  {
    id: 'tour_6',
    title: 'Morning Boost Jackpot',
    timeDisplay: '05:00 PM, Today',
    startTime: '2026-10-18T17:00:00Z',
    entryFee: 1,
    prizePool: 500,
    maxParticipants: 500,
    joinedCount: 0,
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
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
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
    bannerBroadcast: 'BUY 1 GET 3: Recharge once and get free 2-day rewards!',
    soundEnabled: true,
    maintenanceMode: false,
  });

  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'LOBBY' | 'CHALLENGER' | 'REFER_EARN' | 'WALLET' | 'WITHDRAW' | 'ADD_CASH' | 'GAME_TABLE'>('LOBBY');
  const [activeGameConfig, setActiveGameConfig] = useState<RummyContextType['activeGameConfig']>(null);
  const [multiplayerRoom, setMultiplayerRoom] = useState<GameRoom | null>(null);
  const [multiplayerPlayer, setMultiplayerPlayer] = useState<RoomPlayer | null>(null);
  const [multiplayerSession, setMultiplayerSession] = useState<GameSession | null>(null);

  const [notificationBadgeCount, setNotificationBadgeCount] = useState(1);
  const [unreadBroadcast, setUnreadBroadcast] = useState<string | null>('Welcome to Master Rummy! Play responsibly 18+');

  // Restore saved auth user on initial launch
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
    const newBonus = currentUser.bonusBalance + bonusAmount;

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
    }));

    setTransactions((prev) => [newTxDeposit, newTxBonus, ...prev]);

    return { success: true, bonusAdded: bonusAmount };
  };

  // Request Withdrawal
  const requestWithdrawal = (amount: number, bankAccount: BankAccount) => {
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

  // Launch Game
  const launchGame = (config: NonNullable<RummyContextType['activeGameConfig']>) => {
    if (config.category === 'CASH') {
      let totalCash = currentUser.depositBalance + currentUser.withdrawalBalance;
      if (totalCash < config.entryFee) {
        // Auto demo recharge so testing is seamless
        const needed = config.entryFee + 1000;
        currentUser.depositBalance += needed;
        totalCash += needed;
      }

      // Deduct entry fee
      let remaining = config.entryFee;
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
        id: `tx_${Date.now()}_game`,
        userId: currentUser.id,
        type: 'GAME_ENTRY',
        amount: config.entryFee,
        status: 'SUCCESS',
        description: `${config.variant} Rummy entry fee`,
        timestamp: new Date().toLocaleString(),
        balanceAfter: newDeposit + newWithdrawal,
      };
      setTransactions((prev) => [newTx, ...prev]);
    } else if (config.category === 'PRACTICE') {
      if (currentUser.practiceChips < config.entryFee) {
        // Auto reload practice chips
        setCurrentUser((prev) => ({ ...prev, practiceChips: 10000 }));
      } else {
        setCurrentUser((prev) => ({
          ...prev,
          practiceChips: prev.practiceChips - config.entryFee,
        }));
      }
    }

    sounds.playCardDeal();
    setActiveGameConfig(config);
    setActiveScreen('GAME_TABLE');
    return true;
  };

  // Game Won
  const settleGameWin = (winnings: number, practice = false) => {
    if (practice) {
      setCurrentUser((prev) => ({
        ...prev,
        practiceChips: prev.practiceChips + winnings,
      }));
      return;
    }

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

  const adminVerifyKyc = (userId: string) => {
    sounds.playBell();
    if (userId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, isKycVerified: true }));
    }
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, isKycVerified: true } : u))
    );
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
        adminCreateTournament,
        adminUpdateSettings,
        adminSendBroadcast,
        adminAddCoupon,
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
