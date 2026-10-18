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
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import { verifyAdminCredentials } from '../../lib/supabase';

interface AdminPanelProps {
  onSwitchToPlayer: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSwitchToPlayer }) => {
  const {
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
    adminCreateTournament,
    adminUpdateSettings,
    adminSendBroadcast,
    adminAddCoupon,
    isAdmin,
    checkAdminPermissions,
  } = useRummy();

  const [authAdminEmail, setAuthAdminEmail] = useState('');
  const [authAdminKey, setAuthAdminKey] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'WITHDRAWALS' | 'USERS' | 'TOURNAMENTS' | 'COUPONS' | 'BROADCAST' | 'LEDGER'
  >('OVERVIEW');

  // Hard gatekeeper for admin permissions
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-amber-300">Admin Permissions Required</h2>
          <p className="text-xs text-stone-400 mt-1 mb-5">
            This operations management console is restricted. Authenticate with verified administrator credentials to access.
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
              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={authAdminEmail}
                onChange={(e) => setAuthAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                Security Key
              </label>
              <input
                type="password"
                value={authAdminKey}
                onChange={(e) => setAuthAdminKey(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-hidden focus:border-amber-400 font-mono"
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {isVerifying ? 'VERIFYING...' : 'VERIFY & ENTER ADMIN CONSOLE'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-stone-800">
            <button
              onClick={() => {
                sounds.playCardClick();
                onSwitchToPlayer();
              }}
              className="text-xs text-stone-400 hover:text-white font-semibold transition-colors"
            >
              ← Return to Game Table / Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Withdrawal filters
  const [withdrawalFilter, setWithdrawalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // User search & balance modal
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<string | null>(null);
  const [depositDelta, setDepositDelta] = useState<number>(500);
  const [withdrawalDelta, setWithdrawalDelta] = useState<number>(0);
  const [bonusDelta, setBonusDelta] = useState<number>(100);

  // New Tournament form
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourTime, setNewTourTime] = useState('06:00 PM, Today');
  const [newTourEntry, setNewTourEntry] = useState<number>(5);
  const [newTourPrize, setNewTourPrize] = useState<number>(2500);
  const [newTourMax, setNewTourMax] = useState<number>(500);

  // New Coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState<number>(150);
  const [newCouponMaxBonus, setNewCouponMaxBonus] = useState<number>(5000);

  // Broadcast message
  const [broadcastText, setBroadcastText] = useState('');

  // Rake & house settings
  const [rakeVal, setRakeVal] = useState(adminSettings.houseRakePercent);

  // Computed metrics
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
    .reduce((acc, t) => acc + (t.amount * 0.03), 0);

  const filteredWithdrawals = withdrawalRequests.filter((r) => {
    if (withdrawalFilter === 'ALL') return true;
    return r.status === withdrawalFilter;
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      u.id.includes(userSearch)
  );

  return (
    <div className="min-h-screen bg-stone-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Admin Header */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-amber-600 flex items-center justify-center font-black text-white text-lg shadow-md">
            MR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                MASTER RUMMY <span className="text-amber-400 font-mono text-xs">ADMIN SUITE</span>
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Live Server
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Operations, Financial Reconciliation & Game Control Console
            </p>
          </div>
        </div>

        {/* Action Controls & Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Rake Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-stone-800/80 border border-stone-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-stone-400">House Rake:</span>
            <span className="font-mono font-bold text-amber-300">{adminSettings.houseRakePercent}%</span>
          </div>

          {/* Switch to Player App */}
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

      {/* Main Admin Navigation Bar */}
      <div className="bg-stone-900/60 border-b border-stone-800/80 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
            setActiveTab('USERS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Players & KYC</span>
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
            setActiveTab('COUPONS');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'COUPONS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Coupons & Bonus</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('BROADCAST');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'BROADCAST'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>App Broadcast</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('LEDGER');
          }}
          className={`py-3 px-3.5 flex items-center gap-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'LEDGER'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>Financial Ledger</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>Pending Withdrawals</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-300 mt-2">
                  ₹{totalPendingAmount.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-400 mt-1 font-medium">
                  {pendingWithdrawals.length} request(s) awaiting approval
                </p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>Total Deposits Processed</span>
                  <Coins className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400 mt-2">
                  ₹{totalDeposits.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-500/80 mt-1 font-medium">100% UPI gateway success</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>Total Registered Players</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-black text-white mt-2">{totalUsersCount}</p>
                <p className="text-[11px] text-stone-400 mt-1 font-medium">All KYC Verified Players</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>House Commission (3%)</span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-purple-300 mt-2">
                  ₹{totalHouseRake.toFixed(2)}
                </p>
                <p className="text-[11px] text-stone-400 mt-1 font-medium">Gross gaming revenue rake</p>
              </div>
            </div>

            {/* Quick Actions & Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Pending Withdrawals Approval widget */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Urgent Payout Approvals</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('WITHDRAWALS')}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    View All ({withdrawalRequests.length})
                  </button>
                </div>

                <div className="divide-y divide-stone-800/80 mt-2">
                  {pendingWithdrawals.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                      All withdrawal queues are clear!
                    </div>
                  ) : (
                    pendingWithdrawals.slice(0, 3).map((req) => (
                      <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span>{req.userName}</span>
                            <span className="text-emerald-400 font-mono">₹{req.amount}</span>
                          </div>
                          <p className="text-[11px] text-stone-400">
                            {req.bankAccount.bankName} (•••• {req.bankAccount.accountNumber.slice(-4)})
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveWithdrawal(req.id, 'One-click IMPS approved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            APPROVE
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(req.id, 'Bank details mismatch')}
                            className="bg-stone-800 hover:bg-rose-950 text-rose-300 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-stone-700 transition-colors"
                          >
                            REJECT
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Game Settings & Parameters */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-3 border-b border-stone-800">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Platform Parameters Control</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">House Rake Commission (%)</p>
                      <p className="text-[11px] text-stone-400">Platform fee deducted from cash winnings</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={rakeVal}
                        onChange={(e) => setRakeVal(Number(e.target.value))}
                        className="w-16 bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-center font-mono font-bold"
                      />
                      <button
                        onClick={() => {
                          sounds.playCoinSound();
                          adminUpdateSettings({ houseRakePercent: rakeVal });
                          alert(`House rake updated to ${rakeVal}%`);
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded-lg font-bold text-[11px]"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                    <div>
                      <p className="font-bold text-white">Minimum Withdrawal Limit</p>
                      <p className="text-[11px] text-stone-400">Current threshold: ₹{adminSettings.minWithdrawal}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-300">₹{adminSettings.minWithdrawal}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                    <div>
                      <p className="font-bold text-white">Refer & Earn Reward per Friend</p>
                      <p className="text-[11px] text-stone-400">Tier progression maximum payout</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">₹{adminSettings.referralBonus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAWALS MANAGEMENT */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-extrabold text-white">Withdrawal Approval Queue</h2>
                <p className="text-xs text-stone-400">
                  Manage player bank withdrawals, review TDS compliance, and issue instant IMPS payouts.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      sounds.playCardClick();
                      setWithdrawalFilter(st);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      withdrawalFilter === st
                        ? 'bg-amber-500 text-amber-950 shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawals Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Req ID</th>
                    <th className="py-2.5 px-3">Player / Mobile</th>
                    <th className="py-2.5 px-3">Gross Amount</th>
                    <th className="py-2.5 px-3">TDS (5%)</th>
                    <th className="py-2.5 px-3">Net Payout</th>
                    <th className="py-2.5 px-3">Bank Details</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-500">
                        No withdrawal requests match current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.map((r) => (
                      <tr key={r.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-stone-400">{r.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-white">{r.userName}</p>
                          <p className="text-[10px] text-stone-400">{r.phone}</p>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">₹{r.amount}</td>
                        <td className="py-3 px-3 text-stone-400">₹{r.tdsFee}</td>
                        <td className="py-3 px-3 font-extrabold text-emerald-400">₹{r.netPayable}</td>
                        <td className="py-3 px-3">
                          <p className="text-stone-200">{r.bankAccount.bankName}</p>
                          <p className="text-[10px] font-mono text-stone-400">
                            A/C: {r.bankAccount.accountNumber} · {r.bankAccount.ifsc}
                          </p>
                          <p className="text-[10px] text-stone-500">{r.bankAccount.accountHolder}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              r.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : r.status === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {r.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => approveWithdrawal(r.id, 'Approved via Admin Dashboard')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => rejectWithdrawal(r.id, 'Declined by Admin')}
                                className="bg-stone-800 hover:bg-rose-900 text-rose-300 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-stone-700 transition-colors"
                              >
                                REJECT
                              </button>
                            </div>
                          ) : (
                            <span className="text-stone-500 text-[11px] italic">
                              Processed ({r.processedTime?.split(' ')[1] || 'Done'})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PLAYERS & USERS */}
        {activeTab === 'USERS' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-extrabold text-white">Player Directory & Wallets</h2>
                <p className="text-xs text-stone-400">
                  Search players, modify wallet balances (Deposit, Withdrawal, Bonus), freeze accounts, or audit KYC.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-64">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search player, phone, ID..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Deposit Bal</th>
                    <th className="py-2.5 px-3">Withdrawal Bal</th>
                    <th className="py-2.5 px-3">Bonus Bal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-800 border border-stone-700 shrink-0">
                          <img
                            src={u.avatar}
                            alt={u.username}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-white">{u.username}</p>
                          <p className="text-[10px] font-mono text-stone-500">ID: {u.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-300">{u.phone}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">₹{u.depositBalance.toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-amber-300">₹{u.withdrawalBalance.toFixed(2)}</td>
                      <td className="py-3 px-3 text-blue-400 font-bold">₹{u.bonusBalance.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        {u.isBanned ? (
                          <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                            BANNED
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForBalance(u.id);
                            }}
                            className="bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-stone-700"
                          >
                            ADJUST BAL
                          </button>
                          <button
                            onClick={() => adminToggleUserBan(u.id)}
                            className={`font-bold px-2.5 py-1 rounded-lg text-[11px] ${
                              u.isBanned
                                ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                                : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/40'
                            }`}
                          >
                            {u.isBanned ? 'UNFREEZE' : 'FREEZE'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Adjust Balance Modal */}
            {selectedUserForBalance && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
                <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 max-w-sm w-full space-y-4">
                  <h3 className="font-extrabold text-sm text-white">
                    Adjust Player Wallet Balances
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-stone-400 block mb-1">Deposit Cash (₹ Delta):</label>
                      <input
                        type="number"
                        value={depositDelta}
                        onChange={(e) => setDepositDelta(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Withdrawal Cash (₹ Delta):</label>
                      <input
                        type="number"
                        value={withdrawalDelta}
                        onChange={(e) => setWithdrawalDelta(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Bonus Cash (₹ Delta):</label>
                      <input
                        type="number"
                        value={bonusDelta}
                        onChange={(e) => setBonusDelta(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedUserForBalance(null)}
                      className="flex-1 py-2 bg-stone-800 text-stone-300 font-bold text-xs rounded-xl"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        adminModifyUserBalance(selectedUserForBalance, depositDelta, withdrawalDelta, bonusDelta);
                        setSelectedUserForBalance(null);
                        alert('Balances updated successfully!');
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl"
                    >
                      APPLY CHANGES
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TOURNAMENTS MANAGER */}
        {activeTab === 'TOURNAMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Tournament Form */}
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
                  PUBLISH TO LOBBY
                </button>
              </div>
            </div>

            {/* Existing Tournaments List */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3 md:col-span-2">
              <h3 className="font-extrabold text-sm text-white pb-2 border-b border-stone-800">
                Scheduled Tournaments ({tournaments.length})
              </h3>

              <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="bg-stone-950 border border-stone-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{t.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            t.status === 'FULL' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-stone-400 text-[11px] mt-0.5">
                        Starts: {t.timeDisplay} · Entry: {t.entryFee === 0 ? 'Free' : `₹${t.entryFee}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-amber-400 text-sm">₹{t.prizePool}</p>
                      <p className="text-stone-500 text-[10px]">
                        {t.joinedCount} / {t.maxParticipants} Registered
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS & BONUS */}
        {activeTab === 'COUPONS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Coupon */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-1">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-stone-800">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Create Promo Coupon</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. VIP200"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-amber-300 font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Bonus Percentage (%)</label>
                  <input
                    type="number"
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Max Bonus Cap (₹)</label>
                  <input
                    type="number"
                    value={newCouponMaxBonus}
                    onChange={(e) => setNewCouponMaxBonus(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100 font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newCouponCode) return alert('Enter coupon code');
                    adminAddCoupon({
                      code: newCouponCode,
                      bonusPercent: newCouponPercent,
                      maxBonus: newCouponMaxBonus,
                      minDeposit: 100,
                      description: `${newCouponPercent}% deposit match bonus`,
                      active: true,
                    });
                    setNewCouponCode('');
                    alert('Coupon activated!');
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl uppercase transition-colors"
                >
                  SAVE & ACTIVATE COUPON
                </button>
              </div>
            </div>

            {/* Active Coupons List */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3 md:col-span-2">
              <h3 className="font-extrabold text-sm text-white pb-2 border-b border-stone-800">
                Active Promotional Vouchers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="bg-stone-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-300 font-mono text-sm tracking-wider">
                        {c.code}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">{c.description}</p>
                    <div className="text-[10px] text-stone-400 flex justify-between pt-1 border-t border-stone-800">
                      <span>Rate: {c.bonusPercent}%</span>
                      <span>Max: ₹{c.maxBonus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BROADCAST & ANNOUNCEMENTS */}
        {activeTab === 'BROADCAST' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm max-w-xl mx-auto space-y-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 pb-2 border-b border-stone-800">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Send Live Push Broadcast to All Players</span>
            </h2>

            <p className="text-xs text-stone-400">
              This message will immediately appear as an animated banner at the top of every active player's screen.
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g. ⚡ Mega Festival Tournament starts at 7 PM! ₹10 Lakhs guaranteed cash prize."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-hidden"
              />

              <button
                onClick={() => {
                  if (!broadcastText.trim()) return alert('Enter a message to broadcast');
                  adminSendBroadcast(broadcastText);
                  setBroadcastText('');
                  alert('Broadcast sent! Check the player app header.');
                }}
                className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider transition-colors"
              >
                BROADCAST TO ALL PLAYERS
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: FINANCIAL LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-base font-extrabold text-white">Financial Audit Ledger</h2>
              <span className="text-xs text-stone-400">{transactions.length} Total Logged Entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Tx ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Balance After</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-stone-400 text-[11px]">{tx.id}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            tx.type === 'DEPOSIT'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tx.type === 'WITHDRAWAL'
                              ? 'bg-amber-500/20 text-amber-300'
                              : tx.type === 'GAME_WIN'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-200">{tx.description}</td>
                      <td className="py-2.5 px-3 font-bold text-white">₹{tx.amount}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-400">₹{tx.balanceAfter.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-[11px] text-stone-500">{tx.timestamp}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            tx.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
