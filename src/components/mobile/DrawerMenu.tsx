import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  ChevronRight,
  ChevronDown,
  Headphones,
  CreditCard,
  Wallet,
  ReceiptText,
  Volume2,
  Music,
  Smartphone,
  LogOut,
  X,
  ShieldCheck,
  HelpCircle,
  Compass,
  PlayCircle,
  Sparkles,
  Database,
  Shield,
  Lock,
  KeyRound,
  Trophy,
  Download,
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import { verifyAdminCredentials } from '../../lib/supabase';
import { downloadHostedApk } from '../../utils/apkDownloader';
import { usePWAInstall } from '../../utils/usePWAInstall';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallet: () => void;
  onOpenWithdrawal: () => void;
  onOpenTransactions: () => void;
  onOpenSupport: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  onOpenInstall?: () => void;
  onOpenLoadingScreen?: () => void;
  onOpenSupabaseSetup?: () => void;
  onOpenDocumentsVerification?: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  onOpenWallet,
  onOpenWithdrawal,
  onOpenTransactions,
  onOpenSupport,
  onOpenLogin,
  onOpenAdmin,
  onOpenInstall,
  onOpenLoadingScreen,
  onOpenSupabaseSetup,
  onOpenDocumentsVerification,
}) => {
  const { currentUser, setActiveScreen, soundEnabled, setSoundEnabled, isAdmin, checkAdminPermissions, adminSettings } = useRummy();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isDownloading, setIsDownloading] = useState(false);

  const [walletExpanded, setWalletExpanded] = useState(true);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [policiesExpanded, setPoliciesExpanded] = useState(false);
  const [discoverExpanded, setDiscoverExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const [bgMusic, setBgMusic] = useState(true);
  const [vibration, setVibration] = useState(true);

  // Admin verification modal state
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState(currentUser.email || 'ranidas784170@gmail.com');
  const [adminKey, setAdminKey] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => {
          sounds.playCardClick();
          onClose();
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-[320px] bg-stone-900 text-stone-200 h-full overflow-y-auto no-scrollbar shadow-2xl z-10 flex flex-col border-l border-stone-800">
        {/* Top Profile Header (Crimson Maroon Gradient) */}
        <div className="bg-gradient-to-b from-[#6b0b14] to-[#45050b] p-4 text-white relative">
          <button
            onClick={() => {
              sounds.playCardClick();
              onClose();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mt-1">
            <div className="w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden bg-stone-950 shadow-md">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white tracking-wide truncate">{currentUser.username}</h3>
                <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded-sm shrink-0">
                  18+
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {currentUser.whatsappNumber && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> WhatsApp
                  </span>
                )}
                <span className="text-[10px] text-stone-300">
                  {currentUser.isKycVerified ? 'KYC Verified' : 'KYC Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30 text-xs">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-[10px]">
                    ₹
                  </span>
                  <span className="font-bold text-amber-300">
                    {(currentUser.depositBalance + currentUser.withdrawalBalance).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playCoinSound();
                    onClose();
                    setActiveScreen('ADD_CASH');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Download & Install App Banner Card */}
        <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-b border-amber-500/30 space-y-2">
          {/* Direct APK Download Button */}
          <a
            href={adminSettings.customApkUrl || '/downloads/MasterRummy.apk'}
            download="MasterRummy.apk"
            onClick={() => {
              sounds.playCoinSound();
              setIsDownloading(true);
              downloadHostedApk(
                adminSettings.customApkUrl || '/downloads/MasterRummy.apk',
                'MasterRummy.apk',
                undefined,
                () => setTimeout(() => setIsDownloading(false), 2500)
              );
            }}
            className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-between cursor-pointer border border-emerald-400/40"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center">
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-yellow-300' : ''}`} />
              </div>
              <div className="text-left">
                <p className="leading-tight text-xs font-black">DOWNLOAD ANDROID APK</p>
                <p className="text-[10px] text-emerald-100 font-semibold leading-tight">
                  {isDownloading ? 'Downloading MasterRummy.apk...' : 'Direct Hosted File · 18.4 MB'}
                </p>
              </div>
            </div>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-black">
              APK
            </span>
          </a>

          {/* Quick PWA Install & Guide row */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {!isInstalled && (
              <button
                onClick={async () => {
                  sounds.playCoinSound();
                  if (isInstallable) {
                    await install();
                  } else if (onOpenInstall) {
                    onOpenInstall();
                  }
                }}
                className="flex-1 py-1.5 px-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 text-[11px] font-bold rounded-lg border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>{isInstallable ? 'Install PWA (1-Click)' : 'Install App'}</span>
              </button>
            )}

            {onOpenInstall && (
              <button
                onClick={() => {
                  sounds.playCardClick();
                  onClose();
                  onOpenInstall();
                }}
                className="py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] font-bold rounded-lg border border-stone-700 flex items-center justify-center gap-1 transition-colors"
                title="Installation instructions & APK build details"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Guide</span>
              </button>
            )}
          </div>
        </div>

        {/* Menu Sections List */}
        <div className="flex-1 divide-y divide-stone-800 text-xs">
          {/* Section 1: Wallet and withdrawals */}
          <div className="py-2">
            <button
              onClick={() => setWalletExpanded(!walletExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-stone-100 hover:bg-stone-800/50"
            >
              <div>
                <p className="text-sm font-semibold text-white">Wallet and withdrawals</p>
                <p className="text-[11px] font-normal text-stone-400">Manage your transactions</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${walletExpanded ? 'rotate-180' : ''}`} />
            </button>

            {walletExpanded && (
              <div className="px-4 py-1 space-y-1">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenWithdrawal();
                  }}
                  className="w-full py-2 flex items-center justify-between text-stone-300 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Withdrawals</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>

                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenWallet();
                  }}
                  className="w-full py-2 flex items-center justify-between text-stone-300 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>My wallet</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>

                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenTransactions();
                  }}
                  className="w-full py-2 flex items-center justify-between text-stone-300 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <ReceiptText className="w-4 h-4 text-cyan-400" />
                    <span>Transactions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>

                {/* 18+ Documents & KYC Verification Option */}
                {onOpenDocumentsVerification && (
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      onClose();
                      onOpenDocumentsVerification();
                    }}
                    className="w-full py-2 flex items-center justify-between text-stone-200 hover:text-white bg-amber-500/10 px-2 rounded-lg border border-amber-500/30 my-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded">18+</span>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-amber-300 text-xs">KYC Documents (Aadhaar/PAN)</span>
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                      currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                    }`}>
                      {currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED'
                        ? 'VERIFIED'
                        : 'PENDING'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Help */}
          <div className="py-2">
            <button
              onClick={() => setHelpExpanded(!helpExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-stone-800/50"
            >
              <div>
                <p className="text-sm font-semibold text-white">Help</p>
                <p className="text-[11px] font-normal text-stone-400">Reach us for support</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${helpExpanded ? 'rotate-180' : ''}`} />
            </button>

            {helpExpanded && (
              <div className="px-4 py-1 space-y-2 text-stone-300">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenSupport();
                  }}
                  className="w-full py-1.5 flex items-center justify-between hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-amber-400" />
                    <span>24x7 Customer Live Chat</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    alert('How to play Indian Rummy: Make 2 sequences (1 pure, 1 impure/pure) + sets. Aces can be high or low.');
                  }}
                  className="w-full py-1.5 flex items-center justify-between hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Rummy Rules & Tutorial</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Policies */}
          <div className="py-2">
            <button
              onClick={() => setPoliciesExpanded(!policiesExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-stone-800/50"
            >
              <div>
                <p className="text-sm font-semibold text-white">Policies</p>
                <p className="text-[11px] font-normal text-stone-400">Play responsibly & Learn about Policies</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${policiesExpanded ? 'rotate-180' : ''}`} />
            </button>

            {policiesExpanded && (
              <div className="px-4 py-1 space-y-2 text-stone-300">
                <div className="flex items-center gap-2 py-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>RNG Certified Fair Play</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>No Bots Certified (100% Real Players)</span>
                </div>
                <div className="text-[11px] text-stone-400 leading-relaxed pt-1">
                  Players under 18 years of age are not allowed. Play responsibly. Financial risks involved.
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Discover */}
          <div className="py-2">
            <button
              onClick={() => setDiscoverExpanded(!discoverExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-stone-800/50"
            >
              <div>
                <p className="text-sm font-semibold text-white">Discover</p>
                <p className="text-[11px] font-normal text-stone-400">Do more on Master Rummy</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${discoverExpanded ? 'rotate-180' : ''}`} />
            </button>

            {discoverExpanded && (
              <div className="px-4 py-1 space-y-2 text-stone-300">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    setActiveScreen('REFER_EARN');
                  }}
                  className="w-full py-1.5 flex items-center justify-between hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Refer & Earn ₹1,100 Cash</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    setActiveScreen('TOURNAMENTS');
                  }}
                  className="w-full py-1.5 flex items-center justify-between hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Real Cash Tournaments</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>
                {onOpenLoadingScreen && (
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      onClose();
                      onOpenLoadingScreen();
                    }}
                    className="w-full py-1.5 flex items-center justify-between text-amber-300 hover:text-amber-200"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>App Opening Loading Page</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      Replay
                    </span>
                  </button>
                )}
                {onOpenSupabaseSetup && (
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      onClose();
                      onOpenSupabaseSetup();
                    }}
                    className="w-full py-1.5 flex items-center justify-between text-emerald-300 hover:text-emerald-200"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Supabase Multiplayer DB</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      Backend
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Settings (from Screenshot 14) */}
          <div className="py-2">
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-stone-800/50"
            >
              <div>
                <p className="text-sm font-semibold text-white">Settings</p>
                <p className="text-[11px] font-normal text-stone-400">Sound & Log out</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${settingsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {settingsExpanded && (
              <div className="px-4 py-2 space-y-3">
                {/* Background Music Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Music className="w-4 h-4 text-stone-400" />
                    <span>Background Music</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setBgMusic(!bgMusic);
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                      bgMusic ? 'bg-emerald-600 justify-end' : 'bg-stone-700 justify-start'
                    }`}
                  >
                    <span className="text-[9px] font-black text-white px-1 mr-0.5">{bgMusic ? 'ON' : 'OFF'}</span>
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Volume2 className="w-4 h-4 text-stone-400" />
                    <span>Sound Effects</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setSoundEnabled(!soundEnabled);
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                      soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-stone-700 justify-start'
                    }`}
                  >
                    <span className="text-[9px] font-black text-white px-1 mr-0.5">{soundEnabled ? 'ON' : 'OFF'}</span>
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Vibration Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Smartphone className="w-4 h-4 text-stone-400" />
                    <span>Vibration</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setVibration(!vibration);
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                      vibration ? 'bg-emerald-600 justify-end' : 'bg-stone-700 justify-start'
                    }`}
                  >
                    <span className="text-[9px] font-black text-white px-1 mr-0.5">{vibration ? 'ON' : 'OFF'}</span>
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Log out */}
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenLogin();
                  }}
                  className="w-full pt-2 flex items-center justify-between text-rose-400 hover:text-rose-300"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Section 6: Admin Portal (Protected by Supabase & Real Admin Authentication) */}
          <div className="py-2.5 px-4 bg-stone-950/40 border-t border-stone-800">
            <button
              onClick={async () => {
                sounds.playCoinSound();
                const verified = await checkAdminPermissions();
                if (verified) {
                  onClose();
                  onOpenAdmin();
                } else {
                  setAdminAuthError(null);
                  setShowAdminLoginModal(true);
                }
              }}
              className="w-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 hover:from-amber-500/25 hover:to-yellow-500/15 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/40 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-amber-300">Admin Panel</span>
                    {isAdmin ? (
                      <span className="bg-emerald-500/25 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                        AUTHORIZED
                      </span>
                    ) : (
                      <span className="bg-stone-800 text-stone-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-stone-700">
                        SECURE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400">Operations, Users & Ledger</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer info (from Screenshot 2) */}
        <div className="p-4 bg-stone-950/70 border-t border-stone-800 text-center text-[11px] text-stone-400">
          <div
            onClick={() => {
              sounds.playCardClick();
              onClose();
              onOpenSupport();
            }}
            className="flex items-center justify-center gap-1.5 text-stone-300 font-semibold cursor-pointer hover:text-amber-400 mb-1"
          >
            <Headphones className="w-4 h-4 text-amber-400" />
            <span>24x7 Help & Supports</span>
          </div>
          <p className="text-stone-500 font-mono text-[10px]">V2.2.9 (22)</p>
        </div>
      </div>

      {/* Admin Authentication Verification Dialog */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
          <div className="bg-stone-900 border border-amber-500/40 text-white rounded-3xl p-5 max-w-xs w-full shadow-2xl relative">
            <button
              onClick={() => {
                sounds.playCardClick();
                setShowAdminLoginModal(false);
              }}
              className="absolute top-3.5 right-3.5 p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Admin Authentication</h3>
                <p className="text-[10px] text-amber-300 font-semibold">Master Rummy Management Console</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 mb-3 leading-relaxed">
              This area is restricted to authorized operations administrators. Verify your administrator credentials to proceed.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsVerifyingAdmin(true);
                setAdminAuthError(null);
                try {
                  const res = await verifyAdminCredentials(adminEmail, adminKey);
                  if (res.success) {
                    sounds.playWinFanfare();
                    await checkAdminPermissions();
                    setShowAdminLoginModal(false);
                    onClose();
                    onOpenAdmin();
                  } else {
                    setAdminAuthError(res.error || 'Authentication failed');
                  }
                } catch (err: any) {
                  setAdminAuthError(err.message || 'Verification error');
                } finally {
                  setIsVerifyingAdmin(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  Admin Security Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key (e.g. MasterAdmin@2026)"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-hidden focus:border-amber-400 font-mono"
                  required
                />
              </div>

              {adminAuthError && (
                <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-semibold">
                  {adminAuthError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingAdmin}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isVerifyingAdmin ? 'VERIFYING PERMISSIONS...' : 'UNLOCK & ACCESS ADMIN'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
