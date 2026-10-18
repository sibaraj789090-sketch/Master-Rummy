import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { Bell, ChevronDown, Plus, Sparkles, X, Download, Database, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { getSupabaseConfig } from '../../lib/supabase';

interface TopHeaderProps {
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenInstall?: () => void;
  onOpenSupabaseSetup?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenProfile,
  onOpenNotifications,
  onOpenInstall,
  onOpenSupabaseSetup,
}) => {
  const { currentUser, setActiveScreen, notificationBadgeCount, unreadBroadcast, dismissBroadcast } = useRummy();
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);

  return (
    <div className="relative z-30">
      {/* Floating Broadcast alert if an urgent admin broadcast is received */}
      {unreadBroadcast && (
        <div className="absolute top-full left-2 right-2 mt-1 z-50 bg-gradient-to-r from-amber-600 to-amber-700 text-amber-950 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-semibold shadow-xl border border-amber-400/40">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-950 animate-spin" />
            <span className="truncate">{unreadBroadcast}</span>
          </div>
          <button
            onClick={() => {
              sounds.playCardClick();
              dismissBroadcast();
            }}
            className="p-1 hover:bg-black/10 rounded ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Bar with Safe Area Inset support for Android/iOS */}
      <div className="bg-[#59040c] text-white px-3 pt-[max(env(safe-area-inset-top,0px),0.5rem)] pb-2 flex items-center justify-between shadow-md border-b border-red-950/40 select-none">
        {/* Left: User Avatar & Username */}
        <div
          onClick={() => {
            sounds.playCardClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full border-2 border-amber-400 overflow-hidden bg-stone-900 shadow-inner flex items-center justify-center">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-black text-amber-400 text-sm">MR</span>
              )}
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#59040c]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold tracking-tight text-white/95 truncate max-w-[75px]">
                {currentUser.username}
              </span>
              <span className="bg-red-700 text-white font-black text-[8px] px-1 py-0.2 rounded shrink-0">
                18+
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-amber-300 font-medium">
              <span>{currentUser.isKycVerified ? 'KYC Verified' : 'Online'}</span>
            </div>
          </div>
        </div>

        {/* Center: Real Money Cash Wallet Balance */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playCardClick();
              setShowBalanceDropdown(!showBalanceDropdown);
            }}
            className="flex items-center gap-1.5 bg-black/40 hover:bg-black/50 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 transition-colors shadow-inner"
          >
            <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-[10px]">
              ₹
            </span>
            <span className="tabular-nums font-black text-amber-200">
              {(currentUser.depositBalance + currentUser.withdrawalBalance).toFixed(2)}
            </span>
            <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${showBalanceDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Real Cash breakdown popup */}
          {showBalanceDropdown && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-stone-900/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-2xl z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-stone-800 text-stone-400 text-[11px]">
                <span className="font-bold text-white uppercase tracking-wider">Real Cash Wallet</span>
                <span className="text-emerald-400 font-bold">100% Real Money</span>
              </div>
              <div className="space-y-1.5 py-2 text-[11px]">
                <div className="flex justify-between text-stone-300">
                  <span>Deposit Cash:</span>
                  <span className="font-bold text-white font-mono">₹{currentUser.depositBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Winnings (Withdrawable):</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{currentUser.withdrawalBalance.toFixed(2)}</span>
                </div>
                {currentUser.bonusBalance > 0 && (
                  <div className="flex justify-between text-stone-300">
                    <span>Bonus Cash:</span>
                    <span className="font-bold text-amber-300 font-mono">₹{currentUser.bonusBalance.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-amber-300 pt-1.5 border-t border-stone-800">
                  <span>Total Real Balance:</span>
                  <span className="font-mono">₹{(currentUser.depositBalance + currentUser.withdrawalBalance).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    sounds.playCoinSound();
                    setShowBalanceDropdown(false);
                    setActiveScreen('ADD_CASH');
                  }}
                  className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold rounded-lg text-center text-[10px] shadow-sm uppercase tracking-wider"
                >
                  + Add Cash
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setShowBalanceDropdown(false);
                    setActiveScreen('WITHDRAW');
                  }}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 font-extrabold rounded-lg text-center text-[10px] border border-stone-700 uppercase tracking-wider"
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: + ADD CASH Button + Supabase status button + App download */}
        <div className="flex items-center gap-1.5">
          {/* Quick ADD CASH Button */}
          <button
            onClick={() => {
              sounds.playCoinSound();
              setActiveScreen('ADD_CASH');
            }}
            title="Add Cash to Wallet"
            className="flex items-center gap-1 bg-gradient-to-b from-[#16a34a] to-[#15803d] hover:from-[#22c55e] hover:to-[#16a34a] text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-md border border-emerald-400/50 active:scale-95 transition-transform"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>ADD CASH</span>
          </button>



          {/* Install / Download App Button */}
          {onOpenInstall && (
            <button
              onClick={() => {
                sounds.playCoinSound();
                onOpenInstall();
              }}
              title="Download & Install App"
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-amber-950 px-2 py-1 rounded-full text-[10px] font-black shadow-sm transition-transform active:scale-95"
            >
              <Download className="w-3 h-3 stroke-[3]" />
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => {
              sounds.playCardClick();
              onOpenNotifications();
            }}
            className="relative p-1.5 rounded-full bg-black/25 hover:bg-black/40 text-amber-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notificationBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#59040c]">
                {notificationBadgeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
