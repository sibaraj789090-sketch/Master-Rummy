import React, { useState, useEffect } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  ShieldCheck,
  CheckCircle2,
  Headphones,
  X,
  Phone,
  User,
  LogOut,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw,
  FileText,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import {
  sendMobileOtp,
  verifyMobileOtp,
  signInWithGoogle,
  signOutUser,
  getSupabaseConfig,
} from '../../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport: () => void;
  onOpenSupabaseSetup?: () => void;
  onOpenDocumentsVerification?: () => void;
  onSuccess?: () => void;
  initialMode?: 'LOGIN' | 'SIGNUP';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenSupport,
  onOpenSupabaseSetup,
  onOpenDocumentsVerification,
  onSuccess,
  initialMode = 'SIGNUP',
}) => {
  const { currentUser, updateCurrentUserProfile } = useRummy();

  // Active auth tab: 'MOBILE_OTP' | 'GOOGLE'
  const [authTab, setAuthTab] = useState<'MOBILE_OTP' | 'GOOGLE'>('MOBILE_OTP');
  const [isSignUp, setIsSignUp] = useState(() => !currentUser.isRegistered || initialMode === 'SIGNUP');

  // Mobile OTP States
  const [mobileNumber, setMobileNumber] = useState('');
  const [signupName, setSignupName] = useState('');
  const [mobileStep, setMobileStep] = useState<'NUMBER' | 'OTP'>('NUMBER');
  const [mobileOtp, setMobileOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  // 18+ Mandatory Declaration Checkbox
  const [is18PlusAgreed, setIs18PlusAgreed] = useState(true);

  // Status & loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const config = getSupabaseConfig();

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: any;
    if (mobileStep === 'OTP' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mobileStep, resendTimer]);

  if (!isOpen) return null;

  // 1. Send Real SMS OTP to Mobile Number
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowConfigHelp(false);

    const cleanNum = mobileNumber.replace(/\D/g, '');
    if (cleanNum.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)');
      return;
    }

    if (isSignUp && !signupName.trim()) {
      setErrorMessage('Please enter your player name for account registration');
      return;
    }

    if (!is18PlusAgreed) {
      setErrorMessage('Strictly 18+ Only! You must confirm you are 18 years or older to proceed.');
      return;
    }

    sounds.playCardClick();
    setIsSubmitting(true);

    const res = await sendMobileOtp(cleanNum);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to dispatch SMS OTP.');
      if (
        !config.isConfigured ||
        res.error?.toLowerCase().includes('provider') ||
        res.error?.toLowerCase().includes('configuration')
      ) {
        setShowConfigHelp(true);
      }
    } else {
      sounds.playCoinSound();
      setMobileStep('OTP');
      setResendTimer(60);
      setSuccessMessage(res.message || `SMS OTP dispatched to +91 ${cleanNum}.`);
    }
  };

  // 2. Resend SMS OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    sounds.playCardClick();
    setIsSubmitting(true);

    const cleanNum = mobileNumber.replace(/\D/g, '');
    const res = await sendMobileOtp(cleanNum);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to resend SMS OTP.');
      if (!config.isConfigured || res.error?.toLowerCase().includes('provider')) {
        setShowConfigHelp(true);
      }
    } else {
      sounds.playCoinSound();
      setResendTimer(60);
      setSuccessMessage(`New SMS OTP dispatched to +91 ${cleanNum}.`);
    }
  };

  // 3. Verify Real SMS OTP
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = mobileOtp.trim();
    if (cleanOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code received on your phone.');
      return;
    }

    sounds.playCoinSound();
    setIsSubmitting(true);

    const cleanNum = mobileNumber.replace(/\D/g, '');
    const res = await verifyMobileOtp(cleanNum, cleanOtp, signupName);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
      if (!config.isConfigured) {
        setShowConfigHelp(true);
      }
      return;
    }

    if (res.user) {
      const playerName = res.user.username;
      updateCurrentUserProfile({
        id: res.user.id,
        phone: cleanNum,
        whatsappNumber: cleanNum,
        isWhatsappVerified: true,
        is18PlusConfirmed: true,
        isRegistered: true,
        username: playerName,
        // Guarantee ₹50 welcome bonus for new users
        bonusBalance: currentUser.bonusBalance && currentUser.bonusBalance >= 50 ? currentUser.bonusBalance : 50,
      });

      sounds.playWinFanfare();
      setSuccessMessage(
        isSignUp
          ? `🎉 Welcome to Master Rummy, ${playerName}! 18+ Verified & ₹50 Welcome Bonus Credited!`
          : `✅ Verified via Mobile OTP! Welcome back, ${playerName}!`
      );

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    }
  };

  // 4. Continue with Google Login
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowConfigHelp(false);

    if (!is18PlusAgreed) {
      setErrorMessage('Strictly 18+ Only! You must confirm you are 18 years or older.');
      return;
    }

    sounds.playCardClick();
    setIsGoogleSubmitting(true);

    const res = await signInWithGoogle();
    setIsGoogleSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
      if (!config.isConfigured || res.error.toLowerCase().includes('provider')) {
        setShowConfigHelp(true);
      }
    } else {
      setSuccessMessage('Redirecting to Google Sign-In...');
    }
  };

  // 5. Logout Handler
  const handleLogout = async () => {
    sounds.playCardClick();
    await signOutUser();
    updateCurrentUserProfile({
      id: `guest_${Date.now()}`,
      username: 'Guest Player',
      email: '',
      phone: '',
      whatsappNumber: '',
      isWhatsappVerified: false,
      isRegistered: false,
      is18PlusConfirmed: false,
      depositBalance: 0,
      withdrawalBalance: 0,
      bonusBalance: 50.0,
      practiceChips: 10000,
      isKycVerified: false,
      hasDeposited: false,
      totalDeposited: 0,
    });
    setSuccessMessage('Logged out successfully');
  };

  const isLoggedInUser = Boolean(
    currentUser.isRegistered &&
    currentUser.username !== 'Guest Player' &&
    (currentUser.phone || currentUser.email)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#420409] text-white flex flex-col justify-between p-4 select-none overflow-y-auto no-scrollbar">
      {/* Top Bar with Brand, 18+ Badge & Close/Support */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
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
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-amber-300">MASTER RUMMY</span>
              <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded">
                18+
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSupabaseSetup && (
            <button
              onClick={() => {
                sounds.playCardClick();
                onOpenSupabaseSetup();
              }}
              title="Authentication Provider Settings"
              className="p-1 rounded-full bg-black/30 hover:bg-black/50 text-emerald-400"
            >
              <Database className="w-4 h-4" />
            </button>
          )}

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
      <div className="text-center my-auto py-3 max-w-sm mx-auto w-full">
        {/* If Already Logged In: Show Account Summary */}
        {isLoggedInUser ? (
          <div className="bg-[#59050d] border border-amber-400/40 rounded-3xl p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-red-900/60">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Active Player
                  </span>
                  <span className="text-[9px] bg-red-700 text-white font-black px-1.5 py-0.2 rounded-sm">
                    18+ Confirmed
                  </span>
                </div>
                <h3 className="text-lg font-black text-white truncate">{currentUser.username}</h3>
                <p className="text-xs text-stone-300 truncate">
                  {currentUser.phone ? `Mobile: +91 ${currentUser.phone}` : currentUser.email}
                </p>
              </div>
            </div>

            {/* Mobile & KYC Status Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block font-bold">
                    {currentUser.email && !currentUser.phone ? 'Google Login' : 'Mobile OTP'}
                  </span>
                  <span className="font-extrabold text-emerald-400 text-[11px] truncate block">
                    Verified ✅
                  </span>
                </div>
              </div>

              <div
                onClick={() => {
                  if (onOpenDocumentsVerification) {
                    onClose();
                    onOpenDocumentsVerification();
                  }
                }}
                className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30 flex items-center gap-2 cursor-pointer hover:bg-black/60 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block font-bold">Aadhaar / PAN KYC</span>
                  <span className="font-extrabold text-amber-300 text-[11px] truncate block">
                    {currentUser.isKycVerified ? 'Verified ✅' : 'Complete 18+ KYC ›'}
                  </span>
                </div>
              </div>
            </div>

            {/* Real Cash Balance */}
            <div className="bg-stone-950/70 border border-amber-500/30 rounded-xl p-3">
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
                <span>
                  Deposit: <strong className="text-white font-mono">₹{currentUser.depositBalance.toFixed(2)}</strong>
                </span>
                <span>
                  Winnings: <strong className="text-emerald-400 font-mono">₹{currentUser.withdrawalBalance.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onClose()}
                className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all text-center"
              >
                PLAY NOW
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
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white italic tracking-tighter drop-shadow-md">
                MASTER RUMMY
              </h1>
              <span className="bg-red-700 text-white font-black text-xs px-2 py-0.5 rounded-md shadow-xs">
                18+ ONLY
              </span>
            </div>
            <h2 className="text-xs font-black text-amber-300 tracking-tight mt-0.5">
              SECURE LOGIN & SIGNUP
            </h2>

            {/* ₹50 Welcome Bonus Promotional Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 rounded-2xl p-2.5 my-2.5 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs shadow-md shrink-0">
                  ₹50
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-300">FREE ₹50 WELCOME BONUS</span>
                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded">
                      100% REAL
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-tight">
                    Instant ₹50 bonus added to your wallet upon free registration!
                  </p>
                </div>
              </div>
            </div>

            {/* Two Exclusive Methods Tab: 1. Mobile Number OTP  2. Gmail / Google */}
            <div className="flex bg-black/40 border border-red-800/60 rounded-xl p-1 mb-3 text-xs font-bold">
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthTab('MOBILE_OTP');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'MOBILE_OTP'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile Number OTP</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthTab('GOOGLE');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'GOOGLE'
                    ? 'bg-white text-stone-950 font-black shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {/* Official Google 'G' icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Login</span>
              </button>
            </div>

            {/* Notification alert */}
            {errorMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start gap-2 text-left shadow-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="leading-tight font-semibold">{errorMessage}</p>
                  {showConfigHelp && onOpenSupabaseSetup && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCardClick();
                        onOpenSupabaseSetup();
                      }}
                      className="mt-1.5 text-[11px] bg-rose-900 hover:bg-rose-800 text-white font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-rose-400/40"
                    >
                      <Database className="w-3 h-3" />
                      <span>Configure Supabase Credentials ›</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 text-left shadow-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="leading-tight font-semibold">{successMessage}</span>
              </div>
            )}

            {/* METHOD 1: MOBILE NUMBER OTP LOGIN & SIGNUP */}
            {authTab === 'MOBILE_OTP' && (
              <div className="bg-[#1f2429] border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-left space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

                {/* Toggle Login vs Sign Up */}
                <div className="flex items-center justify-between border-b border-stone-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {isSignUp ? 'Mobile Sign Up' : 'Mobile Login'}
                      </h3>
                      <span className="text-[10px] text-amber-300 font-medium">Real SMS OTP Verification</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playCardClick();
                      setIsSignUp(!isSignUp);
                      setMobileStep('NUMBER');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 underline"
                  >
                    {isSignUp ? 'Already registered? Login' : 'New Player? Sign Up'}
                  </button>
                </div>

                {mobileStep === 'NUMBER' ? (
                  <form onSubmit={handleSendMobileOtp} className="space-y-3">
                    {/* Full Name for Sign Up */}
                    {isSignUp && (
                      <div>
                        <label className="text-[11px] font-bold text-stone-300 block mb-1">
                          Full Player Name *
                        </label>
                        <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 flex items-center gap-2 focus-within:border-amber-400">
                          <User className="w-4 h-4 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-transparent text-white font-bold text-xs focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mobile Number with Country Code +91 */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">
                        Mobile Number (India) *
                      </label>
                      <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 flex items-center gap-2 focus-within:border-amber-400">
                        <span className="text-amber-300 font-bold text-xs bg-black/60 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-400/30">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="98765 43210"
                          className="w-full bg-transparent text-white font-bold text-sm tracking-wider focus:outline-hidden"
                        />
                        <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        A real SMS OTP will be sent to verify this mobile number.
                      </span>
                    </div>

                    {/* 18+ Mandatory Declaration Checkbox */}
                    <div className="p-2 rounded-xl bg-black/40 border border-red-500/30">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={is18PlusAgreed}
                          onChange={(e) => setIs18PlusAgreed(e.target.checked)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 w-4 h-4 shrink-0"
                        />
                        <span className="text-[11px] text-stone-200 font-semibold leading-tight">
                          <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded mr-1">
                            18+
                          </span>
                          I declare that I am <strong>18 years of age or older</strong> and agree to Master Rummy Terms & Responsible Gaming Policy.
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>SENDING SMS OTP...</span>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>SEND SMS OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: ENTER MOBILE SMS OTP */
                  <form onSubmit={handleVerifyMobileOtp} className="space-y-3">
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-stone-300">OTP sent via SMS to:</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          +91 {mobileNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        Please check your phone text messages for the Master Rummy verification code.
                      </p>
                    </div>

                    {/* 6-Digit OTP Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold text-stone-300">
                          Enter 6-Digit SMS OTP *
                        </label>
                        <span className="text-[10px] text-stone-400">
                          {resendTimer > 0 ? `Expires in ${resendTimer}s` : 'Code expired? Resend below'}
                        </span>
                      </div>

                      <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 focus-within:border-amber-400">
                        <input
                          type="text"
                          maxLength={6}
                          autoFocus
                          value={mobileOtp}
                          onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full text-center tracking-[0.5em] text-white font-mono font-black text-xl focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Resend OTP button & Change Number */}
                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playCardClick();
                          setMobileStep('NUMBER');
                          setErrorMessage(null);
                        }}
                        className="text-stone-400 hover:text-white underline text-[11px]"
                      >
                        Change Number
                      </button>

                      <button
                        type="button"
                        disabled={resendTimer > 0 || isSubmitting}
                        onClick={handleResendOtp}
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          resendTimer > 0
                            ? 'text-stone-500 cursor-not-allowed'
                            : 'text-amber-400 hover:underline'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend SMS OTP'}</span>
                      </button>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>VERIFYING OTP...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>VERIFY & {isSignUp ? 'SIGN UP' : 'LOGIN'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: GMAIL / GOOGLE LOGIN */}
            {authTab === 'GOOGLE' && (
              <div className="bg-[#1f2429] border border-stone-700/80 rounded-3xl p-5 shadow-2xl text-left space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500" />

                <div className="text-center pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-md mx-auto flex items-center justify-center mb-2">
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-white">Continue with Google</h3>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    Sign up or log in instantly using your verified Google / Gmail account.
                  </p>
                </div>

                {/* 18+ Mandatory Declaration Checkbox */}
                <div className="p-2 rounded-xl bg-black/40 border border-red-500/30">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={is18PlusAgreed}
                      onChange={(e) => setIs18PlusAgreed(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 w-4 h-4 shrink-0"
                    />
                    <span className="text-[11px] text-stone-200 font-semibold leading-tight">
                      <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded mr-1">
                        18+
                      </span>
                      I declare that I am <strong>18 years of age or older</strong> and agree to Master Rummy Terms.
                    </span>
                  </label>
                </div>

                {/* Continue with Google Action Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSubmitting}
                  className="w-full py-3.5 bg-white hover:bg-stone-100 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2.5 border border-stone-300"
                >
                  {isGoogleSubmitting ? (
                    <span>CONNECTING TO GOOGLE...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>CONTINUE WITH GOOGLE</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-stone-400 text-center">
                  Safe & encrypted authentication powered by Google OAuth.
                </p>
              </div>
            )}

            {/* Direct Documents Verification shortcut */}
            {onOpenDocumentsVerification && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenDocumentsVerification();
                  }}
                  className="w-full py-2 bg-black/30 hover:bg-black/50 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Aadhaar Card / PAN Card (18+ KYC) ›</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certifications & 18+ Footnote */}
      <div className="pt-2 pb-1 border-t border-red-950/60 text-center space-y-1.5 shrink-0">
        <div className="flex justify-center items-center gap-5 text-[10px] text-stone-300 font-semibold">
          <div className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>SMS OTP Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Cheat RLS</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RNG Certified</span>
          </div>
        </div>

        <p className="text-[10px] text-white/70 max-w-xs mx-auto leading-tight">
          <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded mr-1">
            18+ ONLY
          </span>
          Participation is restricted to Indian adults aged 18 and above. Rummy is recognized as a game of skill by the Hon'ble Supreme Court of India.
        </p>
      </div>
    </div>
  );
};
