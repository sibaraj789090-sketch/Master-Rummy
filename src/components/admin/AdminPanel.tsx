import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Trophy,
  Gift,
  Bell,
  ReceiptText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Smartphone,
  Eye,
  Sliders,
  DollarSign,
  FileText,
  Database,
  Wifi,
  Copy,
  Check,
  Server,
  Play,
  ExternalLink,
  QrCode,
  Ban,
  Lock,
  Unlock,
  Radio,
  PowerOff,
  Flame,
  Award,
  Layers,
  Activity,
  AlertCircle,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { BotManagementPanel } from './BotManagementPanel';
import { sounds } from '../../utils/sound';
import {
  supabase,
  verifyAdminCredentials,
  revokeAdminAccess,
  getCustomAdminCredentials,
  setCustomAdminCredentials,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  AUTHORIZED_ADMIN_EMAILS,
  signInQuickTestUser,
} from '../../lib/supabase';
import {
  CORE_MULTIPLAYER_SQL,
  MULTI_MODE_SQL,
  UNIFIED_MASTER_SQL,
  SUPABASE_TABLES_META,
  ADMIN_SQL_SNIPPETS,
  REALTIME_CHANNELS_DOC,
} from '../../lib/supabaseAdminInfo';
import { runRummyEngineTests, TestResult } from '../../utils/rummyEngine.test';

interface AdminPanelProps {
  onSwitchToPlayer: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSwitchToPlayer }) => {
  const {
    currentUser,
    allUsers,
    withdrawalRequests,
    transactions,
    tournaments,
    coupons,
    adminSettings,
    approveWithdrawal,
    rejectWithdrawal,
    adminModifyUserBalance,
    adminToggleUserBan,
    adminVerifyKyc,
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
    isAdmin,
    checkAdminPermissions,
  } = useRummy();

  const [authAdminEmail, setAuthAdminEmail] = useState('');
  const [authAdminKey, setAuthAdminKey] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Main Tabs Navigation
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'BOTS_CONTROL' | 'LIVE_GAMES' | 'ADD_CASH' | 'WITHDRAWALS' | 'USERS' | 'KYC_DOCS' | 'SUPABASE' | 'TOURNAMENTS' | 'SETTINGS'
  >('OVERVIEW');

  // Hard gatekeeper for admin permissions
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-amber-300">Master Rummy Admin Suite</h2>
          <p className="text-xs text-stone-400 mt-1 mb-5">
            Operations, Finance & Live Game Management Console. Authenticate with verified administrator credentials.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsVerifying(true);
              setAuthError(null);
              const res = await verifyAdminCredentials(authAdminEmail, authAdminKey);
              if (res.success) {
                sounds.playWinFanfare();
                await checkAdminPermissions();
              } else {
                setAuthError(res.error || 'Access denied: Invalid credentials');
              }
              setIsVerifying(false);
            }}
            className="space-y-3 text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">
                  Admin Gmail / Email
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthAdminEmail('admin@masterrummy.com');
                    setAuthAdminKey('MasterAdmin@2026');
                    setAuthError(null);
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Auto-fill Default
                </button>
              </div>
              <input
                type="email"
                value={authAdminEmail}
                onChange={(e) => setAuthAdminEmail(e.target.value)}
                placeholder="admin@masterrummy.com (or your Gmail)"
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-hidden focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                Admin Password / Security Key
              </label>
              <input
                type="password"
                value={authAdminKey}
                onChange={(e) => setAuthAdminKey(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-hidden focus:border-amber-400 font-mono"
              />
              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                <span>Default Pass: <strong className="text-stone-300 font-mono">MasterAdmin@2026</strong></span>
                <span>or: <strong className="text-stone-300 font-mono">admin123</strong></span>
              </div>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              {isVerifying ? 'VERIFYING CREDENTIALS...' : 'LOGIN TO ADMIN CONSOLE'}
            </button>

            {/* One-Click Quick Admin Access for Owner / Verification */}
            <button
              type="button"
              disabled={isVerifying}
              onClick={async () => {
                setIsVerifying(true);
                setAuthError(null);
                const res = await verifyAdminCredentials('admin@masterrummy.com', 'MasterAdmin@2026');
                if (res.success) {
                  sounds.playWinFanfare();
                  await checkAdminPermissions();
                } else {
                  setAuthError(res.error || 'Failed to authenticate');
                }
                setIsVerifying(false);
              }}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>One-Click Quick Admin Unlock</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-stone-800">
            <button
              onClick={() => {
                sounds.playCardClick();
                onSwitchToPlayer();
              }}
              className="text-xs text-stone-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              ← Return to Game Table / Player App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Withdrawal States
  const [withdrawalFilter, setWithdrawalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [payoutUtrInput, setPayoutUtrInput] = useState<{ [id: string]: string }>({});

  // User search & balances
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<string | null>(null);
  const [depositDelta, setDepositDelta] = useState<number>(500);
  const [withdrawalDelta, setWithdrawalDelta] = useState<number>(0);
  const [bonusDelta, setBonusDelta] = useState<number>(100);

  // Manual Credit / Debit Form (Add Cash Management)
  const [manualTxUserId, setManualTxUserId] = useState<string>(allUsers[0]?.id || '');
  const [manualTxType, setManualTxType] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'PRACTICE_CHIPS'>('DEPOSIT');
  const [manualTxAmount, setManualTxAmount] = useState<number>(500);
  const [manualTxReason, setManualTxReason] = useState<string>('Manual Admin Credit');
  const [manualTxSuccess, setManualTxSuccess] = useState<string | null>(null);

  // Payment Gateway UPI Settings Form
  const [upiIdInput, setUpiIdInput] = useState(adminSettings.adminUpiId || 'masterrummy@okaxis');
  const [merchantNameInput, setMerchantNameInput] = useState(adminSettings.adminMerchantName || 'Master Rummy India Pvt Ltd');
  const [qrCodeUrlInput, setQrCodeUrlInput] = useState(adminSettings.adminQrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=masterrummy@okaxis&pn=MasterRummy&cu=INR');
  const [minDepositInput, setMinDepositInput] = useState<number>(adminSettings.minDeposit || 100);
  const [maxDepositInput, setMaxDepositInput] = useState<number>(adminSettings.maxDeposit || 50000);
  const [savedPaymentSuccess, setSavedPaymentSuccess] = useState(false);

  // Live Game Table Management
  const [newTableVariant, setNewTableVariant] = useState<'Points' | 'Pool' | 'Deals'>('Points');
  const [newTablePlayers, setNewTablePlayers] = useState<2 | 6>(2);
  const [newTableDetail, setNewTableDetail] = useState('Classic');
  const [newTableEntry, setNewTableEntry] = useState<number>(10);
  const [newTablePointVal, setNewTablePointVal] = useState<number>(0.1);
  const [newTablePrize, setNewTablePrize] = useState<number>(19.4);
  const [newTableName, setNewTableName] = useState('Admin Sponsored Points 2P');

  // KYC States & Metrics
  const [kycSearch, setKycSearch] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [previewKycImage, setPreviewKycImage] = useState<{ url: string; title: string } | null>(null);

  // Supabase Backend States
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());
  const [sbUrlInput, setSbUrlInput] = useState(supabaseConfig.url);
  const [sbKeyInput, setSbKeyInput] = useState(supabaseConfig.anonKey);
  const [sbShowKey, setSbShowKey] = useState(false);
  const [sbIsTesting, setSbIsTesting] = useState(false);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [sbCopiedSql, setSbCopiedSql] = useState(false);
  const [sbEngineResults, setSbEngineResults] = useState<TestResult[]>([]);
  const [sbSubTab, setSbSubTab] = useState<'CONNECTION' | 'TABLES' | 'MIGRATIONS' | 'ROLES' | 'REALTIME' | 'TESTS'>('CONNECTION');
  const [selectedMigration, setSelectedMigration] = useState<'UNIFIED' | 'CORE' | 'MULTIMODE'>('UNIFIED');
  const [selectedInspectorTable, setSelectedInspectorTable] = useState<string>('profiles');
  const [tableLiveRows, setTableLiveRows] = useState<any[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [liveTableCounts, setLiveTableCounts] = useState<{ [table: string]: number }>({});

  // System & Marketing Settings
  const [rakeVal, setRakeVal] = useState(adminSettings.houseRakePercent);
  const [minWdVal, setMinWdVal] = useState(adminSettings.minWithdrawal);
  const [maxWdVal, setMaxWdVal] = useState(adminSettings.maxWithdrawal);
  const [welcomeBonusVal, setWelcomeBonusVal] = useState(adminSettings.welcomeBonus);
  const [referralBonusVal, setReferralBonusVal] = useState(adminSettings.referralBonus);
  const [maintenanceModeVal, setMaintenanceModeVal] = useState(adminSettings.maintenanceMode);
  const [broadcastText, setBroadcastText] = useState('');
  const [customGmailInput, setCustomGmailInput] = useState(() => getCustomAdminCredentials().customEmail);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [customCredsSaved, setCustomCredsSaved] = useState(false);

  // Tournaments & Coupons
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourTime, setNewTourTime] = useState('06:00 PM, Today');
  const [newTourEntry, setNewTourEntry] = useState<number>(5);
  const [newTourPrize, setNewTourPrize] = useState<number>(2500);
  const [newTourMax, setNewTourMax] = useState<number>(500);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState<number>(150);
  const [newCouponMaxBonus, setNewCouponMaxBonus] = useState<number>(5000);

  // Financial Metrics
  const totalUsersCount = allUsers.length;
  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'PENDING');
  const totalPendingAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);
  const totalApprovedWithdrawals = withdrawalRequests
    .filter((w) => w.status === 'APPROVED')
    .reduce((acc, w) => acc + w.amount, 0);

  const totalDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalHouseRake = transactions
    .filter((t) => t.type === 'GAME_WIN')
    .reduce((acc, t) => acc + t.amount * 0.03, 0);

  const filteredWithdrawals = withdrawalRequests.filter((r) => {
    if (withdrawalFilter === 'ALL') return true;
    return r.status === withdrawalFilter;
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.id.includes(userSearch)
  );

  const pendingKycUsers = allUsers.filter(
    (u) =>
      u.kycDetails?.overallStatus === 'PENDING' ||
      u.kycDetails?.aadhaar?.status === 'PENDING' ||
      u.kycDetails?.pan?.status === 'PENDING'
  );
  const pendingKycCount = pendingKycUsers.length;

  const filteredKycUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(kycSearch.toLowerCase()) ||
      u.phone.includes(kycSearch) ||
      (u.email && u.email.toLowerCase().includes(kycSearch.toLowerCase())) ||
      (u.kycDetails?.aadhaar?.documentNumber && u.kycDetails.aadhaar.documentNumber.includes(kycSearch)) ||
      (u.kycDetails?.pan?.documentNumber && u.kycDetails.pan.documentNumber.toUpperCase().includes(kycSearch.toUpperCase()));

    if (!matchesSearch) return false;

    const overall = u.kycDetails?.overallStatus || (u.isKycVerified ? 'VERIFIED' : 'PENDING');
    if (kycStatusFilter === 'ALL') return true;
    return overall === kycStatusFilter;
  });

  const handleTestSbConnection = async () => {
    setSbIsTesting(true);
    setSbTestResult(null);
    sounds.playCardClick();
    const res = await testSupabaseConnection();
    setSbTestResult(res);
    setSbIsTesting(false);
  };

  const handleSaveSbConfig = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCoinSound();
    saveSupabaseConfig(sbUrlInput, sbKeyInput);
    setSupabaseConfig(getSupabaseConfig());
    handleTestSbConnection();
  };

  const handleClearSbConfig = () => {
    sounds.playBell();
    clearSupabaseConfig();
    setSupabaseConfig(getSupabaseConfig());
    setSbUrlInput('');
    setSbKeyInput('');
    setSbTestResult(null);
  };

  const handleFetchTableRows = async (tableName: string) => {
    setIsLoadingRows(true);
    setSelectedInspectorTable(tableName);
    sounds.playCardClick();

    if (!supabaseConfig.isConfigured) {
      if (tableName === 'profiles') {
        setTableLiveRows(allUsers);
      } else if (tableName === 'game_rooms') {
        setTableLiveRows(activeLiveTables);
      } else {
        setTableLiveRows([]);
      }
      setIsLoadingRows(false);
      return;
    }

    try {
      const { data, count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(10);

      if (!error && data) {
        setTableLiveRows(data);
        if (count !== null) {
          setLiveTableCounts((prev) => ({ ...prev, [tableName]: count }));
        }
      } else {
        setTableLiveRows([]);
      }
    } catch {
      setTableLiveRows([]);
    }
    setIsLoadingRows(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-amber-600 flex items-center justify-center font-black text-white text-lg shadow-md border border-amber-400/30">
            MR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                MASTER RUMMY <span className="text-amber-400 font-mono text-xs">ADMIN OPERATIONS</span>
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Live Ops
              </span>
              {adminSettings.maintenanceMode && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  MAINTENANCE ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Live Tables · Add Cash & UPI · 18+ KYC Approvals · Strict Withdrawals · Supabase Backend
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-stone-800/80 border border-stone-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-stone-400">House Rake:</span>
            <span className="font-mono font-bold text-amber-300">{adminSettings.houseRakePercent}%</span>
          </div>

          {/* Log Out Admin */}
          <button
            onClick={async () => {
              sounds.playCardClick();
              revokeAdminAccess();
              await checkAdminPermissions();
            }}
            title="Securely log out of Admin Console"
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md border border-stone-700 active:scale-95 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>LOG OUT</span>
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              onSwitchToPlayer();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md border border-red-500/30 active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>SWITCH TO PLAYER APP</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-stone-900/80 border-b border-stone-800 px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('OVERVIEW');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('BOTS_CONTROL');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap relative ${
            activeTab === 'BOTS_CONTROL'
              ? 'border-purple-400 text-purple-300 bg-purple-950/20'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>100k+ Bot Control</span>
          <span className="bg-purple-500/20 text-purple-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-purple-500/40">
            97% AI
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('LIVE_GAMES');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap relative ${
            activeTab === 'LIVE_GAMES'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Game Tables ({activeLiveTables.filter((t) => t.status === 'IN_PLAY').length} Live)</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('ADD_CASH');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'ADD_CASH'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Add Cash & UPI</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('WITHDRAWALS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap relative ${
            activeTab === 'WITHDRAWALS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Withdrawals</span>
          {pendingWithdrawals.length > 0 && (
            <span className="bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('KYC_DOCS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap relative ${
            activeTab === 'KYC_DOCS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>18+ KYC Approvals</span>
          {pendingKycCount > 0 && (
            <span className="bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
              {pendingKycCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('USERS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Players ({allUsers.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('SUPABASE');
            handleTestSbConnection();
            setSbEngineResults(runRummyEngineTests());
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap relative ${
            activeTab === 'SUPABASE'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase Backend</span>
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseConfig.isConfigured ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-amber-400'
            }`}
          />
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('TOURNAMENTS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'TOURNAMENTS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Tournaments</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('SETTINGS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Settings & Rake</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* ============================================================== */}
        {/* TAB 0: 100K+ BOTS CONTROL & MATCHMAKING AI */}
        {/* ============================================================== */}
        {activeTab === 'BOTS_CONTROL' && <BotManagementPanel />}

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide">Live Active Tables</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {activeLiveTables.filter((t) => t.status === 'IN_PLAY').length}{' '}
                  <span className="text-xs text-stone-400 font-normal">/ {activeLiveTables.length} Tables</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Points, Pool & Deals running</div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide">Pending 18+ KYC</span>
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">{pendingKycCount}</div>
                <div className="text-[11px] text-stone-400 mt-1">Aadhaar & PAN cards to review</div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide">Pending Withdrawals</span>
                  <CreditCard className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400">₹{totalPendingAmount.toLocaleString()}</div>
                <div className="text-[11px] text-stone-400 mt-1">{pendingWithdrawals.length} user requests</div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide">House Rake Net</span>
                  <Coins className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-black text-yellow-400">₹{totalHouseRake.toFixed(2)}</div>
                <div className="text-[11px] text-stone-400 mt-1">3% commission rake earned</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/20 rounded-2xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-white text-sm">Quick Administrative Management</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Manage live game tables, verify uploaded Aadhaar & PAN KYC, approve cash withdrawals, or update UPI handle.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setActiveTab('LIVE_GAMES');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4" /> Live Tables
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setActiveTab('KYC_DOCS');
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Verify KYC ({pendingKycCount})
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setActiveTab('ADD_CASH');
                  }}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" /> Add Cash & UPI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LIVE GAME TABLES & SESSIONS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'LIVE_GAMES' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>LIVE GAME TABLES & ROOM CONTROL</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Monitor active cash tables, terminate stuck games, adjust stakes, or sponsor custom tournament rooms.
                </p>
              </div>
            </div>

            {/* Live Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLiveTables.map((tbl) => (
                <div
                  key={tbl.id}
                  className={`bg-stone-900 border rounded-2xl p-4 shadow-sm space-y-3 ${
                    tbl.status === 'IN_PLAY'
                      ? 'border-emerald-500/40 bg-gradient-to-b from-stone-900 to-emerald-950/20'
                      : tbl.status === 'WAITING'
                      ? 'border-amber-500/40'
                      : 'border-stone-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{tbl.name}</h4>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {tbl.variant} Rummy · {tbl.playersCount} Players · {tbl.gameTypeDetail || 'Classic'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tbl.status === 'IN_PLAY'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse'
                          : tbl.status === 'WAITING'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}
                    >
                      {tbl.status === 'IN_PLAY' ? '● LIVE PLAY' : tbl.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Stakes / Point</span>
                      <span className="font-mono font-bold text-amber-300">
                        {tbl.pointValue ? `₹${tbl.pointValue}/pt` : `₹${tbl.entryFee}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Prize Pool</span>
                      <span className="font-mono font-bold text-emerald-400">₹{tbl.prizePool}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Seats Seated</span>
                      <span className="font-mono font-bold text-white">
                        {tbl.currentPlayers} / {tbl.playersCount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {tbl.status === 'IN_PLAY' && (
                      <button
                        onClick={() => {
                          if (confirm(`Terminate table ${tbl.name}? Players chips will be safely returned.`)) {
                            adminTerminateLiveTable(tbl.id);
                          }
                        }}
                        className="flex-1 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PowerOff className="w-3.5 h-3.5" /> Terminate Table
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const newPt = prompt('Enter new Point Value (₹):', tbl.pointValue ? String(tbl.pointValue) : '0.25');
                        const newFee = prompt('Enter new Entry Fee (₹):', String(tbl.entryFee));
                        if (newFee) {
                          adminResetTableStakes(tbl.id, Number(newPt || 0.1), Number(newFee));
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-lg transition-colors"
                    >
                      Adjust Stakes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Sponsored / Custom Table Form */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create Admin Sponsored Cash Table</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Table Name</label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Variant</label>
                  <select
                    value={newTableVariant}
                    onChange={(e) => setNewTableVariant(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                  >
                    <option value="Points">Points Rummy</option>
                    <option value="Pool">Pool Rummy</option>
                    <option value="Deals">Deals Rummy</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Players Capacity</label>
                  <select
                    value={newTablePlayers}
                    onChange={(e) => setNewTablePlayers(Number(e.target.value) as 2 | 6)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                  >
                    <option value={2}>2 Players (Head-to-Head)</option>
                    <option value={6}>6 Players (Classic Multi)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={newTableEntry}
                    onChange={(e) => {
                      const fee = Number(e.target.value);
                      setNewTableEntry(fee);
                      setNewTablePrize(Number((fee * newTablePlayers * 0.97).toFixed(2)));
                    }}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  adminCreateSponsoredTable({
                    name: newTableName,
                    category: 'CASH',
                    variant: newTableVariant,
                    playersCount: newTablePlayers,
                    pointValue: newTablePointVal,
                    entryFee: newTableEntry,
                    prizePool: newTablePrize,
                    gameTypeDetail: newTableDetail,
                  });
                  alert('Sponsored table launched to live lobby!');
                }}
                className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
              >
                Launch Sponsored Table
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ADD CASH, MANUAL CREDIT & UPI GATEWAY */}
        {/* ============================================================== */}
        {activeTab === 'ADD_CASH' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <span>ADD CASH & UPI PAYMENT GATEWAY MANAGEMENT</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Configure real-time UPI ID, dynamic QR Code, minimum recharge limits, and manual cash credit/debit tools.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Gateway & QR Code Settings */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>UPI Payment Gateway & QR Code</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Admin Official UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. masterrummy@okaxis"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Merchant / Beneficiary Display Name</label>
                    <input
                      type="text"
                      value={merchantNameInput}
                      onChange={(e) => setMerchantNameInput(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">UPI QR Code URL (Image Link)</label>
                    <input
                      type="url"
                      value={qrCodeUrlInput}
                      onChange={(e) => setQrCodeUrlInput(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1 font-bold">Min Deposit (₹)</label>
                      <input
                        type="number"
                        value={minDepositInput}
                        onChange={(e) => setMinDepositInput(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1 font-bold">Max Deposit (₹)</label>
                      <input
                        type="number"
                        value={maxDepositInput}
                        onChange={(e) => setMaxDepositInput(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  {savedPaymentSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Payment settings updated across Player Add Cash screens!
                    </div>
                  )}

                  <button
                    onClick={() => {
                      sounds.playCoinSound();
                      adminUpdateSettings({
                        adminUpiId: upiIdInput,
                        adminMerchantName: merchantNameInput,
                        adminQrCodeUrl: qrCodeUrlInput,
                        minDeposit: minDepositInput,
                        maxDeposit: maxDepositInput,
                      });
                      setSavedPaymentSuccess(true);
                      setTimeout(() => setSavedPaymentSuccess(false), 2500);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Save & Update Add Cash Gateway
                  </button>
                </div>
              </div>

              {/* Manual Cash Credit / Debit Tool */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Manual Cash Credit / Debit Tool</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Select Target Player</label>
                    <select
                      value={manualTxUserId}
                      onChange={(e) => setManualTxUserId(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                    >
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} (Phone: {u.phone || 'N/A'}) — Bal: ₹{(u.depositBalance + u.withdrawalBalance).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1 font-bold">Balance Bucket</label>
                      <select
                        value={manualTxType}
                        onChange={(e) => setManualTxType(e.target.value as any)}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                      >
                        <option value="DEPOSIT">Deposit Balance (₹)</option>
                        <option value="WITHDRAWAL">Withdrawal Balance (₹)</option>
                        <option value="BONUS">Bonus Cash (₹)</option>
                        <option value="PRACTICE_CHIPS">Practice Chips</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-400 block mb-1 font-bold">Amount (+ or -)</label>
                      <input
                        type="number"
                        value={manualTxAmount}
                        onChange={(e) => setManualTxAmount(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Reason / Administrative Note</label>
                    <input
                      type="text"
                      value={manualTxReason}
                      onChange={(e) => setManualTxReason(e.target.value)}
                      placeholder="e.g. UPI Recheck Credit, Special Reward"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                    />
                  </div>

                  {manualTxSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {manualTxSuccess}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      adminAddManualTransaction({
                        userId: manualTxUserId,
                        type: manualTxType,
                        amount: manualTxAmount,
                        description: manualTxReason,
                      });
                      setManualTxSuccess(`Successfully adjusted ₹${manualTxAmount} to player wallet!`);
                      setTimeout(() => setManualTxSuccess(null), 3000);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Execute Wallet Adjustment
                  </button>
                </div>
              </div>
            </div>

            {/* Live Deposit Transactions Ledger */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-emerald-400" />
                <span>Recent Add Cash & Deposit Transactions</span>
              </h3>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">TX ID</th>
                      <th className="p-2.5">User</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {transactions
                      .filter((t) => t.type === 'DEPOSIT' || t.description.includes('Admin Adjust') || t.description.includes('Recharge'))
                      .slice(0, 15)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-stone-800/40">
                          <td className="p-2.5 font-mono text-[11px] text-stone-400">{tx.id}</td>
                          <td className="p-2.5 font-bold text-white">{tx.userId}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-black text-emerald-400">₹{tx.amount}</td>
                          <td className="p-2.5 text-stone-300">{tx.description}</td>
                          <td className="p-2.5">
                            <span className="text-emerald-400 font-bold">{tx.status}</span>
                          </td>
                          <td className="p-2.5 text-stone-400 text-[11px]">{tx.timestamp}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: WITHDRAWALS & STRICT KYC AUDIT */}
        {/* ============================================================== */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>WITHDRAWAL REQUESTS & STRICT KYC ENFORCEMENT</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Audited payout approvals. Users CANNOT withdraw cash unless their 18+ Aadhaar & PAN KYC is approved.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex bg-stone-950 rounded-xl p-1 border border-stone-800 text-xs font-bold gap-1">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      sounds.playCardClick();
                      setWithdrawalFilter(filter);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      withdrawalFilter === filter
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Withdrawal Requests */}
            <div className="space-y-3">
              {filteredWithdrawals.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-sm">No withdrawals in {withdrawalFilter} status</p>
                </div>
              ) : (
                filteredWithdrawals.map((req) => {
                  const targetUser = allUsers.find((u) => u.id === req.userId);
                  const isUserKycVerified =
                    targetUser?.isKycVerified || targetUser?.kycDetails?.overallStatus === 'VERIFIED';

                  return (
                    <div
                      key={req.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-base text-white">₹{req.amount}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            (Net Payable: ₹{req.netPayable} · TDS: ₹{req.tdsFee})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* KYC Status Badge */}
                          {isUserKycVerified ? (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> KYC VERIFIED
                            </span>
                          ) : (
                            <span className="bg-rose-950 text-rose-300 border border-rose-500/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3 h-3 text-rose-400" /> KYC NOT APPROVED
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              req.status === 'PENDING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : req.status === 'APPROVED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>

                      {/* Warning banner if user KYC is not approved */}
                      {!isUserKycVerified && (
                        <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>
                              <strong>STRICT WITHDRAWAL LOCK:</strong> This user has NOT completed 18+ Aadhaar & PAN verification. Payout must remain blocked.
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              sounds.playCardClick();
                              setKycSearch(req.userName);
                              setActiveTab('KYC_DOCS');
                            }}
                            className="shrink-0 px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-colors"
                          >
                            Inspect User KYC
                          </button>
                        </div>
                      )}

                      {/* Bank Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-stone-950 p-3 rounded-xl border border-stone-800/80">
                        <div>
                          <span className="text-[10px] text-stone-400 block">User Name / Phone</span>
                          <span className="font-bold text-white">
                            {req.userName} ({req.phone || targetUser?.phone || 'N/A'})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Bank Name</span>
                          <span className="font-bold text-white">{req.bankAccount.bankName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Account Number</span>
                          <span className="font-mono font-bold text-amber-300">{req.bankAccount.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">IFSC Code / Beneficiary</span>
                          <span className="font-mono font-bold text-white">
                            {req.bankAccount.ifsc} ({req.bankAccount.accountHolder})
                          </span>
                        </div>
                      </div>

                      {/* Action buttons for PENDING requests */}
                      {req.status === 'PENDING' && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Enter Payout UTR / Bank Ref No."
                            value={payoutUtrInput[req.id] || ''}
                            onChange={(e) =>
                              setPayoutUtrInput((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                            className="flex-1 min-w-[200px] bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 font-mono"
                          />

                          <button
                            onClick={() => {
                              if (!isUserKycVerified) {
                                alert('BLOCKED: Cannot approve withdrawal for unverified user! Approve Aadhaar & PAN in KYC Docs tab first.');
                                return;
                              }
                              approveWithdrawal(req.id, payoutUtrInput[req.id] || 'Admin Approved');
                            }}
                            className={`px-4 py-1.5 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                              isUserKycVerified
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Payout
                          </button>

                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection remark (amount will be returned to user):', 'KYC Verification Required or Bank Name Mismatch');
                              if (reason) rejectWithdrawal(req.id, reason);
                            }}
                            className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs rounded-xl transition-colors"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: 18+ KYC DOCUMENTS APPROVAL & REJECTION */}
        {/* ============================================================== */}
        {activeTab === 'KYC_DOCS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>18+ DOCUMENTS & KYC VERIFICATION REVIEW</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Inspect uploaded Aadhaar & PAN cards with high-res zoom. Approve or reject documents with instant status sync.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex bg-stone-950 rounded-xl p-1 border border-stone-800 text-xs font-bold gap-1">
                {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      sounds.playCardClick();
                      setKycStatusFilter(filter);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      kycStatusFilter === filter
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                value={kycSearch}
                onChange={(e) => setKycSearch(e.target.value)}
                placeholder="Search by player username, phone, Aadhaar 12-digit number, or PAN card..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500"
              />
            </div>

            {/* List of KYC Applications */}
            <div className="space-y-3">
              {filteredKycUsers.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-sm">No KYC documents matching criteria</p>
                </div>
              ) : (
                filteredKycUsers.map((u) => {
                  const aadhaar = u.kycDetails?.aadhaar;
                  const pan = u.kycDetails?.pan;
                  const overall = u.kycDetails?.overallStatus || (u.isKycVerified ? 'VERIFIED' : 'PENDING');

                  return (
                    <div
                      key={u.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.username}
                            className="w-10 h-10 rounded-xl object-cover border border-stone-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white">{u.username}</span>
                              <span className="text-[10px] bg-red-800/80 text-white font-black px-1.5 py-0.2 rounded">
                                18+
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400">
                              Phone: {u.phone || 'N/A'} · Email: {u.email || 'N/A'} · ID: {u.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                              overall === 'VERIFIED'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                                : overall === 'PENDING'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            OVERALL: {overall}
                          </span>

                          <button
                            onClick={() => {
                              sounds.playWinFanfare();
                              adminApproveKycDoc(u.id, 'ALL');
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs rounded-xl shadow-xs"
                          >
                            1-Click Approve All
                          </button>
                        </div>
                      </div>

                      {/* Documents Cards Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Aadhaar Card Box */}
                        <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800/80 space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                            <span className="font-bold text-xs text-white">Aadhaar Card (12 Digits)</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                aadhaar?.status === 'VERIFIED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : aadhaar?.status === 'REJECTED'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {aadhaar?.status || 'PENDING'}
                            </span>
                          </div>

                          <div className="text-[11px] space-y-1 text-stone-300">
                            <p>
                              Number:{' '}
                              <strong className="font-mono text-white">
                                {aadhaar?.documentNumber || 'XXXX-XXXX-XXXX'}
                              </strong>
                            </p>
                            <p>
                              Holder Name: <strong className="text-white">{aadhaar?.holderName || u.username}</strong>
                            </p>
                          </div>

                          {/* Photos preview */}
                          <div className="flex gap-2">
                            {aadhaar?.frontImage && (
                              <div
                                onClick={() =>
                                  setPreviewKycImage({
                                    url: aadhaar.frontImage!,
                                    title: `${u.username} - Aadhaar Front`,
                                  })
                                }
                                className="w-20 h-14 rounded-lg overflow-hidden border border-stone-700 cursor-pointer relative group"
                              >
                                <img
                                  src={aadhaar.frontImage}
                                  alt="Aadhaar Front"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                                  <Eye className="w-3.5 h-3.5 mr-0.5" /> View
                                </div>
                              </div>
                            )}

                            {aadhaar?.backImage && (
                              <div
                                onClick={() =>
                                  setPreviewKycImage({
                                    url: aadhaar.backImage!,
                                    title: `${u.username} - Aadhaar Back`,
                                  })
                                }
                                className="w-20 h-14 rounded-lg overflow-hidden border border-stone-700 cursor-pointer relative group"
                              >
                                <img
                                  src={aadhaar.backImage}
                                  alt="Aadhaar Back"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                                  <Eye className="w-3.5 h-3.5 mr-0.5" /> View
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Aadhaar Actions */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-stone-800">
                            <button
                              onClick={() => {
                                sounds.playWinFanfare();
                                adminApproveKycDoc(u.id, 'AADHAAR');
                              }}
                              className="flex-1 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve Aadhaar
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason for Aadhaar:', 'Aadhaar image blurry or unreadable');
                                if (reason) adminRejectKycDoc(u.id, 'AADHAAR', reason);
                              }}
                              className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[10px] rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>

                        {/* PAN Card Box */}
                        <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800/80 space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                            <span className="font-bold text-xs text-white">PAN Card (10 Chars)</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pan?.status === 'VERIFIED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : pan?.status === 'REJECTED'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {pan?.status || 'PENDING'}
                            </span>
                          </div>

                          <div className="text-[11px] space-y-1 text-stone-300">
                            <p>
                              Number:{' '}
                              <strong className="font-mono text-white">
                                {pan?.documentNumber || 'ABCDE1234F'}
                              </strong>
                            </p>
                            <p>
                              Holder Name: <strong className="text-white">{pan?.holderName || u.username}</strong>
                            </p>
                            {pan?.dob && (
                              <p>
                                DOB: <strong className="text-white">{pan.dob}</strong>
                              </p>
                            )}
                          </div>

                          {pan?.frontImage && (
                            <div
                              onClick={() =>
                                setPreviewKycImage({
                                  url: pan.frontImage!,
                                  title: `${u.username} - PAN Card Front`,
                                })
                              }
                              className="w-20 h-14 rounded-lg overflow-hidden border border-stone-700 cursor-pointer relative group"
                            >
                              <img
                                src={pan.frontImage}
                                alt="PAN Front"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                                <Eye className="w-3.5 h-3.5 mr-0.5" /> View
                              </div>
                            </div>
                          )}

                          {/* PAN Actions */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-stone-800">
                            <button
                              onClick={() => {
                                sounds.playWinFanfare();
                                adminApproveKycDoc(u.id, 'PAN');
                              }}
                              className="flex-1 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve PAN
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason for PAN:', 'PAN mismatch or unreadable');
                                if (reason) adminRejectKycDoc(u.id, 'PAN', reason);
                              }}
                              className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[10px] rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal: Full Size Card Image Preview */}
        {previewKycImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-3 bg-stone-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{previewKycImage.title}</span>
                <button
                  onClick={() => setPreviewKycImage(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-stone-950 flex items-center justify-center max-h-[70vh] overflow-auto">
                <img
                  src={previewKycImage.url}
                  alt={previewKycImage.title}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-stone-800"
                />
              </div>
              <div className="p-3 bg-stone-800 text-right">
                <button
                  onClick={() => setPreviewKycImage(null)}
                  className="px-4 py-1.5 bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs rounded-lg"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: PLAYERS & USERS DIRECTORY */}
        {/* ============================================================== */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>PLAYERS DIRECTORY & WALLET CONTROL</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Search players, inspect balances, modify deposits/withdrawals, or toggle account bans.
                </p>
              </div>
            </div>

            {/* User Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search players by username, phone number, email, or ID..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500"
              />
            </div>

            {/* Users Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Player</th>
                      <th className="p-3">Deposit Bal</th>
                      <th className="p-3">Withdrawal Bal</th>
                      <th className="p-3">Bonus</th>
                      <th className="p-3">KYC Status</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-800/40">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar}
                              alt={u.username}
                              className="w-8 h-8 rounded-full object-cover border border-stone-700"
                            />
                            <div>
                              <span className="font-extrabold text-white block">{u.username}</span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                Phone: {u.phone || 'N/A'} · Email: {u.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">₹{u.depositBalance}</td>
                        <td className="p-3 font-mono font-bold text-amber-300">₹{u.withdrawalBalance}</td>
                        <td className="p-3 font-mono text-stone-400">₹{u.bonusBalance}</td>
                        <td className="p-3">
                          {u.isKycVerified || u.kycDetails?.overallStatus === 'VERIFIED' ? (
                            <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {u.isBanned ? (
                            <span className="bg-rose-950 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                              BANNED
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold text-[10px]">ACTIVE</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUserForBalance(u.id);
                                sounds.playCardClick();
                              }}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-[10px] rounded-lg border border-stone-700"
                            >
                              Edit Balance
                            </button>
                            <button
                              onClick={() => {
                                adminToggleUserBan(u.id);
                              }}
                              className={`px-2.5 py-1 font-bold text-[10px] rounded-lg transition-colors ${
                                u.isBanned
                                  ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Edit User Balances */}
            {selectedUserForBalance && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
                <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <h3 className="font-extrabold text-sm text-white">Adjust User Balance</h3>
                    <button
                      onClick={() => setSelectedUserForBalance(null)}
                      className="text-stone-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-stone-400 block mb-1">Add to Deposit Balance (₹)</label>
                      <input
                        type="number"
                        value={depositDelta}
                        onChange={(e) => setDepositDelta(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Add to Withdrawal Balance (₹)</label>
                      <input
                        type="number"
                        value={withdrawalDelta}
                        onChange={(e) => setWithdrawalDelta(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Add to Bonus Balance (₹)</label>
                      <input
                        type="number"
                        value={bonusDelta}
                        onChange={(e) => setBonusDelta(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        adminModifyUserBalance(selectedUserForBalance, depositDelta, withdrawalDelta, bonusDelta);
                        setSelectedUserForBalance(null);
                      }}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold text-xs uppercase rounded-xl shadow-md"
                    >
                      Save Balance
                    </button>
                    <button
                      onClick={() => setSelectedUserForBalance(null)}
                      className="px-4 py-2 bg-stone-800 text-stone-300 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: SUPABASE BACKEND CONSOLE */}
        {/* ============================================================== */}
        {activeTab === 'SUPABASE' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Supabase Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white tracking-wide">
                      SUPABASE MULTIPLAYER BACKEND MISSION CONTROL
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        supabaseConfig.isConfigured
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {supabaseConfig.isConfigured ? 'Configured' : 'Setup Required'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    PostgreSQL 15 · Supabase Realtime Channels · Row Level Security (RLS) · Rule Engine · Migration SQL
                  </p>
                </div>
              </div>

              {/* Ping / Test Latency Button */}
              <button
                type="button"
                disabled={sbIsTesting}
                onClick={handleTestSbConnection}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sbIsTesting ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{sbIsTesting ? 'Testing Latency...' : 'Ping Supabase'}</span>
              </button>
            </div>

            {/* Supabase Sub-Tabs */}
            <div className="flex border-b border-stone-800 bg-stone-950/60 rounded-xl p-1 text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  setSbSubTab('CONNECTION');
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sbSubTab === 'CONNECTION' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Connection & Keys</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  setSbSubTab('TABLES');
                  handleFetchTableRows(selectedInspectorTable);
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sbSubTab === 'TABLES' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tables Inspector</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  setSbSubTab('MIGRATIONS');
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sbSubTab === 'MIGRATIONS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>SQL Migrations</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  setSbSubTab('ROLES');
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sbSubTab === 'ROLES' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Auth & Roles</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  setSbSubTab('REALTIME');
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sbSubTab === 'REALTIME' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Realtime & 2P Guide</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  setSbSubTab('TESTS');
                  setSbEngineResults(runRummyEngineTests());
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sbSubTab === 'TESTS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rule Engine Tests</span>
              </button>
            </div>

            {/* SUB-TAB 1: CONNECTION & CREDENTIALS */}
            {sbSubTab === 'CONNECTION' && (
              <div className="space-y-4">
                {/* Live Latency Status Banner */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                    sbTestResult?.success
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : sbTestResult && !sbTestResult.success
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : supabaseConfig.isConfigured
                      ? 'bg-stone-950/60 border-stone-800 text-stone-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        sbTestResult?.success
                          ? 'bg-emerald-400 animate-pulse'
                          : sbTestResult && !sbTestResult.success
                          ? 'bg-rose-400'
                          : supabaseConfig.isConfigured
                          ? 'bg-cyan-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <p className="font-extrabold text-white text-xs">
                        {sbTestResult
                          ? sbTestResult.success
                            ? 'Supabase Connection Live & Operational'
                            : 'Connection Test Failed'
                          : supabaseConfig.isConfigured
                          ? 'Supabase Credentials Present — Ready for Testing'
                          : 'Supabase URL and Anon Public Key are not configured yet'}
                      </p>
                      {sbTestResult?.message && (
                        <p className="text-[11px] opacity-80 mt-0.5">{sbTestResult.message}</p>
                      )}
                    </div>
                  </div>

                  {sbTestResult?.latencyMs && (
                    <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                      {sbTestResult.latencyMs} ms latency
                    </span>
                  )}
                </div>

                {/* Form to enter Supabase URL and Key */}
                <form onSubmit={handleSaveSbConfig} className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3.5">
                  <div>
                    <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={sbUrlInput}
                      onChange={(e) => setSbUrlInput(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Found in: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] uppercase font-bold text-stone-400 block">
                        Supabase Anon Public API Key
                      </label>
                      <button
                        type="button"
                        onClick={() => setSbShowKey(!sbShowKey)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        {sbShowKey ? 'Hide Key' : 'Reveal Key'}
                      </button>
                    </div>
                    <input
                      type={sbShowKey ? 'text' : 'password'}
                      value={sbKeyInput}
                      onChange={(e) => setSbKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Found in: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public)
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                    >
                      Save & Apply Supabase Credentials
                    </button>
                    {supabaseConfig.isConfigured && (
                      <button
                        type="button"
                        onClick={handleClearSbConfig}
                        className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* SUB-TAB 2: TABLES INSPECTOR & LIVE EXPLORER */}
            {sbSubTab === 'TABLES' && (
              <div className="space-y-4 text-xs">
                {/* Tables Selector Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUPABASE_TABLES_META.map((meta) => (
                    <button
                      key={meta.name}
                      onClick={() => handleFetchTableRows(meta.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedInspectorTable === meta.name
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-white shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-white text-xs">{meta.name}</span>
                        {meta.hasRealtime && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 block line-clamp-1">{meta.description}</span>
                    </button>
                  ))}
                </div>

                {/* Table Details & Live Data */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <div>
                      <h4 className="font-bold text-white text-xs font-mono">
                        Table: public.{selectedInspectorTable}
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {SUPABASE_TABLES_META.find((m) => m.name === selectedInspectorTable)?.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleFetchTableRows(selectedInspectorTable)}
                      disabled={isLoadingRows}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-[10px] rounded-lg border border-stone-700 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingRows ? 'animate-spin' : ''}`} />
                      Fetch Latest
                    </button>
                  </div>

                  {/* Rows Render */}
                  {isLoadingRows ? (
                    <div className="p-8 text-center text-stone-400">Loading records from Supabase...</div>
                  ) : tableLiveRows.length === 0 ? (
                    <div className="p-6 text-center text-stone-500 font-mono text-xs">
                      No rows returned for {selectedInspectorTable}. (Table is either empty or awaiting user activity).
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-60 no-scrollbar">
                      <pre className="text-[10px] font-mono text-emerald-300 leading-relaxed bg-stone-900 p-3 rounded-lg border border-stone-800 overflow-x-auto">
                        {JSON.stringify(tableLiveRows, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: SQL MIGRATIONS & SCRIPTS */}
            {sbSubTab === 'MIGRATIONS' && (
              <div className="space-y-4 text-xs">
                {/* Script Selector */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 gap-1">
                    <button
                      onClick={() => setSelectedMigration('UNIFIED')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        selectedMigration === 'UNIFIED'
                          ? 'bg-emerald-600 text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Complete Unified Schema (Recommended)
                    </button>
                    <button
                      onClick={() => setSelectedMigration('CORE')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        selectedMigration === 'CORE'
                          ? 'bg-emerald-600 text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Migration 1: Core Multiplayer
                    </button>
                    <button
                      onClick={() => setSelectedMigration('MULTIMODE')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        selectedMigration === 'MULTIMODE'
                          ? 'bg-emerald-600 text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Migration 2: Multi-Mode
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      const script =
                        selectedMigration === 'UNIFIED'
                          ? UNIFIED_MASTER_SQL
                          : selectedMigration === 'CORE'
                          ? CORE_MULTIPLAYER_SQL
                          : MULTI_MODE_SQL;
                      navigator.clipboard.writeText(script);
                      setSbCopiedSql(true);
                      setTimeout(() => setSbCopiedSql(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    {sbCopiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{sbCopiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                  </button>
                </div>

                {/* Instructions */}
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-300 text-[11px] leading-relaxed">
                  <strong>How to Run in Supabase:</strong> Open your Supabase Project Dashboard &gt; Navigate to <strong>SQL Editor</strong> on the left sidebar &gt; Click <strong>New Query</strong> &gt; Paste the copied SQL script &gt; Click <strong>Run</strong> (▶️). All 8 tables, triggers, RLS policies, and realtime publications will be created instantly.
                </div>

                {/* Code Preview */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-80 leading-relaxed no-scrollbar">
                  <pre className="whitespace-pre">
                    {selectedMigration === 'UNIFIED'
                      ? UNIFIED_MASTER_SQL
                      : selectedMigration === 'CORE'
                      ? CORE_MULTIPLAYER_SQL
                      : MULTI_MODE_SQL}
                  </pre>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: ADMIN AUTH & ROLES */}
            {sbSubTab === 'ROLES' && (
              <div className="space-y-4 text-xs">
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Authorized Administrator Emails & Security Keys</span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Accounts with these emails or database roles automatically receive Admin Suite permissions.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-stone-900 p-3 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                        Verified Admin Emails
                      </span>
                      <ul className="space-y-1 font-mono text-emerald-400 text-xs">
                        {AUTHORIZED_ADMIN_EMAILS.map((em) => (
                          <li key={em}>• {em}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-stone-900 p-3 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                        Master Security Passwords
                      </span>
                      <ul className="space-y-1 font-mono text-amber-300 text-xs">
                        <li>• MasterAdmin@2026</li>
                        <li>• AdminPass@611</li>
                        <li>• admin123</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Admin SQL Promotion Snippets */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-sm text-white">Useful Supabase Admin SQL Snippets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ADMIN_SQL_SNIPPETS.map((snip, idx) => (
                      <div key={idx} className="bg-stone-900 p-3 rounded-xl border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{snip.title}</span>
                          <button
                            onClick={() => {
                              sounds.playCardClick();
                              navigator.clipboard.writeText(snip.sql);
                              alert('Snippet copied to clipboard!');
                            }}
                            className="p-1 hover:text-white text-stone-400"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400">{snip.description}</p>
                        <pre className="bg-stone-950 p-2 rounded-lg font-mono text-[10px] text-emerald-300 overflow-x-auto">
                          {snip.sql}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: REALTIME & 2-DEVICE MATCHMAKING GUIDE */}
            {sbSubTab === 'REALTIME' && (
              <div className="space-y-4 text-xs text-stone-300">
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 space-y-3">
                  <h3 className="font-black text-emerald-300 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>How Real-Time Multiplayer Operates:</span>
                  </h3>
                  <div className="space-y-2 text-xs leading-relaxed text-stone-300">
                    <p>
                      <strong>Channels Architecture:</strong> Each game room broadcasts over{' '}
                      <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                        realtime:room:ROOM_CODE
                      </code>{' '}
                      and active gameplay moves sync across{' '}
                      <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                        realtime:game:SESSION_ID
                      </code>.
                    </p>
                    <p>
                      <strong>Card Privacy & Anti-Cheat:</strong> Private cards in{' '}
                      <code className="text-emerald-300 font-mono">player_game_states</code> are protected by Supabase Row Level Security (RLS). A player can never inspect their opponent&apos;s cards over the network.
                    </p>
                  </div>
                </div>

                {/* 2-Device Multiplayer Step-by-Step */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2.5">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Testing 2-Player Match Across 2 Devices or Incognito Tabs:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-xs text-stone-300 leading-relaxed">
                    <li>
                      <strong>Device 1 (Host Room):</strong> Open player app, choose <strong>&quot;2 Players&quot;</strong> in the Lobby, and tap <strong>PLAY NOW</strong>.
                    </li>
                    <li>
                      <strong>Device 2 or Second Browser Window:</strong> Open the same URL in an Incognito window or mobile browser.
                    </li>
                    <li>
                      Tap <strong>PLAY NOW</strong>. The matchmaking engine pairs the two devices into the same real-time table!
                    </li>
                    <li>
                      Cards deal simultaneously on both screens. Player 1&apos;s moves, draws, and discards reflect live on Player 2&apos;s screen!
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* SUB-TAB 6: SERVER ENGINE UNIT TESTS */}
            {sbSubTab === 'TESTS' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-extrabold text-stone-200">
                    Rummy Rules & Win Detection Validation Suite
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                      {sbEngineResults.filter((t) => t.passed).length}/{sbEngineResults.length} PASSED
                    </span>
                    <button
                      type="button"
                      onClick={() => setSbEngineResults(runRummyEngineTests())}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-[11px] rounded-lg"
                    >
                      Re-run Tests
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sbEngineResults.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-start gap-2.5 text-xs"
                    >
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-stone-200">{t.name}</p>
                        {t.message && <p className="text-[11px] text-stone-400 mt-0.5">{t.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: TOURNAMENTS MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'TOURNAMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-1">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create New Tournament</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Tournament Title</label>
                  <input
                    type="text"
                    value={newTourTitle}
                    onChange={(e) => setNewTourTitle(e.target.value)}
                    placeholder="e.g. Evening Super Freeroll"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Start Time Display</label>
                  <input
                    type="text"
                    value={newTourTime}
                    onChange={(e) => setNewTourTime(e.target.value)}
                    placeholder="e.g. 06:00 PM, Today"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-400 block mb-1">Entry Fee (₹)</label>
                    <input
                      type="number"
                      value={newTourEntry}
                      onChange={(e) => setNewTourEntry(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Prize Pool (₹)</label>
                    <input
                      type="number"
                      value={newTourPrize}
                      onChange={(e) => setNewTourPrize(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={newTourMax}
                    onChange={(e) => setNewTourMax(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100 font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newTourTitle) {
                      alert('Please provide a tournament title');
                      return;
                    }
                    adminCreateTournament({
                      title: newTourTitle,
                      timeDisplay: newTourTime,
                      startTime: new Date().toISOString(),
                      entryFee: newTourEntry,
                      prizePool: newTourPrize,
                      maxParticipants: newTourMax,
                      status: 'OPEN',
                    });
                    setNewTourTitle('');
                    alert('Tournament published to Player app!');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md uppercase transition-colors"
                >
                  Publish Tournament
                </button>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3 md:col-span-2">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Active Tournaments Roster</span>
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto no-scrollbar">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="bg-stone-950 border border-stone-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{t.title}</h4>
                      <p className="text-[11px] text-stone-400">
                        {t.timeDisplay} · Entry: {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`} · Prize: ₹{t.prizePool}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">
                        {t.joinedCount} / {t.maxParticipants} Registered
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-mono">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: SETTINGS, RAKE & MARKETING */}
        {/* ============================================================== */}
        {activeTab === 'SETTINGS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Economics & House Rake */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>House Rake & Withdrawal Limits</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-stone-400 font-bold">House Rake Commission</label>
                    <span className="font-mono font-bold text-amber-400 text-sm">{rakeVal}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={rakeVal}
                    onChange={(e) => setRakeVal(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-500">
                    Industry standard is 3% to 5% deducted on table pots.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Min Withdrawal (₹)</label>
                    <input
                      type="number"
                      value={minWdVal}
                      onChange={(e) => setMinWdVal(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Max Withdrawal (₹)</label>
                    <input
                      type="number"
                      value={maxWdVal}
                      onChange={(e) => setMaxWdVal(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Welcome Signup Bonus (₹)</label>
                    <input
                      type="number"
                      value={welcomeBonusVal}
                      onChange={(e) => setWelcomeBonusVal(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1 font-bold">Referral Bonus (₹)</label>
                    <input
                      type="number"
                      value={referralBonusVal}
                      onChange={(e) => setReferralBonusVal(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                    />
                  </div>
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Server Maintenance Mode</span>
                    <span className="text-[10px] text-stone-400">
                      Displays maintenance downtime alert on player apps
                    </span>
                  </div>
                  <button
                    onClick={() => setMaintenanceModeVal(!maintenanceModeVal)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                      maintenanceModeVal
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    {maintenanceModeVal ? 'MAINTENANCE ON' : 'OFF'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    sounds.playCoinSound();
                    adminUpdateSettings({
                      houseRakePercent: rakeVal,
                      minWithdrawal: minWdVal,
                      maxWithdrawal: maxWdVal,
                      welcomeBonus: welcomeBonusVal,
                      referralBonus: referralBonusVal,
                      maintenanceMode: maintenanceModeVal,
                    });
                    alert('System and economic settings saved!');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
                >
                  Apply System Settings
                </button>
              </div>
            </div>

            {/* Live Broadcast Ticker */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Live Broadcast & Player Announcements</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1 font-bold">
                    Broadcast Message (Ticker across Player Screens)
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="e.g. FLASH TOURNAMENT: 50K Freeroll starts at 7 PM! Register now with zero entry fee!"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!broadcastText.trim()) return;
                    adminSendBroadcast(broadcastText.trim());
                    alert('Broadcast notification sent to all active players!');
                    setBroadcastText('');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
                >
                  Send Push Broadcast to Players
                </button>
              </div>
            </div>

            {/* Admin Authentication & Security Credentials Configuration */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2">
              <h3 className="font-extrabold text-sm text-white flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Route & Security Credentials (https://cardingx.in/admin)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  ROUTE: /admin ACTIVE
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <p className="text-stone-300 leading-relaxed">
                    The Admin Panel is accessible directly at <strong className="text-amber-400 font-mono">/admin</strong> (or <strong className="text-amber-400 font-mono">https://cardingx.in/admin</strong> after Vercel deployment). Only authorized admins can log in and manage the database, wallets, users, and games.
                  </p>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5 font-mono text-[11px]">
                    <div className="text-stone-400">Current Built-in Authorized Emails:</div>
                    <div className="text-amber-300 font-bold">{AUTHORIZED_ADMIN_EMAILS.join(', ')}</div>
                    <div className="text-stone-400 mt-2">Active Admin Session:</div>
                    <div className="text-emerald-400 font-bold">
                      {typeof window !== 'undefined' ? sessionStorage.getItem('master_rummy_admin_email') || 'admin@masterrummy.com' : 'admin'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Set Custom Admin Gmail & Password</span>
                  </h4>

                  <div>
                    <label className="text-stone-400 block mb-1 font-bold text-[11px]">Admin Gmail Address</label>
                    <input
                      type="email"
                      value={customGmailInput}
                      onChange={(e) => setCustomGmailInput(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1 font-bold text-[11px]">Admin Security Password / Key</label>
                    <input
                      type="password"
                      value={customPasswordInput}
                      onChange={(e) => setCustomPasswordInput(e.target.value)}
                      placeholder="Enter new password (or leave blank to keep default)"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  {customCredsSaved && (
                    <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Custom Admin credentials successfully updated!</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!customGmailInput.trim()) {
                        alert('Please enter a valid Gmail address');
                        return;
                      }
                      sounds.playCoinSound();
                      setCustomAdminCredentials(
                        customGmailInput.trim(),
                        customPasswordInput.trim() || 'MasterAdmin@2026'
                      );
                      setCustomCredsSaved(true);
                      setTimeout(() => setCustomCredsSaved(false), 3000);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Save Custom Admin Gmail & Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
