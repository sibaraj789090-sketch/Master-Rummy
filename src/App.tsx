import React, { useState } from 'react';
import { RummyProvider, useRummy } from './context/RummyContext';
import { TopHeader } from './components/mobile/TopHeader';
import { BottomNav } from './components/mobile/BottomNav';
import { LobbyView } from './components/mobile/LobbyView';
import { TournamentsView } from './components/mobile/TournamentsView';
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
import { DocumentsVerificationModal } from './components/mobile/DocumentsVerificationModal';
import { RummyTable } from './components/game/RummyTable';
import { AdminPanel } from './components/admin/AdminPanel';
import { sounds } from './utils/sound';

const MainApp: React.FC = () => {
  const { activeScreen, setActiveScreen, activeGameConfig } = useRummy();

  // Root view: 'PLAYER' or 'ADMIN'
  const [viewMode, setViewMode] = useState<'PLAYER' | 'ADMIN'>('PLAYER');

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
  const [isDocumentsVerificationOpen, setIsDocumentsVerificationOpen] = useState(false);

  // If in Admin Mode, show Admin Panel
  if (viewMode === 'ADMIN') {
    return <AdminPanel onSwitchToPlayer={() => setViewMode('PLAYER')} />;
  }

  // If game is active
  if (activeScreen === 'GAME_TABLE' && activeGameConfig) {
    return <RummyTable />;
  }

  return (
    <div className="w-full min-h-[100dvh] h-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-500 selection:text-black flex flex-col overflow-x-hidden relative">
      {/* Immersive Mobile-First Container with responsive max-width on larger viewports */}
      <div className="w-full flex-1 flex flex-col mx-auto max-w-md md:max-w-lg lg:max-w-xl h-full min-h-[100dvh] bg-[#f8fafc] shadow-2xl relative overflow-hidden">
        {/* Top Header with Avatar, Practice Balance Dropdown & Refill */}
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
                setActiveScreen('TOURNAMENTS');
              }}
              onOpenInstall={() => setIsInstallOpen(true)}
            />
          )}

          {(activeScreen === 'TOURNAMENTS' || activeScreen === 'CHALLENGER') && <TournamentsView />}

          {activeScreen === 'REFER_EARN' && <ReferEarnView />}
        </div>

        {/* Bottom Navigation with 3-Line Menu */}
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
          onOpenAdmin={() => setViewMode('ADMIN')}
          onOpenInstall={() => setIsInstallOpen(true)}
          onOpenLoadingScreen={() => setIsLoadingScreen(true)}
          onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
          onOpenDocumentsVerification={() => setIsDocumentsVerificationOpen(true)}
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
          onOpenDocumentsVerification={() => setIsDocumentsVerificationOpen(true)}
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
          onOpenDocumentsVerification={() => setIsDocumentsVerificationOpen(true)}
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
          onOpenDocumentsVerification={() => setIsDocumentsVerificationOpen(true)}
        />

        <InstallAppModal
          isOpen={isInstallOpen}
          onClose={() => setIsInstallOpen(false)}
        />

        <SupabaseSetupModal
          isOpen={isSupabaseSetupOpen}
          onClose={() => setIsSupabaseSetupOpen(false)}
        />

        <DocumentsVerificationModal
          isOpen={isDocumentsVerificationOpen}
          onClose={() => setIsDocumentsVerificationOpen(false)}
          onOpenSupport={() => setIsSupportOpen(true)}
        />
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
