import confetti from 'canvas-confetti';

// Authentic Casino Rummy Theme Colors: Pure Gold, Royal Amber, Emerald Green, Crimson Red, Diamond White, Purple
const CASINO_GOLD_COLORS = ['#fbbf24', '#f59e0b', '#ffd700', '#fef08a', '#ffffff'];
const CASINO_FESTIVE_COLORS = ['#fbbf24', '#f59e0b', '#10b981', '#059669', '#ef4444', '#dc2626', '#a855f7', '#ffffff'];

/**
 * Triggers a multi-stage celebratory confetti explosion:
 * 1. High-velocity dual corner cannons shooting inwards at 55-60 degree angles
 * 2. High-impact Center Star Burst & Golden Coin shower
 * 3. Side fireworks cascading back and forth
 * 4. Sustained 3.5-second rain of gold coins & ribbons
 */
export function triggerWinConfetti() {
  try {
    // Mobile tactile feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 40, 80, 40, 150]);
      } catch {}
    }

    // 1. Initial Left and Right Mega-Cannons
    confetti({
      particleCount: 90,
      angle: 60,
      spread: 75,
      origin: { x: 0.02, y: 0.8 },
      colors: CASINO_FESTIVE_COLORS,
      startVelocity: 60,
      ticks: 350,
      zIndex: 10000,
    });

    confetti({
      particleCount: 90,
      angle: 120,
      spread: 75,
      origin: { x: 0.98, y: 0.8 },
      colors: CASINO_FESTIVE_COLORS,
      startVelocity: 60,
      ticks: 350,
      zIndex: 10000,
    });

    // 2. Center Star Burst & Gold Coin Rain (after 200ms)
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.5, y: 0.38 },
        colors: CASINO_GOLD_COLORS,
        shapes: ['star', 'circle'],
        scalar: 1.4,
        startVelocity: 48,
        ticks: 300,
        zIndex: 10000,
      });
    }, 200);

    // 3. Follow-up Double Blast (after 500ms)
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 45,
        spread: 60,
        origin: { x: 0.15, y: 0.6 },
        colors: CASINO_GOLD_COLORS,
        startVelocity: 45,
        zIndex: 10000,
      });
      confetti({
        particleCount: 60,
        angle: 135,
        spread: 60,
        origin: { x: 0.85, y: 0.6 },
        colors: CASINO_GOLD_COLORS,
        startVelocity: 45,
        zIndex: 10000,
      });
    }, 550);

    // 4. Sustained 3.5-second cascading shower
    const duration = 3500;
    const animationEnd = Date.now() + duration;
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 35 * (timeLeft / duration);

      // Random side streams
      confetti({
        particleCount: Math.max(12, Math.floor(particleCount)),
        angle: 60,
        spread: 55,
        origin: { x: 0.05 + Math.random() * 0.1, y: 0.75 },
        colors: CASINO_FESTIVE_COLORS,
        zIndex: 10000,
      });
      confetti({
        particleCount: Math.max(12, Math.floor(particleCount)),
        angle: 120,
        spread: 55,
        origin: { x: 0.85 + Math.random() * 0.1, y: 0.75 },
        colors: CASINO_FESTIVE_COLORS,
        zIndex: 10000,
      });
    }, 320);
  } catch (err) {
    console.warn('Confetti effect error:', err);
  }
}

/**
 * Snappy celebration for round wins and successful declarations
 */
export function triggerRoundWinConfetti() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 30, 60]);
      } catch {}
    }

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { x: 0.5, y: 0.45 },
      colors: CASINO_GOLD_COLORS,
      startVelocity: 42,
      shapes: ['star', 'circle'],
      scalar: 1.3,
      zIndex: 10000,
    });
  } catch (err) {
    console.warn('Confetti effect error:', err);
  }
}

/**
 * Interactive Popper triggered by user click/tap
 */
export function triggerInteractivePopper(originX = 0.5, originY = 0.5) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {}
    }

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { x: originX, y: originY },
      colors: CASINO_FESTIVE_COLORS,
      shapes: ['circle', 'star'],
      startVelocity: 38,
      scalar: 1.2,
      zIndex: 10000,
    });
  } catch (err) {
    console.warn('Interactive popper error:', err);
  }
}

/**
 * Cascade of golden coins for jackpot wins
 */
export function triggerCoinShower() {
  try {
    confetti({
      particleCount: 65,
      spread: 100,
      origin: { x: 0.5, y: 0.2 },
      colors: ['#fbbf24', '#ffd700', '#f59e0b', '#ffffff'],
      shapes: ['circle'],
      scalar: 1.6,
      gravity: 1.2,
      drift: 0,
      ticks: 250,
      startVelocity: 25,
      zIndex: 10000,
    });
  } catch (err) {
    console.warn('Coin shower error:', err);
  }
}
