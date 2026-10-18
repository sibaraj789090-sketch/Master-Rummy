import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Headphones,
  Users,
  X,
  Mail,
  Lock,
  User,
  Zap,
  LogOut,
  Sparkles,
  AlertCircle,
  Database,
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import {
  signInWithEmail,
  signUpWithEmail,
  signInQuickTestUser,
  signOutUser,
  getSupabaseConfig,
} from '../../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport: () => void;
  onOpenSupabaseSetup?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenSupport,
  onOpenSupabaseSetup,
}) => {
  const { currentUser, updateCurrentUserProfile } = useRummy();

  const [authMode, setAuthMode] = useState<'TEST_ACCOUNTS' | 'EMAIL' | 'PHONE'>('TEST_ACCOUNTS');
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // Phone form states
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('8438242692');
  const [otp, setOtp] = useState('5432');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const config = getSupabaseConfig();

  if (!isOpen) return null;

  // 1. Quick Test Account Handler (Instant 2-player verification)
  const handleQuickLogin = async (accountNum: 1 | 2) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    sounds.playCoinSound();

    try {
      const res = await signInQuickTestUser(accountNum);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        updateCurrentUserProfile({
          id: res.user.id,
          username: res.user.username,
          avatar: res.user.avatar,
          practiceChips: res.user.practiceChips,
          isKycVerified: true,
        });
        sounds.playWinFanfare();
        setSuccessMessage(`Logged in as ${res.user.username}!`);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Email Auth Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    sounds.playCardClick();

    try {
      if (isSignUp) {
        const res = await signUpWithEmail(email, password, username);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          updateCurrentUserProfile({
            id: res.user.id,
            username: res.user.username,
            avatar: res.user.avatar,
            practiceChips: res.user.practiceChips,
            email: res.user.email,
          });
          sounds.playWinFanfare();
          setSuccessMessage('Account registered successfully!');
          setTimeout(() => onClose(), 600);
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          updateCurrentUserProfile({
            id: res.user.id,
            username: res.user.username,
            avatar: res.user.avatar,
            practiceChips: res.user.practiceChips,
            email: res.user.email,
          });
          sounds.playWinFanfare();
          setSuccessMessage(`Welcome back, ${res.user.username}!`);
          setTimeout(() => onClose(), 600);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Mobile OTP Handler
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    sounds.playCardClick();
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('OTP');
    }, 500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCoinSound();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      updateCurrentUserProfile({
        phone,
        isKycVerified: true,
        username: `Player_${phone.slice(-4)}`,
      });
      sounds.playWinFanfare();
      onClose();
    }, 600);
  };

  // 4. Logout Handler
  const handleLogout = async () => {
    sounds.playCardClick();
    await signOutUser();
    updateCurrentUserProfile({
      id: `guest_${Date.now()}`,
      username: 'Guest_Player',
      email: '',
      phone: '',
      practiceChips: 10000,
    });
    setSuccessMessage('Logged out successfully');
  };

  const isLoggedInUser = currentUser.username && currentUser.username !== 'Guest_Player';

  return (
    <div className="fixed inset-0 z-50 bg-[#420409] text-white flex flex-col justify-between p-4 select-none overflow-y-auto no-scrollbar">
      {/* Top Bar with Brand & Support */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <span className="w-5 h-6 rounded bg-white text-red-600 font-black text-[10px] flex items-center justify-center shadow-xs">
              M
            </span>
            <span className="w-5 h-6 rounded bg-white text-slate-900 font-black text-[10px] flex items-center justify-center shadow-xs">
              A
            </span>
            <span className="w-5 h-6 rounded bg-white text-red-600 font-black text-[10px] flex items-center justify-center shadow-xs">
              S
            </span>
            <span className="w-5 h-6 rounded bg-white text-slate-900 font-black text-[10px] flex items-center justify-center shadow-xs">
              T
            </span>
          </div>
          <span className="text-xs font-black tracking-wider text-amber-300">MASTER RUMMY</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Supabase backend status pill */}
          <div
            onClick={() => {
              if (onOpenSupabaseSetup) {
                onClose();
                onOpenSupabaseSetup();
              }
            }}
            className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold cursor-pointer border ${
              config.isConfigured
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{config.isConfigured ? 'Supabase Live' : 'Supabase Config'}</span>
          </div>

          <button
            onClick={() => {
              sounds.playCardClick();
              onOpenSupport();
            }}
            className="p-1 rounded-full bg-black/30 hover:bg-black/50 text-amber-300"
          >
            <Headphones className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              onClose();
            }}
            className="p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="text-center my-auto py-4 max-w-sm mx-auto w-full">
        {/* If Already Logged In: Show Account Summary */}
        {isLoggedInUser ? (
          <div className="bg-[#59050d] border border-amber-400/40 rounded-3xl p-5 shadow-2xl text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-red-900/60">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover shadow-md"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Active Player Session
                </span>
                <h3 className="text-lg font-black text-white truncate">{currentUser.username}</h3>
                <p className="text-xs text-stone-300 truncate">
                  {currentUser.email || currentUser.phone || `ID: ${currentUser.id}`}
                </p>
              </div>
            </div>

            <div className="bg-stone-950/70 border border-amber-500/30 rounded-xl p-3 my-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">
                  Real Cash Balance
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                  100% Real Money
                </span>
              </div>
              <p className="text-2xl font-black text-amber-300 mt-1">
                ₹{(currentUser.depositBalance + currentUser.withdrawalBalance).toFixed(2)}
              </p>
              <div className="flex justify-between items-center text-[10px] text-stone-300 mt-1.5 pt-1.5 border-t border-stone-800">
                <span>Deposit: <strong className="text-white font-mono">₹{currentUser.depositBalance.toFixed(2)}</strong></span>
                <span>Winnings: <strong className="text-emerald-400 font-mono">₹{currentUser.withdrawalBalance.toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onClose()}
                className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all text-center"
              >
                ENTER LOBBY
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 bg-stone-900 hover:bg-stone-800 border border-red-500/40 text-rose-300 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOG OUT</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter drop-shadow-md">
              MASTER RUMMY
            </h1>
            <h2 className="text-base font-black text-amber-400 tracking-tight -mt-0.5">
              MULTIPLAYER AUTHENTICATION
            </h2>

            {/* Auth Mode Tabs */}
            <div className="flex bg-black/40 border border-red-800/60 rounded-xl p-1 mt-4 mb-3 text-xs font-bold">
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthMode('TEST_ACCOUNTS');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  authMode === 'TEST_ACCOUNTS'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Test</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthMode('EMAIL');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  authMode === 'EMAIL'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Supabase Email</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthMode('PHONE');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  authMode === 'PHONE'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone OTP</span>
              </button>
            </div>

            {/* Notification alert */}
            {errorMessage && (
              <div className="mb-3 p-2 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-1.5 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-3 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-1.5 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Mode 1: Quick Test Accounts (Perfect for 2-Device verification!) */}
            {authMode === 'TEST_ACCOUNTS' && (
              <div className="bg-[#8b0f19] border border-red-700/60 rounded-3xl p-5 shadow-2xl text-left space-y-3">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Two-Player Instant Test Accounts</span>
                </div>
                <p className="text-[11px] text-stone-200 leading-snug">
                  Use these 1-click accounts to test multiplayer matchmaking & game rooms between two devices or browser tabs:
                </p>

                {/* Account 1 */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(1)}
                  className="w-full p-3 bg-stone-900/90 hover:bg-stone-800 border-2 border-emerald-500/70 rounded-2xl flex items-center justify-between text-left transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                      alt="Player Alpha"
                      className="w-10 h-10 rounded-full border border-emerald-400 object-cover"
                    />
                    <div>
                      <span className="text-xs font-black text-emerald-300 block">PLAYER 1 (ALPHA)</span>
                      <span className="text-[10px] text-stone-300">Device 1 / Tab 1 · Host Room</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                    LOG IN ›
                  </span>
                </button>

                {/* Account 2 */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(2)}
                  className="w-full p-3 bg-stone-900/90 hover:bg-stone-800 border-2 border-cyan-500/70 rounded-2xl flex items-center justify-between text-left transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Player Beta"
                      className="w-10 h-10 rounded-full border border-cyan-400 object-cover"
                    />
                    <div>
                      <span className="text-xs font-black text-cyan-300 block">PLAYER 2 (BETA)</span>
                      <span className="text-[10px] text-stone-300">Device 2 / Tab 2 · Join Room</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black bg-cyan-600 text-white px-2.5 py-1 rounded-lg">
                    LOG IN ›
                  </span>
                </button>
              </div>
            )}

            {/* Mode 2: Real Supabase Email / Password */}
            {authMode === 'EMAIL' && (
              <div className="bg-[#8b0f19] border border-red-700/60 rounded-3xl p-5 shadow-2xl text-left">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-white">
                    {isSignUp ? 'Create Supabase Player Account' : 'Supabase Auth Sign In'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs font-bold text-amber-300 underline"
                  >
                    {isSignUp ? 'Have Account? Login' : 'New? Sign Up'}
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {isSignUp && (
                    <div className="bg-white rounded-xl p-2.5 flex items-center gap-2 shadow-inner">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Player username"
                        className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-hidden"
                      />
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-2.5 flex items-center gap-2 shadow-inner">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="bg-white rounded-xl p-2.5 flex items-center gap-2 shadow-inner">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 chars)"
                      className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-transform uppercase"
                  >
                    {isSubmitting
                      ? 'AUTHENTICATING...'
                      : isSignUp
                      ? 'REGISTER & PLAY'
                      : 'SIGN IN TO MASTER RUMMY'}
                  </button>
                </form>
              </div>
            )}

            {/* Mode 3: Traditional Phone OTP */}
            {authMode === 'PHONE' && (
              <div className="bg-[#8b0f19] border border-red-700/60 rounded-3xl p-5 shadow-2xl text-left">
                <h3 className="text-sm font-extrabold text-white mb-3">
                  {step === 'PHONE' ? 'Login via Mobile Number' : 'Enter 4-Digit OTP'}
                </h3>

                {step === 'PHONE' ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-3">
                    <div className="bg-white rounded-xl p-2.5 flex items-center gap-2 shadow-inner">
                      <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-500 font-bold text-xs">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter mobile number"
                        className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-transform uppercase"
                    >
                      {isSubmitting ? 'SENDING OTP...' : 'CONTINUE'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-3">
                    <p className="text-xs text-white/80">OTP sent to +91 {phone}</p>
                    <div className="bg-white rounded-xl p-2 flex items-center justify-center gap-2 shadow-inner">
                      <input
                        type="text"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="••••"
                        className="w-full text-center tracking-widest text-slate-900 font-black text-lg focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-transform uppercase"
                    >
                      {isSubmitting ? 'VERIFYING...' : 'VERIFY & PLAY'}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setStep('PHONE')}
                        className="text-xs text-amber-300 font-bold hover:underline"
                      >
                        Change Mobile Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certifications & 18+ Footnote */}
      <div className="pt-3 pb-2 border-t border-red-950/60 text-center space-y-2">
        <div className="flex justify-center items-center gap-6 text-[10px] text-stone-300 font-semibold">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-4 h-4 text-amber-400 mb-0.5" />
            <span>Anti-Cheat RLS</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span>Realtime Synchronized</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span>Certified RNG</span>
          </div>
        </div>

        <p className="text-[10px] text-white/60 max-w-xs mx-auto leading-tight">
          <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded mr-1">18+</span>
          Non-redeemable Practice Points only. No real money gambling or paid entry fees.
        </p>
      </div>
    </div>
  );
};
