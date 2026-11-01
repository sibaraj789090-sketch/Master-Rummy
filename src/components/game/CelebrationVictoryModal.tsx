import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Sparkles, PartyPopper, ArrowRight, RotateCcw, Home, Award } from 'lucide-react';
import { triggerWinConfetti, triggerInteractivePopper, triggerCoinShower } from '../../utils/confetti';
import { sounds } from '../../utils/sound';

interface Props {
  title: string;
  winnerName: string;
  isPlayerWinner: boolean;
  prize: number;
  breakdown: Array<{ name: string; score: number; won: number; rank?: number }>;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const CelebrationVictoryModal: React.FC<Props> = ({
  title,
  winnerName,
  isPlayerWinner,
  prize,
  breakdown,
  onPlayAgain,
  onReturnToLobby,
}) => {
  // Animated prize counter: ramps from 0 to prize over 1.2s
  const [displayedPrize, setDisplayedPrize] = useState(0);
  const [poppersCount, setPoppersCount] = useState(0);

  useEffect(() => {
    // Initial celebration blast
    triggerWinConfetti();
    sounds.playWinFanfare();
    sounds.playJackpotCascade();

    // Prize counter rollup
    if (prize > 0) {
      const startTime = performance.now();
      const duration = 1200; // ms

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedPrize(prize * eased);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setDisplayedPrize(prize);
          triggerCoinShower();
        }
      };

      requestAnimationFrame(updateCounter);
    }
  }, [prize]);

  const handleCelebrateMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPoppersCount((prev) => prev + 1);
    sounds.playCoinSound();
    triggerInteractivePopper(0.5, 0.45);
    triggerWinConfetti();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto selection:bg-amber-400 selection:text-black">
        {/* Rotating Sunburst Halo Background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25 overflow-hidden"
        >
          <div className="w-[850px] h-[850px] rounded-full bg-[conic-gradient(from_0deg,#ffd700,#ef4444,#10b981,#ffd700,#ef4444,#10b981,#ffd700)] blur-3xl opacity-30" />
        </motion.div>

        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Victory Card Container */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 24 }}
          className="relative max-w-sm sm:max-w-md w-full bg-gradient-to-b from-[#700b14] via-[#850d18] to-[#40040a] text-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.35)] flex flex-col items-center text-center overflow-hidden z-10"
        >
          {/* Top Banner Ribbon */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300 mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{title || 'TABLE CHAMPION'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          {/* Golden Trophy Hero with Bouncing Halo */}
          <div className="relative mb-3 flex items-center justify-center">
            {/* Animated Golden Halo Ring */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 blur-md pointer-events-none"
            />

            {/* Bouncing Trophy Badge */}
            <motion.button
              type="button"
              onClick={handleCelebrateMore}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title="Click to blast more celebration fireworks!"
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 text-stone-950 flex items-center justify-center shadow-2xl border-4 border-amber-200 cursor-pointer group"
            >
              {isPlayerWinner ? (
                <div className="relative flex items-center justify-center">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-stone-950 drop-shadow-md group-hover:rotate-12 transition-transform" />
                  <Crown className="w-6 h-6 text-amber-900 absolute -top-3 sm:-top-4 animate-bounce" />
                </div>
              ) : (
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-stone-950" />
              )}

              {/* Floating Sparkles Badge */}
              <span className="absolute -bottom-1 -right-1 bg-amber-950 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-400 shadow-sm">
                🎉
              </span>
            </motion.button>
          </div>

          {/* Victory Headline */}
          <div className="space-y-1 mb-4">
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.95, 1.03, 1] }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md"
            >
              {isPlayerWinner ? (
                <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent">
                  YOU WON! 🏆
                </span>
              ) : (
                <span>{winnerName} WON!</span>
              )}
            </motion.h2>
            <p className="text-xs text-amber-200/90 font-medium">
              {isPlayerWinner ? 'Magnificent show! All sequences and sets declared flawlessly.' : 'Better luck next hand! Keep sharpening your rummy strategy.'}
            </p>
          </div>

          {/* Golden Prize Display Counter */}
          {prize > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full bg-stone-950/70 border border-amber-400/50 rounded-2xl p-3 sm:p-4 mb-4 shadow-xl flex items-center justify-between"
            >
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Net Prize Winnings
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Directly credited to wallet
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                <span className="text-amber-400 text-lg">₹</span>
                <span>{displayedPrize.toFixed(2)}</span>
              </div>
            </motion.div>
          )}

          {/* Standings & Score Summary */}
          <div className="w-full bg-stone-950/60 rounded-2xl border border-stone-800 p-3 mb-4 text-left max-h-36 overflow-y-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Final Scores & Settlements
            </span>
            <div className="space-y-1.5 text-xs">
              {breakdown.map((b, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center py-1 px-2 rounded-lg ${
                    b.won > 0 ? 'bg-amber-500/15 border border-amber-500/30 font-bold text-amber-200' : 'text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    {b.won > 0 && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span className="truncate">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[11px] text-stone-400">{b.score} pts</span>
                    {b.won > 0 ? (
                      <span className="font-mono font-bold text-emerald-400 text-xs">+₹{b.won.toFixed(2)}</span>
                    ) : (
                      <span className="font-mono text-stone-500 text-xs">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Tap-to-Celebrate Popper Button */}
          <button
            type="button"
            onClick={handleCelebrateMore}
            className="w-full py-2 px-3 mb-4 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <PartyPopper className="w-4 h-4 text-amber-300" />
            <span>Tap to Celebrate! 🎉 {poppersCount > 0 ? `(${poppersCount})` : ''}</span>
          </button>

          {/* Action Buttons */}
          <div className="w-full flex gap-3 pt-1">
            <button
              onClick={() => {
                sounds.playCardClick();
                onPlayAgain();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              onClick={() => {
                sounds.playCardClick();
                onReturnToLobby();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-black/50 hover:bg-black/70 text-stone-200 font-extrabold text-xs sm:text-sm uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <Home className="w-4 h-4" />
              <span>LOBBY</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
