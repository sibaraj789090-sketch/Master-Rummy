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
} from 'lucide-react';
import { sounds } from '../../utils/sound';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallet: () => void;
  onOpenWithdrawal: () => void;
  onOpenTransactions: () => void;
  onOpenSupport: () => void;
  onOpenLogin: () => void;
  onOpenInstall?: () => void;
  onOpenLoadingScreen?: () => void;
  onOpenSupabaseSetup?: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  onOpenWallet,
  onOpenWithdrawal,
  onOpenTransactions,
  onOpenSupport,
  onOpenLogin,
  onOpenInstall,
  onOpenLoadingScreen,
  onOpenSupabaseSetup,
}) => {
  const { currentUser, setActiveScreen, soundEnabled, setSoundEnabled } = useRummy();

  const [walletExpanded, setWalletExpanded] = useState(true);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [policiesExpanded, setPoliciesExpanded] = useState(false);
  const [discoverExpanded, setDiscoverExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const [bgMusic, setBgMusic] = useState(true);
  const [vibration, setVibration] = useState(true);

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
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wide">{currentUser.username}</h3>
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
        {onOpenInstall && (
          <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-b border-amber-500/30">
            <button
              onClick={() => {
                sounds.playCoinSound();
                onClose();
                onOpenInstall();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs py-2.5 px-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-stone-950 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="leading-tight text-xs font-black">DOWNLOAD APP</p>
                  <p className="text-[10px] text-stone-900 font-semibold leading-tight">Install on your phone</p>
                </div>
              </div>
              <span className="bg-stone-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                FREE
              </span>
            </button>
          </div>
        )}

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
                    setActiveScreen('CHALLENGER');
                  }}
                  className="w-full py-1.5 flex items-center justify-between hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-red-400" />
                    <span>₹2.2 Crore Challenger</span>
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
    </div>
  );
};
