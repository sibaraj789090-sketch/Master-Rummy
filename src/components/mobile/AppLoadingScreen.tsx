import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/sound';
import { ShieldCheck, Lock, Award, Wifi, Sparkles, ChevronRight } from 'lucide-react';

interface AppLoadingScreenProps {
  onComplete: () => void;
  canSkip?: boolean;
}

const LOADING_STAGES = [
  { threshold: 15, text: 'Initializing Rummy Engine & High-Res Textures...' },
  { threshold: 35, text: 'Verifying iTech Labs Fair Play RNG Certificate...' },
  { threshold: 60, text: 'Connecting to Indian Real-Time Servers (Mumbai)...' },
  { threshold: 82, text: 'Syncing Cash Tables, Tournaments & Wallets...' },
  { threshold: 96, text: 'Applying Daily Login Bonus & Deals...' },
  { threshold: 100, text: 'Loaded 100%! Welcome to Master Rummy...' },
];

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete, canSkip = true }) => {
  const [progress, setProgress] = useState(0);
  const [currentStageText, setCurrentStageText] = useState('Initializing Master Rummy...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Smooth dynamic increment
      const step = Math.floor(Math.random() * 4) + 2;
      current = Math.min(100, current + step);
      setProgress(current);

      // Find matching stage text
      const matchedStage = LOADING_STAGES.find((s) => current <= s.threshold);
      if (matchedStage) {
        setCurrentStageText(matchedStage.text);
      }

      if (current >= 100) {
        clearInterval(interval);
        // Play intro startup chime
        sounds.playAppStartupSound();
        // Fade out
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 450);
        }, 350);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    sounds.playCardClick();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center select-none overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 35%, #690a14 0%, #40040a 55%, #1f0104 100%)',
      }}
    >
      {/* Decorative Floating Card Suits Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        <span className="absolute top-[12%] left-[10%] text-6xl text-amber-300 animate-pulse">♠</span>
        <span className="absolute top-[22%] right-[14%] text-7xl text-red-400 animate-pulse">♥</span>
        <span className="absolute bottom-[28%] left-[15%] text-7xl text-red-400 animate-pulse">♦</span>
        <span className="absolute bottom-[20%] right-[12%] text-6xl text-amber-300 animate-pulse">♣</span>
        <span className="absolute top-[48%] left-[6%] text-4xl text-amber-200">★</span>
        <span className="absolute top-[40%] right-[8%] text-5xl text-amber-200">★</span>
        {/* Shimmering diagonal light sweep */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-amber-400/5 to-transparent rotate-45 animate-pulse" />
      </div>

      {/* Top Header Row with Skip & Ping */}
      <div className="w-full max-w-md px-6 pt-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-[10px] text-amber-200/90 font-mono">
          <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Mumbai 01</span>
          <span className="text-stone-500">•</span>
          <span className="text-emerald-400 font-bold">18ms</span>
        </div>

        {canSkip && (
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 bg-black/40 hover:bg-black/60 text-amber-300 hover:text-white px-3 py-1 rounded-full border border-amber-500/30 text-[11px] font-bold backdrop-blur-md transition-all active:scale-95"
          >
            <span>Skip</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Center Branding Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 text-center z-10 max-w-sm">
        {/* Animated 3D Casino Emblem */}
        <div className="relative mb-6">
          {/* Radiant Halo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-red-500/30 rounded-full blur-xl animate-pulse" />

          {/* Cards Fan + Crown Badge */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Card 1 (Left - King of Hearts) */}
            <div className="absolute -left-2 top-2 w-14 h-20 bg-white rounded-lg shadow-2xl border border-slate-300 -rotate-12 transform flex flex-col justify-between p-1 text-[10px] text-red-600 font-black">
              <span>K ♥</span>
              <span className="self-center text-xl">♥</span>
              <span className="self-end rotate-180">K ♥</span>
            </div>

            {/* Card 2 (Right - Ace of Spades) */}
            <div className="absolute -right-2 top-2 w-14 h-20 bg-white rounded-lg shadow-2xl border border-slate-300 rotate-12 transform flex flex-col justify-between p-1 text-[10px] text-slate-900 font-black">
              <span>A ♠</span>
              <span className="self-center text-xl">♠</span>
              <span className="self-end rotate-180">A ♠</span>
            </div>

            {/* Center Golden Medallion */}
            <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-1 shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center text-center">
              <span className="text-2xl filter drop-shadow">👑</span>
              <span className="text-[9px] font-black tracking-tighter text-amber-950 uppercase mt-0.5">
                MASTER
              </span>
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Official Real Cash Game</span>
          </div>

          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
            MASTER RUMMY
          </h1>

          <p className="text-xs text-amber-200/90 font-medium tracking-wide">
            India's Most Trusted 13-Card Rummy Platform
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress & Badges */}
      <div className="w-full max-w-md px-6 pb-8 space-y-5 z-10">
        {/* Progress Container */}
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20 shadow-xl space-y-2">
          {/* Status text + Percentage */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-200/90 font-semibold truncate pr-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              {currentStageText}
            </span>
            <span className="text-amber-400 font-black font-mono text-sm shrink-0">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-3 bg-stone-900/90 rounded-full overflow-hidden p-0.5 border border-amber-600/40 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-150 relative shadow-[0_0_12px_rgba(250,204,21,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Glossy overlay on the bar */}
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
            <span>Loading Core Assets</span>
            <span>Version 2.4.9 (Android)</span>
          </div>
        </div>

        {/* Security & Legal Trust Strip */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-stone-800 flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-stone-200">100% Legal</span>
            <span className="text-[8px] text-stone-400">Supreme Court Approved</span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-stone-800 flex flex-col items-center gap-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-stone-200">RNG Certified</span>
            <span className="text-[8px] text-stone-400">Fair Play Tested</span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-stone-800 flex flex-col items-center gap-1">
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-stone-200">256-Bit SSL</span>
            <span className="text-[8px] text-stone-400">Instant UPI Payouts</span>
          </div>
        </div>

        {/* Responsible Gaming Notice */}
        <div className="text-center text-[9px] text-amber-200/60 font-medium">
          Strictly 18+ Only · Play Responsibly · Certified Indian Rummy
        </div>
      </div>
    </div>
  );
};
