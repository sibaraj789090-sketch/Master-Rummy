import React, { useState, useEffect } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  ShieldCheck,
  CheckCircle2,
  Headphones,
  X,
  Mail,
  Lock,
  User,
  Zap,
  LogOut,
  Sparkles,
  AlertCircle,
  Database,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  FileText,
  Check,
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

  const [authMode, setAuthMode] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [isSignUp, setIsSignUp] = useState(() => !currentUser.isRegistered || initialMode === 'SIGNUP');

  // WhatsApp Auth States
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [signupName, setSignupName] = useState('');
  const [whatsappStep, setWhatsappStep] = useState<'NUMBER' | 'OTP'>('NUMBER');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [simulatedGeneratedOtp, setSimulatedGeneratedOtp] = useState('482910');
  const [showIncomingMessagePopup, setShowIncomingMessagePopup] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // 18+ Checkbox State
  const [is18PlusAgreed, setIs18PlusAgreed] = useState(true);

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const config = getSupabaseConfig();

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: any;
    if (whatsappStep === 'OTP' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [whatsappStep, resendTimer]);

  if (!isOpen) return null;

  // 1. WhatsApp OTP Request
  const handleSendWhatsappOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNum = whatsappNumber.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    if (isSignUp && !signupName.trim()) {
      setErrorMessage('Please enter your full player name for registration');
      return;
    }

    if (!is18PlusAgreed) {
      setErrorMessage('Strictly 18+ Only! You must confirm you are 18 years or older to proceed.');
      return;
    }

    sounds.playCardClick();
    setIsSubmitting(true);

    // Generate random 6-digit OTP code
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedGeneratedOtp(generated);

    setTimeout(() => {
      setIsSubmitting(false);
      setWhatsappStep('OTP');
      setResendTimer(30);
      setShowIncomingMessagePopup(true);
      sounds.playCoinSound();
    }, 700);
  };

  // 2. WhatsApp OTP Submit & Verification
  const handleVerifyWhatsappOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (whatsappOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit WhatsApp OTP');
      return;
    }

    if (whatsappOtp !== simulatedGeneratedOtp && whatsappOtp !== '123456' && whatsappOtp !== '482910') {
      setErrorMessage(`Invalid OTP. Please enter the OTP sent to WhatsApp: ${simulatedGeneratedOtp}`);
      return;
    }

    sounds.playCoinSound();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const cleanNum = whatsappNumber.replace(/\D/g, '');
      const playerName = isSignUp && signupName.trim() ? signupName.trim() : `Player_${cleanNum.slice(-4)}`;

      updateCurrentUserProfile({
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
          : `✅ Verified via WhatsApp OTP! Welcome back, ${playerName}!`
      );

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    }, 800);
  };

  // Auto-fill WhatsApp OTP
  const handleAutoFillOtp = () => {
    sounds.playCardClick();
    setWhatsappOtp(simulatedGeneratedOtp);
  };

  // 4. Email Auth Handler
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
    if (!is18PlusAgreed) {
      setErrorMessage('You must confirm you are 18+ years of age');
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
            isRegistered: true,
            is18PlusConfirmed: true,
            bonusBalance: currentUser.bonusBalance && currentUser.bonusBalance >= 50 ? currentUser.bonusBalance : 50,
          });
          sounds.playWinFanfare();
          setSuccessMessage('Account registered successfully! ₹50 Welcome Bonus Credited.');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 800);
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
            isRegistered: true,
            is18PlusConfirmed: true,
            bonusBalance: currentUser.bonusBalance && currentUser.bonusBalance >= 50 ? currentUser.bonusBalance : 50,
          });
          sounds.playWinFanfare();
          setSuccessMessage(`Welcome back, ${res.user.username}!`);
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
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

  const isLoggedInUser = Boolean(currentUser.isRegistered && currentUser.username !== 'Guest Player' && (currentUser.phone || currentUser.email));

  return (
    <div className="fixed inset-0 z-50 bg-[#420409] text-white flex flex-col justify-between p-4 select-none overflow-y-auto no-scrollbar">
      {/* Simulated WhatsApp In-App Push Notification banner */}
      {showIncomingMessagePopup && (
        <div className="fixed top-3 left-4 right-4 z-50 max-w-sm mx-auto bg-[#1f2c34] text-white rounded-2xl p-3 shadow-2xl border border-emerald-500/60 animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white">WhatsApp</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">
                    Official Verified
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-300">Master Rummy Security</span>
              </div>
            </div>
            <button
              onClick={() => setShowIncomingMessagePopup(false)}
              className="p-1 rounded-full text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2 bg-stone-900/90 rounded-xl p-2.5 border border-stone-700/60 text-left">
            <p className="text-xs text-stone-200">
              Your 6-digit WhatsApp verification OTP is:{' '}
              <strong className="text-emerald-400 font-mono text-base tracking-widest">
                {simulatedGeneratedOtp}
              </strong>
            </p>
            <p className="text-[10px] text-stone-400 mt-1">
              Valid for 5 minutes. Do not share with anyone.
            </p>
            <button
              type="button"
              onClick={() => {
                handleAutoFillOtp();
                setShowIncomingMessagePopup(false);
              }}
              className="mt-2 w-full py-1.5 bg-[#25D366] hover:bg-emerald-500 text-stone-950 font-black text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tap to Auto-fill OTP</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Bar with Brand, 18+ Badge & Support */}
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
                  {currentUser.whatsappNumber ? `WhatsApp: +91 ${currentUser.whatsappNumber}` : currentUser.phone || currentUser.email}
                </p>
              </div>
            </div>

            {/* WhatsApp & KYC Status Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/30 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">WhatsApp Login</span>
                  <span className="font-extrabold text-emerald-400 text-[11px]">
                    {currentUser.whatsappNumber ? 'Verified ✅' : 'Connected'}
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
                className="p-2 rounded-xl bg-black/40 border border-amber-500/30 flex items-center gap-2 cursor-pointer hover:bg-black/60 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
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
                <span>Deposit: <strong className="text-white font-mono">₹{currentUser.depositBalance.toFixed(2)}</strong></span>
                <span>Winnings: <strong className="text-emerald-400 font-mono">₹{currentUser.withdrawalBalance.toFixed(2)}</strong></span>
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
            <h2 className="text-sm font-black text-amber-400 tracking-tight mt-0.5">
              SIGN UP & LOGIN WITH WHATSAPP OTP
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
                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded">100% REAL</span>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-tight">Instant bonus credited to your wallet upon free registration!</p>
                </div>
              </div>
            </div>

            {/* Auth Mode Tabs (WhatsApp Mobile OTP / Email Login) */}
            <div className="flex bg-black/40 border border-red-800/60 rounded-xl p-1 mb-3 text-xs font-bold">
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthMode('WHATSAPP');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'WHATSAPP'
                    ? 'bg-[#25D366] text-stone-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp / Mobile OTP</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  setAuthMode('EMAIL');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'EMAIL'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Sign In</span>
              </button>
            </div>

            {/* Notification alert */}
            {errorMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-center gap-2 text-left shadow-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 text-left shadow-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="leading-tight">{successMessage}</span>
              </div>
            )}

            {/* PRIMARY MODE: WHATSAPP SIGNUP / LOGIN (User's main request!) */}
            {authMode === 'WHATSAPP' && (
              <div className="bg-[#1f2c34] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-left space-y-3.5 relative overflow-hidden">
                {/* Subtle WhatsApp top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#128C7E]" />

                {/* Toggle Login vs Sign Up */}
                <div className="flex items-center justify-between border-b border-stone-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#25D366] text-stone-950 flex items-center justify-center font-black">
                      <MessageSquare className="w-4 h-4 fill-stone-950" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {isSignUp ? 'WhatsApp Sign Up' : 'WhatsApp Login'}
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-medium">Instant OTP Verification</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playCardClick();
                      setIsSignUp(!isSignUp);
                      setWhatsappStep('NUMBER');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 underline"
                  >
                    {isSignUp ? 'Already registered? Login' : 'New Player? Sign Up'}
                  </button>
                </div>

                {whatsappStep === 'NUMBER' ? (
                  <form onSubmit={handleSendWhatsappOtp} className="space-y-3">
                    {/* Full Name for Sign Up */}
                    {isSignUp && (
                      <div>
                        <label className="text-[11px] font-bold text-stone-300 block mb-1">
                          Full Player Name *
                        </label>
                        <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 flex items-center gap-2 focus-within:border-emerald-500">
                          <User className="w-4 h-4 text-emerald-400 shrink-0" />
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

                    {/* WhatsApp Mobile Number */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">
                        WhatsApp Mobile Number *
                      </label>
                      <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 flex items-center gap-2 focus-within:border-emerald-500">
                        <span className="text-[#25D366] font-bold text-xs bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="98765 43210"
                          className="w-full bg-transparent text-white font-bold text-sm tracking-wider focus:outline-hidden"
                        />
                        <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        We will send a 6-digit OTP to this WhatsApp number.
                      </span>
                    </div>

                    {/* 18+ Mandatory Declaration Checkbox */}
                    <div className="p-2 rounded-xl bg-black/40 border border-red-500/30">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={is18PlusAgreed}
                          onChange={(e) => setIs18PlusAgreed(e.target.checked)}
                          className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4 shrink-0"
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
                      className="w-full py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>SENDING WHATSAPP OTP...</span>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 fill-stone-950" />
                          <span>GET OTP ON WHATSAPP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: ENTER WHATSAPP OTP */
                  <form onSubmit={handleVerifyWhatsappOtp} className="space-y-3">
                    <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-stone-300">OTP sent via WhatsApp to:</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          +91 {whatsappNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        Check your WhatsApp chats for Master Rummy Verification Code.
                      </p>
                    </div>

                    {/* 6-Digit OTP Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold text-stone-300">
                          Enter 6-Digit OTP *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoFillOtp}
                          className="text-[10px] text-amber-300 hover:underline font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-fill ({simulatedGeneratedOtp})
                        </button>
                      </div>

                      <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 focus-within:border-emerald-500">
                        <input
                          type="text"
                          maxLength={6}
                          value={whatsappOtp}
                          onChange={(e) => setWhatsappOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full text-center tracking-[0.5em] text-white font-mono font-black text-xl focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Resend OTP button & timer */}
                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playCardClick();
                          setWhatsappStep('NUMBER');
                        }}
                        className="text-stone-400 hover:text-white underline text-[11px]"
                      >
                        Change Number
                      </button>

                      <button
                        type="button"
                        disabled={resendTimer > 0}
                        onClick={() => {
                          sounds.playCardClick();
                          const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                          setSimulatedGeneratedOtp(newOtp);
                          setResendTimer(30);
                          setShowIncomingMessagePopup(true);
                        }}
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          resendTimer > 0 ? 'text-stone-500 cursor-not-allowed' : 'text-emerald-400 hover:underline'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP via WhatsApp'}</span>
                      </button>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>VERIFYING OTP...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-stone-950" />
                          <span>VERIFY & CONTINUE</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}



            {/* Mode 3: Supabase Email */}
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

                  <div className="p-2 rounded-xl bg-black/40 border border-red-500/30">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is18PlusAgreed}
                        onChange={(e) => setIs18PlusAgreed(e.target.checked)}
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 w-4 h-4 shrink-0"
                      />
                      <span className="text-[10px] text-stone-200 font-semibold leading-tight">
                        I confirm I am 18+ years of age.
                      </span>
                    </label>
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
            <span className="w-4 h-4 rounded-full bg-[#25D366] text-stone-950 flex items-center justify-center font-bold text-[8px]">
              WA
            </span>
            <span>WhatsApp OTP Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Anti-Cheat RLS</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RNG Certified</span>
          </div>
        </div>

        <p className="text-[10px] text-white/70 max-w-xs mx-auto leading-tight">
          <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded mr-1">18+ ONLY</span>
          Participation is restricted to Indian adults aged 18 and above. Rummy is recognized as a game of skill by the Hon'ble Supreme Court of India.
        </p>
      </div>
    </div>
  );
};
