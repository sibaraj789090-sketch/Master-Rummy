import React, { useState } from 'react';
import { RummyProvider, useRummy } from './context/RummyContext';
import { TopHeader } from './components/mobile/TopHeader';
import { BottomNav } from './components/mobile/BottomNav';
import { LobbyView } from './components/mobile/LobbyView';
import { TournamentsView } from './components/mobile/TournamentsView';
import { ChallengerView } from './components/mobile/ChallengerView';
import { ReferEarnView } from './components/mobile/ReferEarnView';
import { DrawerMenu } from './components/mobile/DrawerMenu';
import { AddCashModal } from './components/mobile/AddCashModal';
import { WithdrawalModal } from './components/mobile/WithdrawalModal';
import { MyWalletModal } from './components/mobile/MyWalletModal';
import { TransactionsModal } from './components/mobile/TransactionsModal';
import { HelpSupportModal } from './components/mobile/HelpSupportModal';
import { NotificationsModal } from './components/mobile/NotificationsModal';
import { LoginModal } from './components/mobile/LoginModal';
import { InstallAppModal } from './components/mobile/InstallAppModal';
import { AppLoadingScreen } from './components/mobile/AppLoadingScreen';
import { SupabaseSetupModal } from './components/mobile/SupabaseSetupModal';
import { RummyTable } from './components/game/RummyTable';
import { AdminPanel } from './components/admin/AdminPanel';
import { Smartphone, Shield, Monitor, Sparkles, RefreshCw, Download, Database } from 'lucide-react';
import { sounds } from './utils/sound';

const MainApp: React.FC = () => {
  const { activeScreen, setActiveScreen, activeGameConfig } = useRummy();

  // Root view: 'PLAYER' or 'ADMIN'
  const [viewMode, setViewMode] = useState<'PLAYER' | 'ADMIN'>('PLAYER');

  // Mobile Device Mockup Frame toggle (for desktop viewing)
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);

  // App opening loading page splash screen state
  const [isLoadingScreen, setIsLoadingScreen] = useState<boolean>(true);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isAddCashOpen, setIsAddCashOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);

  // If in Admin Mode, show Admin Panel
  if (viewMode === 'ADMIN') {
    return <AdminPanel onSwitchToPlayer={() => setViewMode('PLAYER')} />;
  }

  // If game is active
  if (activeScreen === 'GAME_TABLE' && activeGameConfig) {
    return <RummyTable />;
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-between items-center text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Desktop Top Control Strip (Easy Switcher for user and evaluation) */}
      <div className="w-full bg-stone-900/90 border-b border-stone-800 px-4 py-2 flex items-center justify-between text-xs z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>MASTER RUMMY</span>
          </div>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-stone-400 hidden sm:inline text-[11px]">
            Points, Pool, Deals, Tournaments, Refer & Earn, Wallet & Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Supabase Multiplayer Database Setup */}
          <button
            onClick={() => {
              sounds.playCardClick();
              setIsSupabaseSetupOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold shadow-sm transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>⚡ Supabase Setup</span>
          </button>

          {/* Install App Desktop Button */}
          <button
            onClick={() => {
              sounds.playCoinSound();
              setIsInstallOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

          {/* Frame Toggle */}
          <button
            onClick={() => {
              sounds.playCardClick();
              setDeviceFrame(!deviceFrame);
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold border border-stone-700 transition-colors"
          >
            {deviceFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{deviceFrame ? 'Full Width' : 'Mobile Frame'}</span>
          </button>

          {/* App Loading Page Replay Button */}
          <button
            onClick={() => {
              sounds.playCardClick();
              setIsLoadingScreen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>App Loading Page</span>
          </button>

          {/* Switch to Admin Suite Button */}
          <button
            onClick={() => {
              sounds.playCoinSound();
              setViewMode('ADMIN');
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-[11px] px-3 py-1 rounded-lg shadow-md active:scale-95 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>⚡ ADMIN PANEL</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame or Full Viewport */}
      <div className="flex-1 w-full flex items-center justify-center py-0 md:py-4 overflow-hidden">
        <div
          className={`w-full h-full flex flex-col bg-[#f8fafc] text-slate-800 overflow-hidden relative shadow-2xl transition-all ${
            deviceFrame
              ? 'max-w-[420px] md:h-[844px] md:rounded-[40px] md:border-[10px] md:border-stone-800 md:ring-1 md:ring-stone-700'
              : 'max-w-2xl h-full'
          }`}
        >
          {/* Simulated Mobile Status Bar on Desktop */}
          <div className="bg-[#59040c] text-white px-5 pt-1.5 pb-0.5 flex items-center justify-between text-[11px] font-bold select-none shrink-0 border-b border-red-950/20">
            <span>05:08</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>4G</span>
              <span>📶</span>
              <span>🔋 92%</span>
            </div>
          </div>

          {/* Top Header with Avatar, Balances, Add Cash */}
          <TopHeader
            onOpenProfile={() => setIsWalletOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenInstall={() => setIsInstallOpen(true)}
            onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
          />

          {/* Active Screen Content */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {activeScreen === 'LOBBY' && (
              <LobbyView
                onOpenAddCash={() => setIsAddCashOpen(true)}
                onOpenTournaments={() => {
                  sounds.playCardClick();
                  setActiveScreen('CHALLENGER');
                }}
                onOpenInstall={() => setIsInstallOpen(true)}
              />
            )}

            {activeScreen === 'CHALLENGER' && <ChallengerView />}

            {activeScreen === 'REFER_EARN' && <ReferEarnView />}
          </div>

          {/* Bottom Navigation */}
          <BottomNav onOpenMenu={() => setIsDrawerOpen(true)} />

          {/* Modals & Drawers */}
          <DrawerMenu
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
            onOpenTransactions={() => setIsTransactionsOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenInstall={() => setIsInstallOpen(true)}
            onOpenLoadingScreen={() => setIsLoadingScreen(true)}
          />

          <AddCashModal
            isOpen={isAddCashOpen || activeScreen === 'ADD_CASH'}
            onClose={() => {
              setIsAddCashOpen(false);
              if (activeScreen === 'ADD_CASH') setActiveScreen('LOBBY');
            }}
            onOpenSupport={() => setIsSupportOpen(true)}
          />

          <WithdrawalModal
            isOpen={isWithdrawalOpen || activeScreen === 'WITHDRAW'}
            onClose={() => {
              setIsWithdrawalOpen(false);
              if (activeScreen === 'WITHDRAW') setActiveScreen('LOBBY');
            }}
            onOpenSupport={() => setIsSupportOpen(true)}
          />

          <MyWalletModal
            isOpen={isWalletOpen || activeScreen === 'WALLET'}
            onClose={() => {
              setIsWalletOpen(false);
              if (activeScreen === 'WALLET') setActiveScreen('LOBBY');
            }}
            onOpenAddCash={() => setIsAddCashOpen(true)}
            onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
            onOpenTransactions={() => setIsTransactionsOpen(true)}
          />

          <TransactionsModal
            isOpen={isTransactionsOpen}
            onClose={() => setIsTransactionsOpen(false)}
          />

          <HelpSupportModal
            isOpen={isSupportOpen}
            onClose={() => setIsSupportOpen(false)}
          />

          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />

          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
          />

          <InstallAppModal
            isOpen={isInstallOpen}
            onClose={() => setIsInstallOpen(false)}
          />

          <SupabaseSetupModal
            isOpen={isSupabaseSetupOpen}
            onClose={() => setIsSupabaseSetupOpen(false)}
          />
        </div>
      </div>

      {/* App Opening Loading Screen Splash (Shows on first launch & on replay) */}
      {isLoadingScreen && (
        <AppLoadingScreen onComplete={() => setIsLoadingScreen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <RummyProvider>
      <MainApp />
    </RummyProvider>
  );
}
