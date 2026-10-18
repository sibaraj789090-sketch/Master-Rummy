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
  const { currentUser, setActiveScreen, notificationBadgeCount, unreadBroadcast, dismissBroadcast, refillPracticeChips } = useRummy();
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
  const supabaseCfg = getSupabaseConfig();

  const practiceChipsDisplay = (currentUser.practiceChips || 10000).toLocaleString();

  return (
    <div className="relative z-30">
      {/* Broadcast alert bar if active */}
      {unreadBroadcast && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-amber-950 px-3 py-1.5 flex items-center justify-between text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-950 animate-spin" />
            <span className="truncate">{unreadBroadcast}</span>
          </div>
          <button
            onClick={() => {
              sounds.playCardClick();
              dismissBroadcast();
            }}
            className="p-0.5 hover:bg-black/10 rounded ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="bg-[#59040c] text-white px-3 py-2 flex items-center justify-between shadow-md border-b border-red-950/40">
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
            <span className="text-xs font-bold tracking-tight text-white/95 truncate max-w-[85px]">
              {currentUser.username}
            </span>
            <div className="flex items-center gap-1 text-[9px] text-amber-300 font-medium">
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Center: Practice Chips (Non-redeemable Free Chips) */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playCardClick();
              setShowBalanceDropdown(!showBalanceDropdown);
            }}
            className="flex items-center gap-1 bg-black/40 hover:bg-black/50 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 transition-colors"
          >
            <span className="text-xs">🪙</span>
            <span className="tabular-nums font-black text-amber-200">{practiceChipsDisplay}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showBalanceDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Balance breakdown popup */}
          {showBalanceDropdown && (
            <div className="absolute top-9 left-1/2 -translate-x-1/2 w-56 bg-stone-900/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 shadow-2xl z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-stone-800 text-stone-400 text-[11px]">
                <span className="font-bold text-white">Free Practice Points</span>
                <span className="text-emerald-400 font-bold">100% Free</span>
              </div>
              <div className="space-y-1 py-2 text-[11px] text-stone-300">
                <p className="text-[10px] text-stone-400 leading-tight">
                  Practice points have zero monetary value and are used for fair multiplayer gaming.
                </p>
                <div className="flex justify-between font-extrabold text-amber-300 pt-1">
                  <span>Available Chips:</span>
                  <span>🪙 {practiceChipsDisplay}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  refillPracticeChips();
                  setShowBalanceDropdown(false);
                }}
                className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold rounded-lg text-center text-[10px] shadow-sm flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Refill +10,000 Chips (Free)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Refill Button + Supabase status button + App download */}
        <div className="flex items-center gap-1.5">
          {/* Refill Free Chips Button */}
          <button
            onClick={() => refillPracticeChips()}
            title="Refill Free Practice Chips"
            className="flex items-center gap-1 bg-gradient-to-b from-[#14a34a] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white px-2 py-1 rounded-full text-[10px] font-black shadow-md border border-emerald-400/40 active:scale-95 transition-transform"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>REFILL</span>
          </button>

          {/* Supabase Multiplayer Indicator */}
          {onOpenSupabaseSetup && (
            <button
              onClick={() => {
                sounds.playCardClick();
                onOpenSupabaseSetup();
              }}
              title="Supabase Multiplayer Backend"
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black border transition-all ${
                supabaseCfg.isConfigured
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-300 animate-pulse'
              }`}
            >
              <Database className="w-3 h-3" />
              <span className="hidden xs:inline">
                {supabaseCfg.isConfigured ? 'Supabase' : 'Setup DB'}
              </span>
            </button>
          )}

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
