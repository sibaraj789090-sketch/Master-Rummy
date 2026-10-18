import confetti from 'canvas-confetti';

// Authentic Casino Rummy Theme Colors: Gold, Emerald Green, Royal Amber, Crimson Red, White Diamond
const CASINO_COLORS = ['#fbbf24', '#f59e0b', '#10b981', '#059669', '#ef4444', '#dc2626', '#ffffff', '#e0e7ff'];

/**
 * Triggers a multi-stage celebratory confetti explosion:
 * 1. Dual side-cannons shooting upwards at 60-degree angles
 * 2. Center star burst shower
 * 3. Continuous rain of gold coins & confetti ribbons for 3 seconds
 */
export function triggerWinConfetti() {
  try {
    // 1. Initial Left and Right Cannons
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0.05, y: 0.75 },
      colors: CASINO_COLORS,
      startVelocity: 55,
      zIndex: 10000,
    });

    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 0.95, y: 0.75 },
      colors: CASINO_COLORS,
      startVelocity: 55,
      zIndex: 10000,
    });

    // 2. High-impact Center Star Burst (after 200ms)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.45 },
        colors: ['#ffd700', '#facc15', '#ffffff', '#10b981'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
        startVelocity: 45,
        zIndex: 10000,
      });
    }, 220);

    // 3. Sustained 3-second celebratory confetti rain
    const duration = 2800;
    const animationEnd = Date.now() + duration;
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 40 * (timeLeft / duration);

      // Random bursts across the screen
      confetti({
        particleCount: Math.floor(particleCount),
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: CASINO_COLORS,
        zIndex: 10000,
      });
      confetti({
        particleCount: Math.floor(particleCount),
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: CASINO_COLORS,
        zIndex: 10000,
      });
    }, 300);
  } catch (err) {
    console.warn('Confetti effect error:', err);
  }
}

/**
 * Snappy quick celebration for round wins and successful declarations
 */
export function triggerRoundWinConfetti() {
  try {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { x: 0.5, y: 0.5 },
      colors: CASINO_COLORS,
      startVelocity: 40,
      zIndex: 10000,
    });
  } catch (err) {
    console.warn('Confetti effect error:', err);
  }
}
