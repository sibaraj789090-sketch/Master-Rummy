import React, { useState, useEffect, useRef } from 'react';
import { useRummy } from '../../context/RummyContext';
import { PlayingCard, Rank, Suit } from '../../types/rummy';
import {
  createDeck,
  shuffleCards,
  sortHandCards,
  autoSortHand,
  isPureSequence,
  isImpureSequence,
  isValidSet,
  validateRummyHand,
  getGameModeConfig,
  calculateDropPenaltyPoints,
  calculatePointsSettlement,
  resolvePoolRound,
  resolveDealsRound,
  moveCardBetweenGroups,
  moveMultipleCardsBetweenGroups,
  GameModeConfig,
  RANKS,
} from '../../utils/rummyRules';
import { sounds } from '../../utils/sound';
import { triggerWinConfetti, triggerRoundWinConfetti } from '../../utils/confetti';
import {
  Menu,
  FileText,
  RotateCw,
  MessageCircle,
  X,
  Volume2,
  VolumeX,
  LogOut,
  Settings,
  Info,
  Check,
  AlertTriangle,
  Trophy,
  Smartphone,
  Repeat,
  Users,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { multiplayerService } from '../../services/multiplayerService';
import { ScreenOrientation } from '@capacitor/screen-orientation';

interface SeatPlayer {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  roundScore: number;
  cumulativeScore: number;
  dealScores: number[];
  status: 'PLAYING' | 'DROPPED' | 'WON' | 'ELIMINATED' | 'EMPTY';
  cardsCount: number;
  turnsCount: number;
  isDealer?: boolean;
  activeChat?: string | null;
}

// 2-Player Table Opponent
const TWO_PLAYER_OPPONENT: SeatPlayer = {
  id: 'seat_rohotara',
  name: 'Rohotara',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  chips: 3000,
  roundScore: 0,
  cumulativeScore: 0,
  dealScores: [],
  status: 'PLAYING',
  cardsCount: 13,
  turnsCount: 0,
  isDealer: false,
};

// 6-Player Table Opponents
const SIX_PLAYER_OPPONENTS: SeatPlayer[] = [
  {
    id: 'seat_sanjiv',
    name: 'Sanjiv Sa',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    chips: 3000,
    roundScore: 0,
    cumulativeScore: 0,
    dealScores: [],
    status: 'PLAYING',
    cardsCount: 13,
    turnsCount: 0,
    isDealer: false,
  },
  {
    id: 'seat_mahmad',
    name: 'Mahmad Ma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    chips: 4000,
    roundScore: 0,
    cumulativeScore: 0,
    dealScores: [],
    status: 'PLAYING',
    cardsCount: 13,
    turnsCount: 0,
    isDealer: false,
  },
  {
    id: 'seat_madhusuda',
    name: 'Madhusuda',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    chips: 3500,
    roundScore: 0,
    cumulativeScore: 0,
    dealScores: [],
    status: 'PLAYING',
    cardsCount: 13,
    turnsCount: 0,
    isDealer: false,
  },
  {
    id: 'seat_ankit',
    name: 'Ankit Awa',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    chips: 4500,
    roundScore: 0,
    cumulativeScore: 0,
    dealScores: [],
    status: 'PLAYING',
    cardsCount: 13,
    turnsCount: 0,
    isDealer: false,
  },
  {
    id: 'seat_sonelal',
    name: 'Sonelal K',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    chips: 4000,
    roundScore: 0,
    cumulativeScore: 0,
    dealScores: [],
    status: 'PLAYING',
    cardsCount: 13,
    turnsCount: 0,
    isDealer: true,
  },
];

// Authentic Joker Clown Illustration matching casino rummy cards
const JokerClownArt: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Center Horn with Bell */}
    <path d="M32 9 C32 3, 39 1, 41 4 C42 8, 37 14, 32 17 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8" />
    <circle cx="41" cy="4" r="2.2" fill="#fbbf24" stroke="#b45309" strokeWidth="0.6" />
    {/* Left Horn with Bell */}
    <path d="M25 17 C20 11, 9 9, 7 14 C5 18, 15 22, 23 22 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.8" />
    <circle cx="7" cy="14" r="2.2" fill="#fbbf24" stroke="#b45309" strokeWidth="0.6" />
    {/* Right Horn with Bell */}
    <path d="M39 17 C44 11, 55 9, 57 14 C59 18, 49 22, 41 22 Z" fill="#eab308" stroke="#854d0e" strokeWidth="0.8" />
    <circle cx="57" cy="14" r="2.2" fill="#fbbf24" stroke="#b45309" strokeWidth="0.6" />
    {/* Hat Band */}
    <path d="M21 21 C28 19, 36 19, 43 21 C42 26, 22 26, 21 21 Z" fill="#10b981" stroke="#047857" strokeWidth="0.8" />
    {/* Face */}
    <ellipse cx="32" cy="33" rx="12" ry="11" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
    {/* Eyes */}
    <ellipse cx="28" cy="30" rx="1.6" ry="2.2" fill="#1e293b" />
    <ellipse cx="36" cy="30" rx="1.6" ry="2.2" fill="#1e293b" />
    {/* Diamond Eye makeup */}
    <polygon points="28,25 29.5,27.5 28,30 26.5,27.5" fill="#3b82f6" />
    <polygon points="36,25 37.5,27.5 36,30 34.5,27.5" fill="#3b82f6" />
    {/* Red clown nose */}
    <circle cx="32" cy="33.5" r="2.6" fill="#ef4444" stroke="#991b1b" strokeWidth="0.6" />
    {/* Big smile */}
    <path d="M25 37 Q32 44 39 37" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M26.5 37 Q32 41 37.5 37" fill="#ffffff" />
    {/* Cheeks */}
    <circle cx="24" cy="34" r="2" fill="#fca5a5" opacity="0.7" />
    <circle cx="40" cy="34" r="2" fill="#fca5a5" opacity="0.7" />
    {/* Ruffled collar */}
    <path d="M21 43 L25 49 L29 44 L32 50 L35 44 L39 49 L43 43 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
    <path d="M24 45 L28 52 L32 47 L36 52 L40 45 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.8" />
  </svg>
);

// Ornate Gold Card Back Pattern matching casino deck
const CardBackArt: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative bg-gradient-to-br from-[#78350f] via-[#b45309] to-[#451a03] rounded-lg sm:rounded-xl border-2 border-amber-300/80 shadow-2xl flex flex-col items-center justify-center overflow-hidden ${className}`}>
    <div className="absolute inset-1 border border-amber-300/60 rounded sm:rounded-lg pointer-events-none" />
    <div className="absolute inset-2 border border-dashed border-amber-400/40 rounded sm:rounded-md pointer-events-none" />
    <div className="relative w-8 h-10 sm:w-10 sm:h-13 border-2 border-amber-300/80 bg-amber-950/80 rounded-full flex flex-col items-center justify-center shadow-inner">
      <span className="text-amber-300 text-sm sm:text-base font-black">♠</span>
      <span className="text-[7px] text-amber-200 font-black tracking-widest mt-0.5">RUMMY</span>
    </div>
  </div>
);

export const RummyTable: React.FC = () => {
  const {
    activeGameConfig,
    exitGame,
    currentUser,
    settleGameWin,
    soundEnabled,
    setSoundEnabled,
    multiplayerRoom,
    multiplayerPlayer,
    multiplayerSession,
  } = useRummy();

  const isMultiplayer = Boolean(activeGameConfig?.isMultiplayer && multiplayerRoom);

  // 1. GAME MODE & FORMAT CONFIGURATION
  const gameVariant = activeGameConfig?.variant || 'Points';
  const gameDetail = activeGameConfig?.gameTypeDetail || (gameVariant === 'Pool' ? '101' : gameVariant === 'Deals' ? '2' : 'Classic');
  const modeConfig: GameModeConfig = getGameModeConfig(gameVariant, gameDetail);
  const pointValue = activeGameConfig?.pointValue || 50;
  const entryFee = activeGameConfig?.entryFee || 1000;

  // Active Players Mode: 2 Players or 6 Players
  const [playersMode, setPlayersMode] = useState<2 | 6>(
    activeGameConfig?.playersCount === 2 ? 2 : 6
  );

  // Landscape / Portrait control
  const [isLandscape, setIsLandscape] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);

  // Countdown & Toss
  const [countdown, setCountdown] = useState<number>(2);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [tossAnnouncement, setTossAnnouncement] = useState<string | null>(null);

  // Multi-Round / Multi-Deal Table Progression State
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentDeal, setCurrentDeal] = useState<number>(1);
  const [userCumulativeScore, setUserCumulativeScore] = useState<number>(0);
  const [userDealScores, setUserDealScores] = useState<number[]>([]);
  const [userTurnsInRound, setUserTurnsInRound] = useState<number>(0);
  const [playerDropped, setPlayerDropped] = useState<boolean>(false);
  const [playerEliminated, setPlayerEliminated] = useState<boolean>(false);

  // Deck & Piles
  const [wildJokerRank, setWildJokerRank] = useState<Rank>('10');
  const [wildJokerSuit, setWildJokerSuit] = useState<Suit>('diamonds');
  const [closedDeck, setClosedDeck] = useState<PlayingCard[]>([]);
  const [openDiscardPile, setOpenDiscardPile] = useState<PlayingCard[]>([]);

  // 13 Cards in Meld Groups
  const [cardGroups, setCardGroups] = useState<PlayingCard[][]>([]);
  const [selectedCards, setSelectedCards] = useState<{ cardId: string; groupIdx: number }[]>([]);

  // Move History Stack for Undo capability
  const [moveHistory, setMoveHistory] = useState<PlayingCard[][][]>([]);

  // Drag-and-drop state (Touch for mobile / Android, HTML5 for desktop)
  const [touchDrag, setTouchDrag] = useState<{
    card: PlayingCard;
    fromGroupIdx: number;
    fromCardIdx: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
    hoverGroupIdx: number | null;
  } | null>(null);

  const [html5DragCard, setHtml5DragCard] = useState<{
    card: PlayingCard;
    fromGroupIdx: number;
    fromCardIdx: number;
  } | null>(null);
  const [html5HoverGroupIdx, setHtml5HoverGroupIdx] = useState<number | null>(null);

  // Turn management: 0 = User (ME), 1..N = opponent seats
  const [currentTurnSeat, setCurrentTurnSeat] = useState<number>(
    activeGameConfig?.playersCount === 2 ? 1 : 4
  );
  const [hasDrawnCard, setHasDrawnCard] = useState<boolean>(false);
  const [turnTimer, setTurnTimer] = useState<number>(30);

  // Modals
  const [showScoreWindow, setShowScoreWindow] = useState<boolean>(false);
  const [showInGameMenu, setShowInGameMenu] = useState<boolean>(false);
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false);
  const [showDropConfirmModal, setShowDropConfirmModal] = useState<boolean>(false);
  const [playerChatBubble, setPlayerChatBubble] = useState<string | null>(null);
  const [invalidShowMessage, setInvalidShowMessage] = useState<string | null>(null);

  // Round Complete Modal (for Pool and Deals progression)
  const [roundCompleteModalData, setRoundCompleteModalData] = useState<{
    round: number;
    deal?: number;
    winnerName: string;
    isPlayerWinner: boolean;
    standings: {
      name: string;
      isPlayer: boolean;
      avatar: string;
      roundScore: number;
      cumulativeScore: number;
      status: string;
      isEliminated?: boolean;
    }[];
    eliminatedNames?: string[];
    nextActionText: string;
  } | null>(null);

  // Table Champion / Final Game Won Modal
  const [winModalData, setWinModalData] = useState<{
    winnerName: string;
    isPlayer: boolean;
    prize: number;
    title: string;
    breakdown: { name: string; score: number; won: number; rank?: number }[];
  } | null>(null);

  const [isDeclaring, setIsDeclaring] = useState<boolean>(false);

  // Table ID
  const tableId = useRef(
    activeGameConfig?.playersCount === 2 ? 1132717034 : 1132656901
  ).current;

  // Active Seats state
  const [seats, setSeats] = useState<SeatPlayer[]>(() => {
    const list = activeGameConfig?.playersCount === 2 ? [TWO_PLAYER_OPPONENT] : SIX_PLAYER_OPPONENTS;
    return list.map((s) => ({
      ...s,
      roundScore: 0,
      cumulativeScore: 0,
      dealScores: [],
      turnsCount: 0,
      status: 'PLAYING',
    }));
  });

  // Calculate current drop penalty for user
  const isMiddleDrop = userTurnsInRound > 0;
  const currentDropPenalty = calculateDropPenaltyPoints(gameVariant, gameDetail, isMiddleDrop);

  // Screen and Device Orientation Tracking
  const [isDevicePortrait, setIsDevicePortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  // Auto-Rotate into landscape: enabled by default for full casino experience
  const [autoRotateLandscape, setAutoRotateLandscape] = useState<boolean>(true);

  useEffect(() => {
    const handleOrientationCheck = () => {
      if (typeof window !== 'undefined') {
        setIsDevicePortrait(window.innerHeight > window.innerWidth);
      }
    };
    window.addEventListener('resize', handleOrientationCheck);
    window.addEventListener('orientationchange', handleOrientationCheck);
    return () => {
      window.removeEventListener('resize', handleOrientationCheck);
      window.removeEventListener('orientationchange', handleOrientationCheck);
    };
  }, []);

  // Lock into Landscape automatically when table starts
  const lockLandscape = async () => {
    sounds.playRotate();
    setIsAutoRotating(true);

    // 1. Native Capacitor Screen Orientation (for Android APK / device)
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } catch {}

    // 2. Web Screen Orientation API
    try {
      if (typeof window !== 'undefined' && 'screen' in window && window.screen.orientation) {
        await (window.screen.orientation as any).lock?.('landscape');
      }
    } catch {}

    // 3. Fullscreen trigger if required for browser orientation lock
    try {
      if (typeof document !== 'undefined') {
        const docEl = document.documentElement as any;
        const req =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;
        if (req && !document.fullscreenElement) {
          await req.call(docEl).catch(() => {});
          if (window.screen.orientation && (window.screen.orientation as any).lock) {
            await (window.screen.orientation as any).lock('landscape').catch(() => {});
          }
        }
      }
    } catch {}

    setTimeout(() => {
      setIsAutoRotating(false);
    }, 1400);
  };

  // Trigger auto-rotate immediately upon game start / table launch
  useEffect(() => {
    lockLandscape();

    return () => {
      try {
        ScreenOrientation.unlock().catch(() => {});
      } catch {}
      try {
        if (typeof window !== 'undefined' && 'screen' in window && window.screen.orientation) {
          (window.screen.orientation as any).unlock?.();
        }
      } catch {}
    };
  }, []);

  // Initialize Dealing Cards for a Round or Deal
  const initRoundDealing = (roundNum: number, dealNum: number) => {
    const is2P = playersMode === 2;
    const initialJokerRank: Rank = is2P ? '10' : '5';
    const initialJokerSuit: Suit = is2P ? 'diamonds' : 'spades';
    setWildJokerRank(initialJokerRank);
    setWildJokerSuit(initialJokerSuit);

    // Create 2 shuffled decks
    const deck = shuffleCards(createDeck(2, initialJokerRank));

    // Deal 13 cards to player
    const dealtPlayer = deck.splice(0, 13);
    const sortedHand = autoSortHand(dealtPlayer, initialJokerRank);
    setCardGroups(sortedHand);

    // Top open discard card
    const firstOpen: PlayingCard = is2P
      ? { id: `disc_${Date.now()}_6s`, rank: '6', suit: 'spades', value: 6, points: 6 }
      : { id: `disc_${Date.now()}_jh`, rank: 'J', suit: 'hearts', value: 11, points: 10, isJoker: true };

    setOpenDiscardPile([firstOpen]);
    setClosedDeck(deck);
    setHasDrawnCard(false);
    setSelectedCards([]);
    setPlayerDropped(false);
    setUserTurnsInRound(0);
    setCurrentTurnSeat(is2P ? 1 : 4);
    setTurnTimer(30);

    // Reset non-eliminated bot statuses for this round
    setSeats((prev) =>
      prev.map((s) => ({
        ...s,
        roundScore: 0,
        turnsCount: 0,
        status: s.status === 'ELIMINATED' ? 'ELIMINATED' : 'PLAYING',
      }))
    );
  };

  // Initial Deal on Mount
  useEffect(() => {
    initRoundDealing(1, 1);

    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countTimer);
          setGameStarted(true);
          sounds.playCardDeal();
          const dealerName = playersMode === 2 ? 'You' : 'Sonelal K (D)';
          setTossAnnouncement(`Toss: ${dealerName} is Dealer. Game Started!`);
          setTimeout(() => setTossAnnouncement(null), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countTimer);
  }, [playersMode]);

  // Celebratory confetti animation on game or round victory
  useEffect(() => {
    if (winModalData?.isPlayer) {
      triggerWinConfetti();
    }
  }, [winModalData]);

  useEffect(() => {
    if (roundCompleteModalData?.isPlayerWinner) {
      triggerRoundWinConfetti();
    }
  }, [roundCompleteModalData]);

  // Turn Timer Loop (30s countdown)
  useEffect(() => {
    if (!gameStarted || playerDropped || winModalData || roundCompleteModalData) return;

    const timer = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          advanceTurn();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, currentTurnSeat, hasDrawnCard, playerDropped, winModalData, roundCompleteModalData, seats.length]);

  // Opponent Bot Turn Simulator
  useEffect(() => {
    if (!gameStarted || currentTurnSeat === 0 || winModalData || roundCompleteModalData) return;
    if (isMultiplayer) return;

    const botIndex = currentTurnSeat - 1;
    const bot = seats[botIndex];
    if (!bot || bot.status !== 'PLAYING') {
      advanceTurn();
      return;
    }

    const thinkDelay = setTimeout(() => {
      sounds.playCardDeal();
      let botDrawnCard: PlayingCard;
      if (closedDeck.length > 0) {
        botDrawnCard = closedDeck[0];
        setClosedDeck((prev) => prev.slice(1));
      } else {
        botDrawnCard = {
          id: `bot_card_${Date.now()}`,
          rank: '8',
          suit: 'clubs',
          value: 8,
          points: 8,
        };
      }

      setSeats((prev) =>
        prev.map((s, idx) => (idx === botIndex ? { ...s, turnsCount: s.turnsCount + 1 } : s))
      );

      // Bot Discard after 1.5s
      setTimeout(() => {
        sounds.playCardClick();
        setOpenDiscardPile((prev) => [botDrawnCard, ...prev]);

        // Occasional chat
        if (Math.random() < 0.15) {
          triggerBotChat(
            botIndex,
            ['Nice move', 'Good luck', 'Hurry up', 'Play fast'][Math.floor(Math.random() * 4)]
          );
        }

        advanceTurn();
      }, 1400);
    }, 1600);

    return () => clearTimeout(thinkDelay);
  }, [currentTurnSeat, gameStarted, playerDropped, winModalData, roundCompleteModalData, seats.length, isMultiplayer]);

  const advanceTurn = () => {
    setHasDrawnCard(false);
    setSelectedCards([]);
    setTurnTimer(30);

    const totalSeats = seats.length + 1; // 0 is User, 1..seats.length are bots
    let nextSeat = (currentTurnSeat + 1) % totalSeats;

    // Skip dropped or eliminated players
    let attempts = 0;
    while (attempts < totalSeats) {
      if (nextSeat === 0) {
        if (!playerDropped && !playerEliminated) {
          break;
        }
      } else {
        const bot = seats[nextSeat - 1];
        if (bot && bot.status === 'PLAYING') {
          break;
        }
      }
      nextSeat = (nextSeat + 1) % totalSeats;
      attempts++;
    }

    if (nextSeat === 0) {
      setUserTurnsInRound((prev) => prev + 1);
    }
    setCurrentTurnSeat(nextSeat);
  };

  const triggerBotChat = (botIdx: number, text: string) => {
    setSeats((prev) =>
      prev.map((s, idx) => (idx === botIdx ? { ...s, activeChat: text } : s))
    );
    setTimeout(() => {
      setSeats((prev) =>
        prev.map((s, idx) => (idx === botIdx ? { ...s, activeChat: null } : s))
      );
    }, 2800);
  };

  // Draw from Closed Deck (User Turn)
  const handleDrawClosed = async () => {
    if (currentTurnSeat !== 0) {
      alert("Wait for your turn!");
      return;
    }
    if (playerDropped || playerEliminated) {
      alert("You cannot draw after dropping or being eliminated.");
      return;
    }
    if (hasDrawnCard) {
      alert("You have already drawn a card! Please discard one card.");
      return;
    }

    if (closedDeck.length === 0) return;

    sounds.playCardDeal();
    const [card, ...rest] = closedDeck;
    setClosedDeck(rest);

    // Add drawn card to first group
    setCardGroups((prev) => {
      const copy = [...prev];
      if (copy.length === 0) return [[card]];
      copy[0] = [...copy[0], card];
      return copy;
    });
    setHasDrawnCard(true);
  };

  // Draw from Open Discard Pile (User Turn)
  const handleDrawOpen = async () => {
    if (currentTurnSeat !== 0) {
      alert("Wait for your turn!");
      return;
    }
    if (playerDropped || playerEliminated) {
      alert("You cannot draw after dropping or being eliminated.");
      return;
    }
    if (hasDrawnCard) {
      alert("You have already drawn a card! Please discard one card.");
      return;
    }

    if (openDiscardPile.length === 0) return;

    sounds.playCardDeal();
    const [card, ...rest] = openDiscardPile;
    setOpenDiscardPile(rest);

    setCardGroups((prev) => {
      const copy = [...prev];
      if (copy.length === 0) return [[card]];
      copy[0] = [...copy[0], card];
      return copy;
    });
    setHasDrawnCard(true);
  };

  // Toggle selection of a card (tap to select or tap to deselect)
  const handleCardClick = (cardId: string, groupIdx: number) => {
    sounds.playCardClick();
    setSelectedCards((prev) => {
      const exists = prev.some((sc) => sc.cardId === cardId);
      if (exists) {
        return prev.filter((sc) => sc.cardId !== cardId);
      } else {
        return [...prev, { cardId, groupIdx }];
      }
    });
  };

  // Move a single card between groups
  const executeCardMove = (
    cardId: string,
    fromGroupIdx: number,
    toGroupIdx: number,
    insertIndex?: number
  ) => {
    if (fromGroupIdx === toGroupIdx && insertIndex === undefined) {
      return false;
    }

    const res = moveCardBetweenGroups(cardGroups, cardId, fromGroupIdx, toGroupIdx, insertIndex);
    if (res.success) {
      sounds.playCardClick();
      setMoveHistory((prev) => [...prev.slice(-9), cardGroups]);
      setCardGroups(res.newGroups);
      setSelectedCards([]);
      return true;
    }
    return false;
  };

  // Move all currently selected cards to destination group (or new group if toGroupIdx is -1)
  const executeSelectedCardsMove = (toGroupIdx: number) => {
    if (selectedCards.length === 0) return false;
    const cardIds = selectedCards.map((sc) => sc.cardId);
    const res = moveMultipleCardsBetweenGroups(cardGroups, cardIds, toGroupIdx);
    if (res.success) {
      sounds.playCardDeal();
      setMoveHistory((prev) => [...prev.slice(-9), cardGroups]);
      setCardGroups(res.newGroups);
      setSelectedCards([]);
      return true;
    }
    return false;
  };

  // Undo last card movement / rearrangement
  const handleUndoMove = () => {
    if (moveHistory.length === 0) return;
    sounds.playCardClick();
    const previous = moveHistory[moveHistory.length - 1];
    setMoveHistory((prev) => prev.slice(0, prev.length - 1));
    setCardGroups(previous);
    setSelectedCards([]);
  };

  // Deselect all selected cards
  const handleDeselectAll = () => {
    sounds.playCardClick();
    setSelectedCards([]);
  };

  // Touch drag handlers for mobile touchscreens
  const handleCardTouchStart = (
    e: React.TouchEvent,
    card: PlayingCard,
    groupIdx: number,
    cardIdx: number
  ) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setTouchDrag({
      card,
      fromGroupIdx: groupIdx,
      fromCardIdx: cardIdx,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
      hoverGroupIdx: null,
    });
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (!touchDrag) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchDrag.startX;
    const dy = touch.clientY - touchDrag.startY;
    const dist = Math.hypot(dx, dy);

    const isDragging = dist > 8 || touchDrag.isDragging;

    // Detect group under touch point
    let hoverGroupIdx: number | null = null;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const groupEl = el.closest('[data-meld-group]');
      if (groupEl) {
        const val = groupEl.getAttribute('data-meld-group');
        if (val === 'new') {
          hoverGroupIdx = -1;
        } else if (val !== null) {
          hoverGroupIdx = parseInt(val, 10);
        }
      }
    }

    setTouchDrag((prev) =>
      prev
        ? {
            ...prev,
            currentX: touch.clientX,
            currentY: touch.clientY,
            isDragging,
            hoverGroupIdx,
          }
        : null
    );
  };

  const handleCardTouchEnd = () => {
    if (!touchDrag) return;
    if (touchDrag.isDragging && touchDrag.hoverGroupIdx !== null) {
      executeCardMove(
        touchDrag.card.id,
        touchDrag.fromGroupIdx,
        touchDrag.hoverGroupIdx
      );
    }
    setTouchDrag(null);
  };

  const handleCardTouchCancel = () => {
    setTouchDrag(null);
  };

  // HTML5 drag handlers for desktop mouse
  const handleHtml5DragStart = (
    e: React.DragEvent,
    card: PlayingCard,
    groupIdx: number,
    cardIdx: number
  ) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    setHtml5DragCard({ card, fromGroupIdx: groupIdx, fromCardIdx: cardIdx });
  };

  const handleHtml5DragOverGroup = (e: React.DragEvent, targetGroupIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (html5HoverGroupIdx !== targetGroupIdx) {
      setHtml5HoverGroupIdx(targetGroupIdx);
    }
  };

  const handleHtml5DropGroup = (e: React.DragEvent, targetGroupIdx: number) => {
    e.preventDefault();
    setHtml5HoverGroupIdx(null);
    if (!html5DragCard) return;
    executeCardMove(html5DragCard.card.id, html5DragCard.fromGroupIdx, targetGroupIdx);
    setHtml5DragCard(null);
  };

  // Discard selected card
  const handleDiscard = async () => {
    if (currentTurnSeat !== 0) {
      alert("Wait for your turn!");
      return;
    }
    if (!hasDrawnCard) {
      alert("Please draw a card from Closed Deck or Open Pile first!");
      return;
    }
    if (selectedCards.length !== 1) {
      alert("Select exactly 1 card to discard.");
      return;
    }

    const { cardId, groupIdx } = selectedCards[0];
    const group = cardGroups[groupIdx];
    const discardedCard = group?.find((c) => c.id === cardId);
    if (!discardedCard) return;

    sounds.playCardClick();

    // Remove from group
    setCardGroups((prev) => {
      const copy = prev.map((g, idx) =>
        idx === groupIdx ? g.filter((c) => c.id !== cardId) : g
      );
      return copy.filter((g) => g.length > 0);
    });

    // Add to top of discard pile
    setOpenDiscardPile((prev) => [discardedCard, ...prev]);

    // Advance turn
    advanceTurn();
  };

  // Group selected cards into a new meld group
  const handleGroupCards = () => {
    if (selectedCards.length < 2) {
      alert("Select 2 or more cards to form a group.");
      return;
    }

    sounds.playCardDeal();
    setMoveHistory((prev) => [...prev.slice(-9), cardGroups]);
    const selectedIds = new Set(selectedCards.map((sc) => sc.cardId));
    const groupedCards: PlayingCard[] = [];

    const newGroups = cardGroups
      .map((group) => {
        const remaining: PlayingCard[] = [];
        group.forEach((card) => {
          if (selectedIds.has(card.id)) {
            groupedCards.push(card);
          } else {
            remaining.push(card);
          }
        });
        return remaining;
      })
      .filter((g) => g.length > 0);

    newGroups.push(groupedCards);
    setCardGroups(newGroups);
    setSelectedCards([]);
  };

  // Auto-Sort Cards into valid Pure Sequences, Impure Sequences, Sets & Ungrouped
  const handleAutoSort = () => {
    sounds.playCardClick();
    const allCards = cardGroups.flat();
    if (allCards.length === 0) return;
    setMoveHistory((prev) => [...prev.slice(-9), cardGroups]);
    const sortedGroups = autoSortHand(allCards, wildJokerRank);
    setCardGroups(sortedGroups);
    setSelectedCards([]);
  };

  // Open Drop Confirmation
  const handleOpenDropConfirm = () => {
    if (playerDropped || playerEliminated) return;
    if (hasDrawnCard) {
      alert("You cannot drop after drawing a card. You must discard to complete your turn.");
      return;
    }
    sounds.playCardClick();
    setShowDropConfirmModal(true);
  };

  // Confirm Drop Execution
  const handleConfirmDrop = () => {
    setShowDropConfirmModal(false);
    sounds.playBell();

    const penalty = currentDropPenalty;
    const newCumulative = userCumulativeScore + penalty;
    setUserCumulativeScore(newCumulative);
    setPlayerDropped(true);

    if (gameVariant === 'Points') {
      // Points Rummy ends immediately upon drop
      const grossPrize = penalty * pointValue;
      settleGameWin(0); // Player dropped, loses penalty
      setWinModalData({
        winnerName: seats[0]?.name || 'Opponent',
        isPlayer: false,
        prize: grossPrize,
        title: 'POINTS RUMMY COMPLETED',
        breakdown: [
          { name: `${currentUser.username} (You - Dropped)`, score: penalty, won: 0 },
          ...seats.map((s, idx) => ({
            name: s.name,
            score: 0,
            won: idx === 0 ? grossPrize : 0,
          })),
        ],
      });
      return;
    }

    if (gameVariant === 'Pool') {
      const threshold = modeConfig.eliminationThreshold || 101;
      const isElim = newCumulative >= threshold;
      if (isElim) {
        setPlayerEliminated(true);
      }

      // Check remaining active bots
      const activeBots = seats.filter((s) => s.status === 'PLAYING');
      if (activeBots.length <= 1) {
        // Last bot wins the round
        handleConcludeRoundOrDeal(activeBots[0]?.id || seats[0]?.id, false);
      } else {
        advanceTurn();
      }
      return;
    }

    if (gameVariant === 'Deals') {
      const updatedDealScores = [...userDealScores, penalty];
      setUserDealScores(updatedDealScores);

      const activeBots = seats.filter((s) => s.status === 'PLAYING');
      if (activeBots.length <= 1) {
        handleConcludeRoundOrDeal(activeBots[0]?.id || seats[0]?.id, false);
      } else {
        advanceTurn();
      }
      return;
    }
  };

  // Conclude Round or Deal (Common handler for declaration or all-fold)
  const handleConcludeRoundOrDeal = (winnerId: string, isUserWinner: boolean) => {
    sounds.playWinFanfare();
    if (isUserWinner) {
      triggerWinConfetti();
    }

    // 1. Calculate round scores for all participants
    const userPenalty = isUserWinner
      ? 0
      : playerDropped
      ? currentDropPenalty
      : totalScorePoints;

    const updatedUserCumul = userCumulativeScore + userPenalty;
    setUserCumulativeScore(updatedUserCumul);

    const updatedUserDeals = [...userDealScores, userPenalty];
    setUserDealScores(updatedUserDeals);

    const updatedSeats = seats.map((s) => {
      if (s.id === winnerId) {
        return {
          ...s,
          roundScore: 0,
          cumulativeScore: s.cumulativeScore + 0,
          dealScores: [...s.dealScores, 0],
          status: 'WON' as const,
        };
      } else if (s.status === 'DROPPED') {
        const botPenalty = modeConfig.firstDropPenalty;
        return {
          ...s,
          roundScore: botPenalty,
          cumulativeScore: s.cumulativeScore + botPenalty,
          dealScores: [...s.dealScores, botPenalty],
        };
      } else {
        // Hand penalty between 20 and 80
        const botPenalty = Math.min(80, Math.floor(Math.random() * 45) + 25);
        return {
          ...s,
          roundScore: botPenalty,
          cumulativeScore: s.cumulativeScore + botPenalty,
          dealScores: [...s.dealScores, botPenalty],
        };
      }
    });

    setSeats(updatedSeats);

    // 2. POINTS RUMMY RESOLUTION
    if (gameVariant === 'Points') {
      const scoresRecord: Record<string, number> = {
        [currentUser.id]: userPenalty,
      };
      updatedSeats.forEach((s) => {
        scoresRecord[s.id] = s.roundScore;
      });

      const settlement = calculatePointsSettlement(
        isUserWinner ? currentUser.id : winnerId,
        scoresRecord,
        pointValue,
        3
      );

      if (isUserWinner) {
        settleGameWin(settlement.grossWinnings);
      }

      setWinModalData({
        winnerName: isUserWinner ? `${currentUser.username} (You)` : seats.find((s) => s.id === winnerId)?.name || 'Opponent',
        isPlayer: isUserWinner,
        prize: settlement.netWinnings,
        title: 'POINTS RUMMY COMPLETED',
        breakdown: [
          {
            name: `${currentUser.username} (You)`,
            score: userPenalty,
            won: isUserWinner ? settlement.netWinnings : 0,
          },
          ...updatedSeats.map((s) => ({
            name: s.name,
            score: s.roundScore,
            won: s.id === winnerId ? settlement.netWinnings : 0,
          })),
        ],
      });
      return;
    }

    // 3. POOL RUMMY RESOLUTION (101 & 201)
    if (gameVariant === 'Pool') {
      const threshold = modeConfig.eliminationThreshold || 101;
      const allPlayerIds = [currentUser.id, ...updatedSeats.map((s) => s.id)];

      const prevCumul: Record<string, number> = {
        [currentUser.id]: userCumulativeScore,
      };
      const roundScoresMap: Record<string, number> = {
        [currentUser.id]: userPenalty,
      };

      updatedSeats.forEach((s) => {
        prevCumul[s.id] = s.cumulativeScore - s.roundScore;
        roundScoresMap[s.id] = s.roundScore;
      });

      const poolRes = resolvePoolRound(prevCumul, roundScoresMap, threshold, allPlayerIds);

      // Check newly eliminated bots
      const newlyEliminatedNames: string[] = [];
      if (updatedUserCumul >= threshold) {
        setPlayerEliminated(true);
        newlyEliminatedNames.push(`${currentUser.username} (You)`);
      }

      setSeats((prev) =>
        prev.map((s) => {
          const elim = s.cumulativeScore >= threshold;
          if (elim && s.status !== 'ELIMINATED') {
            newlyEliminatedNames.push(s.name);
          }
          return {
            ...s,
            status: elim ? ('ELIMINATED' as const) : s.status,
          };
        })
      );

      if (poolRes.isTableComplete) {
        // Table Finished! Single winner remains
        const isMeChampion = poolRes.tableWinnerId === currentUser.id;
        const totalPrize = entryFee * (seats.length + 1) * 0.9;

        if (isMeChampion) {
          settleGameWin(totalPrize);
        }

        setWinModalData({
          winnerName: isMeChampion ? `${currentUser.username} (You)` : seats.find((s) => s.id === poolRes.tableWinnerId)?.name || 'Opponent',
          isPlayer: isMeChampion,
          prize: totalPrize,
          title: `${gameDetail} POOL CHAMPION DECLARED!`,
          breakdown: [
            {
              name: `${currentUser.username} (You)`,
              score: updatedUserCumul,
              won: isMeChampion ? totalPrize : 0,
            },
            ...updatedSeats.map((s) => ({
              name: s.name,
              score: s.cumulativeScore,
              won: s.id === poolRes.tableWinnerId ? totalPrize : 0,
            })),
          ],
        });
      } else {
        // Show Round Complete Modal with Standings
        const winnerObj = isUserWinner
          ? { name: `${currentUser.username} (You)` }
          : updatedSeats.find((s) => s.id === winnerId);

        setRoundCompleteModalData({
          round: currentRound,
          winnerName: winnerObj?.name || 'Opponent',
          isPlayerWinner: isUserWinner,
          standings: [
            {
              name: `${currentUser.username} (You)`,
              isPlayer: true,
              avatar: currentUser.avatar,
              roundScore: userPenalty,
              cumulativeScore: updatedUserCumul,
              status: updatedUserCumul >= threshold ? 'ELIMINATED' : playerDropped ? 'DROPPED' : isUserWinner ? 'WON' : 'ACTIVE',
              isEliminated: updatedUserCumul >= threshold,
            },
            ...updatedSeats.map((s) => ({
              name: s.name,
              isPlayer: false,
              avatar: s.avatar,
              roundScore: s.roundScore,
              cumulativeScore: s.cumulativeScore,
              status: s.cumulativeScore >= threshold ? 'ELIMINATED' : s.status === 'DROPPED' ? 'DROPPED' : s.id === winnerId ? 'WON' : 'ACTIVE',
              isEliminated: s.cumulativeScore >= threshold,
            })),
          ],
          eliminatedNames: newlyEliminatedNames,
          nextActionText: `START ROUND ${currentRound + 1}`,
        });
      }
      return;
    }

    // 4. DEALS RUMMY RESOLUTION (2 Deals & 3 Deals)
    if (gameVariant === 'Deals') {
      const totalDeals = modeConfig.totalDeals || 2;
      const allPlayerIds = [currentUser.id, ...updatedSeats.map((s) => s.id)];

      const prevCumul: Record<string, number> = {
        [currentUser.id]: userCumulativeScore,
      };
      const dealScoresMap: Record<string, number> = {
        [currentUser.id]: userPenalty,
      };

      updatedSeats.forEach((s) => {
        prevCumul[s.id] = s.cumulativeScore - s.roundScore;
        dealScoresMap[s.id] = s.roundScore;
      });

      const dealsRes = resolveDealsRound(
        prevCumul,
        dealScoresMap,
        currentDeal,
        totalDeals,
        allPlayerIds
      );

      if (dealsRes.isTableComplete) {
        // Deals Completed! Rank players by lowest cumulative score
        const isMeChampion = dealsRes.tableWinnerId === currentUser.id;
        const totalPrize = entryFee * (seats.length + 1) * 0.9;

        if (isMeChampion) {
          settleGameWin(totalPrize);
        }

        const sortedStandings = [
          {
            name: `${currentUser.username} (You)`,
            score: updatedUserCumul,
            isMe: true,
          },
          ...updatedSeats.map((s) => ({
            name: s.name,
            score: s.cumulativeScore,
            isMe: false,
          })),
        ].sort((a, b) => a.score - b.score);

        setWinModalData({
          winnerName: isMeChampion ? `${currentUser.username} (You)` : seats.find((s) => s.id === dealsRes.tableWinnerId)?.name || 'Opponent',
          isPlayer: isMeChampion,
          prize: totalPrize,
          title: `${totalDeals} DEALS RUMMY FINAL RESULT`,
          breakdown: sortedStandings.map((st, idx) => ({
            name: st.name,
            score: st.score,
            won: idx === 0 ? totalPrize : 0,
            rank: idx + 1,
          })),
        });
      } else {
        // Show Deal Complete Modal
        const winnerObj = isUserWinner
          ? { name: `${currentUser.username} (You)` }
          : updatedSeats.find((s) => s.id === winnerId);

        setRoundCompleteModalData({
          round: currentRound,
          deal: currentDeal,
          winnerName: winnerObj?.name || 'Opponent',
          isPlayerWinner: isUserWinner,
          standings: [
            {
              name: `${currentUser.username} (You)`,
              isPlayer: true,
              avatar: currentUser.avatar,
              roundScore: userPenalty,
              cumulativeScore: updatedUserCumul,
              status: isUserWinner ? 'WON' : playerDropped ? 'DROPPED' : 'PLAYED',
            },
            ...updatedSeats.map((s) => ({
              name: s.name,
              isPlayer: false,
              avatar: s.avatar,
              roundScore: s.roundScore,
              cumulativeScore: s.cumulativeScore,
              status: s.id === winnerId ? 'WON' : s.status === 'DROPPED' ? 'DROPPED' : 'PLAYED',
            })),
          ],
          nextActionText: `START DEAL ${currentDeal + 1} OF ${totalDeals}`,
        });
      }
      return;
    }
  };

  // Advance to Next Round or Deal
  const handleProceedNextRoundOrDeal = () => {
    sounds.playCardDeal();
    setRoundCompleteModalData(null);
    const nextRound = currentRound + 1;
    const nextDeal = currentDeal + 1;
    setCurrentRound(nextRound);
    if (gameVariant === 'Deals') {
      setCurrentDeal(nextDeal);
    }
    initRoundDealing(nextRound, nextDeal);
  };

  // Declare / Show Hand
  const handleDeclareShow = () => {
    if (isDeclaring) return;
    if (currentTurnSeat !== 0) {
      alert("You can only declare on your turn!");
      return;
    }
    if (playerDropped || playerEliminated) {
      alert("You cannot declare after dropping or being eliminated.");
      return;
    }

    setIsDeclaring(true);

    // If user has 14 cards and 1 card selected, remove that card as the finish card
    let handToValidate = cardGroups;
    if (hasDrawnCard && selectedCards.length === 1) {
      const { cardId, groupIdx } = selectedCards[0];
      handToValidate = cardGroups.map((g, idx) =>
        idx === groupIdx ? g.filter((c) => c.id !== cardId) : g
      ).filter((g) => g.length > 0);
    }

    const validation = validateRummyHand(handToValidate, wildJokerRank);

    if (validation.isValidDeclaration) {
      handleConcludeRoundOrDeal(currentUser.id, true);
    } else {
      // Invalid Show Penalty: 80 points
      sounds.playBell();
      setInvalidShowMessage(
        `Invalid Show! ${validation.statusMessage}. Indian Rummy requires at least 1 Pure Sequence + 1 Second Sequence.`
      );
      setTimeout(() => setInvalidShowMessage(null), 4500);
    }

    setIsDeclaring(false);
  };

  // Send table chat
  const handleSendChat = (text: string) => {
    sounds.playCardClick();
    setPlayerChatBubble(text);
    setShowChatDrawer(false);
    setTimeout(() => {
      setPlayerChatBubble(null);
    }, 3000);
  };

  // Toggle Landscape vs Portrait
  const handleToggleOrientation = async () => {
    sounds.playRotate();
    const nextVal = !autoRotateLandscape;
    setAutoRotateLandscape(nextVal);
    setIsLandscape(nextVal);

    if (nextVal) {
      await lockLandscape();
    } else {
      try {
        await ScreenOrientation.unlock().catch(() => {});
      } catch {}
      try {
        if (typeof window !== 'undefined' && 'screen' in window && window.screen.orientation) {
          (window.screen.orientation as any).unlock?.();
        }
      } catch {}
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  };

  const handleExit = () => {
    sounds.playCardClick();
    try {
      ScreenOrientation.unlock().catch(() => {});
    } catch {}
    try {
      if (typeof window !== 'undefined' && 'screen' in window && window.screen.orientation) {
        (window.screen.orientation as any).unlock?.();
      }
    } catch {}
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
    exitGame();
  };

  // Group status helper matching official Rummy definitions
  const getGroupStatus = (group: PlayingCard[]) => {
    if (isPureSequence(group)) {
      return { label: 'Pure Sequence', type: 'pure', isValid: true, points: 0 };
    }
    if (isImpureSequence(group, wildJokerRank)) {
      return { label: 'Sequence', type: 'impure', isValid: true, points: 0 };
    }
    if (isValidSet(group, wildJokerRank)) {
      return { label: 'Set', type: 'set', isValid: true, points: 0 };
    }

    const points = group.reduce(
      (acc, c) => (c.rank === wildJokerRank || c.isJoker ? acc : acc + c.points),
      0
    );
    const label = group.length === 1 ? '' : `Invalid(${points})`;
    return { label, type: 'ungrouped', isValid: false, points };
  };

  // Real-time computed penalty score of player hand
  const totalScorePoints = Math.min(
    80,
    validateRummyHand(cardGroups, wildJokerRank).totalPoints
  );

  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
    }
  };

  const getSuitColor = (suit: Suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-slate-900';
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.some((sc) => sc.cardId === cardId);
  };

  // Mode header title
  const getModeTitle = () => {
    if (gameVariant === 'Points') {
      return `Points Rummy · ₹${pointValue}/pt`;
    }
    if (gameVariant === 'Pool') {
      return `${gameDetail} Pool · Round ${currentRound} (Elimination: ${modeConfig.eliminationThreshold} pts)`;
    }
    if (gameVariant === 'Deals') {
      return `${modeConfig.totalDeals} Deals · Deal ${currentDeal} of ${modeConfig.totalDeals}`;
    }
    return 'Master Rummy';
  };

  return (
    <div
      style={
        isDevicePortrait && autoRotateLandscape
          ? {
              position: 'fixed',
              width: '100vh',
              height: '100vw',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(90deg)',
              transformOrigin: 'center center',
              zIndex: 50,
              maxWidth: 'none',
              maxHeight: 'none',
            }
          : {}
      }
      className="fixed inset-0 z-50 bg-[#070b14] text-white flex flex-col justify-between select-none overflow-hidden font-sans"
    >
      {/* Auto-Rotating to Landscape Notification Badge */}
      {isAutoRotating && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-amber-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce pointer-events-none">
          <Repeat className="w-4 h-4 animate-spin text-amber-950" />
          <span>Auto-Rotating Table to Landscape ↔</span>
        </div>
      )}

      {/* 1. Sleek Full-Width In-Game Top Bar */}
      <div className="w-full bg-[#0d121c]/95 border-b border-stone-800/80 px-2.5 sm:px-4 py-1.5 flex items-center justify-between text-xs z-30 shrink-0 shadow-md">
        {/* Left Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sounds.playCardClick();
              setShowInGameMenu(true);
            }}
            title="Menu"
            className="w-8 h-8 rounded-lg bg-stone-800/90 hover:bg-stone-700 flex items-center justify-center text-stone-200 transition-colors active:scale-95 border border-stone-700/60"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              setShowScoreWindow(true);
            }}
            title="Score Window"
            className="w-8 h-8 rounded-lg bg-stone-800/90 hover:bg-stone-700 flex items-center justify-center text-stone-200 transition-colors active:scale-95 border border-stone-700/60"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Verified Shield, Table ID, Game Variant, Stake & Signal */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-semibold text-stone-300">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
              ✓
            </span>
            <span className="font-mono text-stone-200 font-bold tracking-tight">{tableId}</span>
          </div>

          <span className="text-stone-600 font-normal">|</span>

          <span className="text-amber-300 font-extrabold truncate max-w-[130px] sm:max-w-none">
            {getModeTitle()}
          </span>

          <span className="text-stone-600 font-normal hidden sm:inline">|</span>

          <span className="text-stone-300 font-bold hidden sm:inline">
            Value: <span className="text-amber-400 font-mono">🪙 {gameVariant === 'Points' ? pointValue : entryFee}</span>
          </span>

          {/* Cellular Signal Strength Icon (4 Bars) */}
          <div className="flex items-end gap-0.5 h-3 ml-1" title="Network: Excellent">
            <div className="w-0.5 h-1.5 bg-emerald-400 rounded-2xs" />
            <div className="w-0.5 h-2 bg-emerald-400 rounded-2xs" />
            <div className="w-0.5 h-2.5 bg-emerald-400 rounded-2xs" />
            <div className="w-0.5 h-3 bg-emerald-400 rounded-2xs" />
          </div>
        </div>

        {/* Right: Refresh / Orientation & Exit */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleOrientation}
            title={autoRotateLandscape ? 'Switch to Portrait' : 'Auto-Rotate to Landscape'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 border ${
              autoRotateLandscape
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md ring-1 ring-amber-300'
                : 'bg-stone-800/90 hover:bg-stone-700 text-stone-300 border-stone-700/60'
            }`}
          >
            <RotateCw className={`w-4 h-4 transition-transform duration-300 ${autoRotateLandscape ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={handleExit}
            title="Leave Table"
            className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-extrabold border border-red-700/60 transition-colors shadow-xs"
          >
            Exit
          </button>
        </div>
      </div>

      {/* 2. Main Large Wide Oval Rummy Felt Table Arena */}
      <div className="flex-1 w-full flex flex-col justify-between p-1 sm:p-2 md:p-3 overflow-hidden relative">
        <div className="w-full h-full felt-table felt-wood-border rounded-[48px] sm:rounded-[76px] md:rounded-[110px] lg:rounded-[140px] flex flex-col justify-between p-1.5 sm:p-3 md:p-4 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          {/* Countdown Overlay */}
          {!gameStarted && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xs">
              <div className="bg-black/90 border-2 border-amber-400 px-6 py-4 rounded-2xl shadow-2xl text-center animate-bounce">
                <span className="text-xs text-amber-300 uppercase tracking-widest font-black">
                  {gameVariant.toUpperCase()} RUMMY ({playersMode} PLAYERS)
                </span>
                <h2 className="text-2xl font-black text-white mt-1 drop-shadow-lg tracking-wide">
                  The game starts in <span className="text-yellow-400 text-3xl">{countdown}s</span>
                </h2>
                <p className="text-[11px] text-stone-300 mt-1">Dealing 13 cards to players...</p>
              </div>
            </div>
          )}

          {/* Toss Announcement Pill Banner */}
          {tossAnnouncement && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-amber-400 text-amber-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl border-2 border-white animate-pulse">
              {tossAnnouncement}
            </div>
          )}

          {/* Invalid Show Warning Banner */}
          {invalidShowMessage && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-2xl border-2 border-amber-300 max-w-sm text-center">
              {invalidShowMessage}
            </div>
          )}

          {/* OPPONENT SEATS RENDERING */}
          {playersMode === 2 ? (
            /* 2-Player Table: Single Opponent at top center matching reference screenshot */
            <div className="flex justify-center pt-0.5 sm:pt-1 z-20 shrink-0">
              <div className="flex flex-col items-center relative">
                {seats[0]?.activeChat && (
                  <div className="absolute -top-7 bg-white text-slate-900 font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-lg z-30 whitespace-nowrap animate-bounce">
                    {seats[0].activeChat}
                  </div>
                )}

                {/* Turn Timer Badges matching screenshot (30 top, remaining bottom) */}
                {currentTurnSeat === 1 && seats[0]?.status === 'PLAYING' && (
                  <div className="absolute -top-2 -left-2 z-20 flex flex-col items-center">
                    <span className="bg-emerald-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded-t-full border border-emerald-400">
                      30
                    </span>
                    <span className="bg-emerald-500 text-white text-[11px] font-black px-1.5 py-0.2 rounded-b-full border border-emerald-300 shadow-md">
                      {turnTimer}
                    </span>
                  </div>
                )}

                {/* Glowing Avatar */}
                <div
                  className={`relative w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full p-0.5 border-2 transition-all ${
                    seats[0]?.status === 'ELIMINATED'
                      ? 'border-red-600 opacity-60 grayscale'
                      : currentTurnSeat === 1
                      ? 'border-emerald-300 ring-4 ring-emerald-400/90 shadow-[0_0_25px_rgba(52,211,153,0.95)] scale-105'
                      : 'border-emerald-500/80 ring-2 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  }`}
                >
                  <img
                    src={seats[0]?.avatar}
                    alt={seats[0]?.name}
                    className="w-full h-full rounded-full object-cover bg-stone-900"
                    referrerPolicy="no-referrer"
                  />
                  {seats[0]?.status === 'ELIMINATED' && (
                    <div className="absolute inset-0 bg-red-950/80 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-red-300 uppercase">OUT</span>
                    </div>
                  )}
                </div>

                {/* Opponent Name Pill */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="bg-black/75 text-white text-[11px] sm:text-xs font-black px-3.5 py-0.5 rounded-full border border-stone-700 shadow-md">
                    {seats[0]?.name}
                  </span>
                  {(gameVariant === 'Pool' || gameVariant === 'Deals') && (
                    <span className="bg-amber-950/90 text-amber-300 border border-amber-500/50 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                      {seats[0]?.cumulativeScore} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 6-Player Table: 5 Opponents across top curve */
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3 px-2 sm:px-6 pt-0.5 z-20 max-w-3xl mx-auto w-full shrink-0">
              {seats.map((seat, idx) => {
                const seatTurnIndex = idx + 1;
                const isThisBotTurn = currentTurnSeat === seatTurnIndex;

                return (
                  <div key={seat.id} className="flex flex-col items-center relative">
                    {seat.activeChat && (
                      <div className="absolute -top-7 bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-lg z-30 whitespace-nowrap animate-bounce">
                        {seat.activeChat}
                      </div>
                    )}

                    {isThisBotTurn && seat.status === 'PLAYING' && (
                      <div className="absolute -top-2 left-0 z-20 flex flex-col items-center">
                        <span className="bg-emerald-900 text-white text-[8px] font-black px-1 py-0.2 rounded-t-md border border-emerald-400">
                          30
                        </span>
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-b-md border border-emerald-300 shadow-md">
                          {turnTimer}
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full p-0.5 border-2 transition-all ${
                        seat.status === 'ELIMINATED'
                          ? 'border-red-600 opacity-60 grayscale'
                          : isThisBotTurn
                          ? 'border-emerald-300 ring-4 ring-emerald-400/90 shadow-[0_0_18px_rgba(52,211,153,0.9)] scale-105'
                          : 'border-emerald-500/60 ring-1 ring-emerald-400/30'
                      }`}
                    >
                      <img
                        src={seat.avatar}
                        alt={seat.name}
                        className="w-full h-full rounded-full object-cover bg-stone-900"
                        referrerPolicy="no-referrer"
                      />

                      {seat.status === 'ELIMINATED' && (
                        <div className="absolute inset-0 bg-red-950/80 rounded-full flex items-center justify-center">
                          <span className="text-[7px] font-black text-red-300 uppercase">OUT</span>
                        </div>
                      )}

                      {seat.isDealer && (
                        <div className="absolute -left-1 top-0 bg-amber-400 text-amber-950 font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-md">
                          D
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-bold text-white mt-0.5 drop-shadow-md truncate max-w-[70px] text-center">
                      {seat.name}
                    </span>
                    {(gameVariant === 'Pool' || gameVariant === 'Deals') && (
                      <span className="text-[9px] font-black text-amber-300 font-mono">
                        {seat.cumulativeScore} pts
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. CENTER TABLE: Wild Joker + Closed Deck + Finish Slot + Open Discard Pile */}
          <div className="my-auto flex items-center justify-center gap-4 sm:gap-7 md:gap-10 z-20 relative py-1">
            {/* Left: Wild Joker + Closed Deck */}
            <div className="relative flex items-center">
              {/* Sideways Wild Joker Card */}
              <div className="w-13 sm:w-15 md:w-18 h-18 sm:h-22 md:h-26 bg-white rounded-lg sm:rounded-xl border-2 border-amber-400 shadow-2xl -rotate-90 transform -mr-6 sm:-mr-8 z-10 flex flex-col justify-between p-1 sm:p-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-black">
                  <span className={getSuitColor(wildJokerSuit)}>{wildJokerRank}</span>
                  <span className="text-amber-600 text-xs">🃏</span>
                </div>
                <div className="text-center font-black text-lg sm:text-xl">
                  <span className={getSuitColor(wildJokerSuit)}>
                    {getSuitSymbol(wildJokerSuit)}
                  </span>
                </div>
                <div className="flex justify-end text-[8px] sm:text-[9px] text-amber-700 font-black tracking-wider">
                  JOKER
                </div>
              </div>

              {/* Closed Deck Stack with Ornate Back */}
              <div
                onClick={handleDrawClosed}
                title="Tap to draw from Closed Deck"
                className={`relative w-13 sm:w-15 md:w-18 h-18 sm:h-22 md:h-26 cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 ${
                  currentTurnSeat === 0 && !hasDrawnCard && !playerDropped && !playerEliminated
                    ? 'ring-4 ring-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.95)] animate-pulse'
                    : 'shadow-2xl'
                }`}
              >
                <CardBackArt />
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-black/85 text-amber-300 font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border border-amber-400/50 shadow-md">
                  {closedDeck.length}
                </span>
              </div>
            </div>

            {/* Middle: FINISH SLOT (Declare) */}
            <div
              onClick={() => {
                if (currentTurnSeat === 0 && selectedCards.length === 1) {
                  handleDeclareShow();
                } else {
                  alert('Select 1 card and tap Finish Slot to DECLARE!');
                }
              }}
              title="Finish Slot (Select 1 card to Declare)"
              className={`w-13 sm:w-15 md:w-18 h-18 sm:h-22 md:h-26 rounded-xl sm:rounded-2xl border-2 border-emerald-500/70 bg-emerald-950/60 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-900/60 hover:border-emerald-300 transition-all p-1 shadow-inner ${
                selectedCards.length === 1 && currentTurnSeat === 0 ? 'ring-3 ring-amber-400 animate-pulse' : ''
              }`}
            >
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-emerald-400 tracking-wider">
                FINISH
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-emerald-400 tracking-wider">
                SLOT
              </span>
              <span className="text-[8px] sm:text-[9px] text-emerald-300/80 font-bold mt-0.5">
                SHOW
              </span>
            </div>

            {/* Right: Open Discard Pile */}
            <div className="relative flex items-center">
              {openDiscardPile.length > 0 ? (
                <div
                  onClick={handleDrawOpen}
                  title="Draw from Open Discard Pile"
                  className={`w-13 sm:w-15 md:w-18 h-18 sm:h-22 md:h-26 bg-white rounded-lg sm:rounded-xl border border-slate-300 shadow-2xl flex flex-col justify-between p-1 sm:p-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all z-10 ${
                    currentTurnSeat === 0 && !hasDrawnCard && !playerDropped && !playerEliminated
                      ? 'ring-3 ring-emerald-400'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm sm:text-base font-black ${getSuitColor(openDiscardPile[0].suit)}`}
                    >
                      {openDiscardPile[0].rank}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black ${getSuitColor(openDiscardPile[0].suit)}`}
                    >
                      {getSuitSymbol(openDiscardPile[0].suit)}
                    </span>
                  </div>

                  <div className="text-center text-xl sm:text-2xl font-black">
                    <span className={getSuitColor(openDiscardPile[0].suit)}>
                      {getSuitSymbol(openDiscardPile[0].suit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold">
                    <span>DISCARD</span>
                    {openDiscardPile[0].rank === wildJokerRank && (
                      <span className="text-amber-600 font-black">🃏</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-13 sm:w-15 md:w-18 h-18 sm:h-22 md:h-26 rounded-lg sm:rounded-xl border-2 border-dashed border-stone-600/70 flex items-center justify-center text-xs text-stone-500 font-bold">
                  EMPTY
                </div>
              )}

              {/* Blue >> Button */}
              <button
                onClick={handleDrawOpen}
                title="Pick from Discard"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-lg -ml-2.5 z-20 transition-transform active:scale-90"
              >
                »
              </button>

              {/* Star Rating Badge matching reference */}
              <div className="absolute -top-5 right-0 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-400 text-[10px] font-black shadow-md whitespace-nowrap">
                <span>★★★★</span>
                <span className="text-white font-mono">9.3</span>
              </div>
            </div>
          </div>

          {/* 4. PLAYER HAND: 13 Large Cards in Meld Groups with Drag-and-Drop & Tap-to-Move */}
          <div
            className="w-full flex justify-center z-20 px-1 sm:px-2 pb-1 shrink-0"
            onTouchMove={handleCardTouchMove}
            onTouchEnd={handleCardTouchEnd}
            onTouchCancel={handleCardTouchCancel}
          >
            <div className="flex items-end justify-center gap-1.5 sm:gap-2.5 md:gap-3.5 max-w-full overflow-x-auto no-scrollbar py-1 px-1">
              {cardGroups.map((group, groupIdx) => {
                const groupStatus = getGroupStatus(group);
                const isHovered =
                  (touchDrag?.isDragging && touchDrag.hoverGroupIdx === groupIdx) ||
                  html5HoverGroupIdx === groupIdx;
                const isAnyCardSelected = selectedCards.length > 0;
                const canMoveSelectedHere =
                  isAnyCardSelected &&
                  !selectedCards.every((sc) => sc.groupIdx === groupIdx);

                return (
                  <div
                    key={groupIdx}
                    data-meld-group={groupIdx}
                    onDragOver={(e) => handleHtml5DragOverGroup(e, groupIdx)}
                    onDragLeave={() => setHtml5HoverGroupIdx(null)}
                    onDrop={(e) => handleHtml5DropGroup(e, groupIdx)}
                    onClick={(e) => {
                      if (canMoveSelectedHere) {
                        e.stopPropagation();
                        executeSelectedCardsMove(groupIdx);
                      }
                    }}
                    className={`flex flex-col items-center rounded-2xl p-1 sm:p-1.5 transition-all select-none shrink-0 relative ${
                      isHovered
                        ? 'bg-amber-900/40 ring-2 ring-amber-400 scale-[1.02] shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                        : canMoveSelectedHere
                        ? 'bg-black/35 ring-1 ring-emerald-400/70 hover:bg-emerald-950/30 cursor-pointer shadow-md'
                        : groupStatus.isValid
                        ? 'bg-black/25 border border-emerald-400/30 shadow-md'
                        : 'bg-black/30 border border-dashed border-red-500/40 shadow-sm'
                    }`}
                  >
                    {/* Tap-to-move quick action button when card(s) from other group are selected */}
                    {canMoveSelectedHere && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          executeSelectedCardsMove(groupIdx);
                        }}
                        className="mb-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-white animate-pulse flex items-center gap-1 z-30"
                      >
                        <span>↓ Move Here</span>
                      </button>
                    )}

                    {/* Cards in this meld group with readable overlap */}
                    <div className="flex -space-x-7 sm:-space-x-9 md:-space-x-11 lg:-space-x-12">
                      {group.map((card, cardIdx) => {
                        const isWild = card.rank === wildJokerRank;
                        const isSelected = isCardSelected(card.id);
                        const isPrintedJoker =
                          card.id.includes('joker') ||
                          (card.points === 0 && card.value === 0) ||
                          card.isJoker;
                        const isLastInGroup = cardIdx === group.length - 1;
                        const suitColor =
                          card.suit === 'hearts' || card.suit === 'diamonds'
                            ? 'text-red-600'
                            : 'text-slate-900';
                        const suitSymbol = getSuitSymbol(card.suit);

                        const cardClassName = `w-[52px] sm:w-[62px] md:w-[72px] lg:w-[82px] h-[78px] sm:h-[94px] md:h-[108px] lg:h-[122px] shrink-0 rounded-lg sm:rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 flex select-none relative ${
                          isSelected
                            ? 'transform -translate-y-4 sm:-translate-y-5 ring-3 ring-amber-400 shadow-2xl z-30'
                            : 'hover:-translate-y-1.5 z-10'
                        } ${
                          isPrintedJoker
                            ? 'bg-[#fef9c3] border-2 border-amber-400 justify-between p-1 sm:p-1.5 shadow-lg'
                            : `bg-white border border-slate-300 flex-col justify-between p-1 sm:p-1.5 shadow-lg ${
                                isWild ? 'ring-2 ring-amber-400/90 bg-amber-50/95' : ''
                              }`
                        }`;

                        if (isPrintedJoker) {
                          return (
                            <div
                              key={card.id}
                              draggable
                              onDragStart={(e) => handleHtml5DragStart(e, card, groupIdx, cardIdx)}
                              onDragEnd={() => {
                                setHtml5DragCard(null);
                                setHtml5HoverGroupIdx(null);
                              }}
                              onTouchStart={(e) => handleCardTouchStart(e, card, groupIdx, cardIdx)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(card.id, groupIdx);
                              }}
                              className={cardClassName}
                            >
                              <div className="flex flex-col justify-around items-center text-red-600 font-black text-[9px] sm:text-[11px] md:text-xs leading-none">
                                <span>J</span>
                                <span>O</span>
                                <span>K</span>
                                <span>E</span>
                                <span>R</span>
                              </div>
                              <div className="flex-1 flex items-center justify-center p-0.5">
                                <JokerClownArt className="w-full h-full max-w-[44px] max-h-[44px] sm:max-w-[54px] sm:max-h-[54px]" />
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => handleHtml5DragStart(e, card, groupIdx, cardIdx)}
                            onDragEnd={() => {
                              setHtml5DragCard(null);
                              setHtml5HoverGroupIdx(null);
                            }}
                            onTouchStart={(e) => handleCardTouchStart(e, card, groupIdx, cardIdx)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(card.id, groupIdx);
                            }}
                            className={cardClassName}
                          >
                            {/* Top Left: Rank and Suit */}
                            <div className="flex flex-col items-start leading-none">
                              <span
                                className={`text-base sm:text-lg md:text-xl font-black ${suitColor}`}
                              >
                                {card.rank}
                              </span>
                              <span
                                className={`text-xs sm:text-sm md:text-base font-black ${suitColor} -mt-0.5`}
                              >
                                {suitSymbol}
                              </span>
                            </div>

                            {/* Center Large Suit Symbol */}
                            <div className="text-center font-black text-xl sm:text-2xl md:text-3xl leading-none">
                              <span className={`${suitColor} opacity-90`}>
                                {suitSymbol}
                              </span>
                            </div>

                            {/* Bottom Corner */}
                            <div className="flex items-center justify-between text-[8px] sm:text-[9px] leading-none">
                              {isWild ? (
                                <span className="bg-amber-400 text-amber-950 font-black px-1 rounded-xs text-[7px] sm:text-[8px] flex items-center gap-0.5 shadow-xs">
                                  <span>🃏</span>
                                  <span>WILD</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">
                                  {card.points}
                                </span>
                              )}

                              {isLastInGroup && (
                                <span
                                  className={`text-[10px] sm:text-xs font-black ${suitColor} -scale-100`}
                                >
                                  {suitSymbol}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Meld Group Status Badge */}
                    <div className="mt-1">
                      {groupStatus.isValid ? (
                        <span
                          className="bg-[#15803d] text-white font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-emerald-400/60"
                        >
                          <span className="text-xs">✔</span>
                          <span>{groupStatus.label}</span>
                        </span>
                      ) : (
                        <span className="bg-[#b91c1c] text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-red-400/60">
                          <span className="text-xs">✖</span>
                          {groupStatus.label && <span>{groupStatus.label}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* + New Group Drop Slot (visible when dragging or when cards are selected) */}
              {(selectedCards.length > 0 || touchDrag?.isDragging || html5DragCard) && (
                <div
                  data-meld-group="new"
                  onDragOver={(e) => handleHtml5DragOverGroup(e, -1)}
                  onDragLeave={() => setHtml5HoverGroupIdx(null)}
                  onDrop={(e) => handleHtml5DropGroup(e, -1)}
                  onClick={() => executeSelectedCardsMove(-1)}
                  className={`w-14 sm:w-16 h-20 sm:h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-1 transition-all cursor-pointer select-none shrink-0 ${
                    touchDrag?.hoverGroupIdx === -1 || html5HoverGroupIdx === -1
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400 scale-105'
                      : 'border-stone-500/60 bg-black/20 text-stone-400 hover:border-amber-400 hover:text-amber-300'
                  }`}
                >
                  <span className="text-base sm:text-lg font-black leading-none">+</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">
                    New Group
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 5. BOTTOM CONTROL BAR */}
          <div className="w-full bg-[#0d121c]/95 border-t border-stone-800/80 px-2 sm:px-4 py-1.5 flex items-center justify-between z-30 shrink-0">
            {/* Left: Mode / Stake Pill + Plus Button */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setShowScoreWindow(true);
                }}
                className="bg-[#15803d] hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md border border-emerald-400/50 active:scale-95 transition-transform"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                <span>
                  {gameVariant === 'Pool'
                    ? `${gameDetail} Pool`
                    : gameVariant === 'Deals'
                    ? `Deal ${currentDeal}/${modeConfig.totalDeals}`
                    : 'Points'}
                </span>
                <span className="text-amber-300 font-mono font-bold">
                  {gameVariant === 'Points' ? `₹${pointValue}` : `₹${entryFee}`}
                </span>
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  setShowScoreWindow(true);
                }}
                className="w-8 h-8 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-amber-300 font-bold flex items-center justify-center text-lg shadow-md active:scale-95 transition-transform"
                title="Table Info"
              >
                +
              </button>
            </div>

            {/* Center: Chips + Player Profile + Score */}
            <div className="flex items-center gap-2 sm:gap-3 relative">
              <div className="bg-black/70 px-3 py-1 rounded-full border border-stone-700/80 flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="text-amber-400 font-bold">🪙</span>
                <span className="font-black text-amber-300 font-mono">
                  {currentUser.depositBalance + currentUser.withdrawalBalance}
                </span>
              </div>

              {/* User Avatar with Dealer Badge and Turn Timer */}
              <div className="relative">
                {playersMode === 2 && (
                  <div className="absolute -left-1.5 top-0 bg-amber-400 text-amber-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md z-20">
                    D
                  </div>
                )}

                <div
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full p-0.5 border-2 transition-all ${
                    playerEliminated
                      ? 'border-red-600 opacity-60 grayscale'
                      : currentTurnSeat === 0 && !playerDropped
                      ? 'border-emerald-400 ring-4 ring-emerald-400/90 shadow-[0_0_18px_rgba(52,211,153,0.9)] scale-105'
                      : 'border-stone-700'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full rounded-full object-cover bg-stone-900"
                    referrerPolicy="no-referrer"
                  />

                  {currentTurnSeat === 0 && !playerDropped && !playerEliminated && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      {turnTimer}
                    </div>
                  )}

                  {playerEliminated && (
                    <div className="absolute inset-0 bg-red-950/80 rounded-full flex items-center justify-center">
                      <span className="text-[8px] font-black text-red-300 uppercase">OUT</span>
                    </div>
                  )}
                </div>

                {playerChatBubble && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-lg z-30 whitespace-nowrap animate-bounce">
                    {playerChatBubble}
                  </div>
                )}
              </div>

              {/* Hand Score & Cumulative Display */}
              <div className="flex flex-col text-xs sm:text-sm font-black text-white">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-300">Score:</span>
                  <span
                    className={`font-mono text-sm sm:text-base font-extrabold ${
                      totalScorePoints === 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {totalScorePoints}
                  </span>
                </div>
                {(gameVariant === 'Pool' || gameVariant === 'Deals') && (
                  <span className="text-[10px] sm:text-xs font-bold text-amber-300/90 font-mono">
                    Total: {userCumulativeScore} pts
                  </span>
                )}
              </div>
            </div>

            {/* Right: Action Buttons (UNDO / DESELECT / GROUP / DISCARD / DROP / AUTO SORT) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Undo Move Button */}
              {moveHistory.length > 0 && (
                <button
                  onClick={handleUndoMove}
                  title="Undo last card move"
                  className="bg-stone-800 hover:bg-stone-700 text-amber-300 font-black text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-xl shadow-md border border-stone-600 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">UNDO</span>
                </button>
              )}

              {/* Deselect Button */}
              {selectedCards.length > 0 && (
                <button
                  onClick={handleDeselectAll}
                  title="Deselect all cards"
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs sm:text-sm px-2.5 py-2 rounded-xl shadow-md border border-stone-600 active:scale-95 transition-all"
                >
                  ✕
                </button>
              )}

              {/* GROUP Button */}
              {selectedCards.length >= 2 && (
                <button
                  onClick={handleGroupCards}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg uppercase active:scale-95 transition-all border border-emerald-400/50"
                >
                  GROUP
                </button>
              )}

              {/* DISCARD Button */}
              {selectedCards.length === 1 &&
                currentTurnSeat === 0 &&
                hasDrawnCard &&
                !playerDropped &&
                !playerEliminated && (
                  <button
                    onClick={handleDiscard}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg uppercase active:scale-95 transition-all animate-pulse border border-amber-300"
                  >
                    DISCARD
                  </button>
                )}

              {/* DROP Button with dynamic penalty */}
              <button
                onClick={handleOpenDropConfirm}
                disabled={playerDropped || playerEliminated}
                className={`text-white font-black text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 rounded-xl shadow-lg uppercase active:scale-95 transition-all leading-tight text-center border ${
                  playerDropped || playerEliminated
                    ? 'bg-stone-700/60 border-stone-600 opacity-50 cursor-not-allowed'
                    : 'bg-[#b91c1c] hover:bg-red-700 border-red-500/60'
                }`}
              >
                <div>{playerDropped ? 'DROPPED' : 'DROP'}</div>
                <div className="text-[10px] sm:text-[11px] font-mono text-amber-300">
                  {playerDropped
                    ? `${userTurnsInRound > 0 ? modeConfig.middleDropPenalty : modeConfig.firstDropPenalty} pts`
                    : `(${currentDropPenalty} pts)`}
                </div>
              </button>

              {/* AUTO SORT Button */}
              <button
                onClick={handleAutoSort}
                className="bg-[#1d4ed8] hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-lg uppercase active:scale-95 transition-all flex items-center gap-1.5 border border-blue-400/50"
              >
                <div className="w-4 h-4 rounded bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs">
                  ✓
                </div>
                <span>AUTO SORT</span>
              </button>
            </div>
          </div>

          {/* Floating Chat Button */}
          <button
            onClick={() => {
              sounds.playCardClick();
              setShowChatDrawer(true);
            }}
            title="Chat & Emojis"
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center shadow-2xl z-30 hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </div>

        {/* DROP CONFIRMATION MODAL */}
        {showDropConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-stone-900 border-2 border-red-500/80 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-black uppercase tracking-wider">
                  CONFIRM DROP ({isMiddleDrop ? 'MIDDLE DROP' : 'FIRST DROP'})
                </h3>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-400">Stage:</span>
                  <span className="font-bold text-amber-300">{isMiddleDrop ? 'Middle Drop' : 'First Drop'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Penalty Points:</span>
                  <span className="font-bold text-red-400 font-mono">+{currentDropPenalty} pts</span>
                </div>
                {gameVariant === 'Pool' && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total after drop:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {userCumulativeScore + currentDropPenalty} / {modeConfig.eliminationThreshold} pts
                    </span>
                  </div>
                )}
                {gameVariant === 'Points' && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Settlement Amount:</span>
                    <span className="font-bold text-red-400 font-mono">₹{(currentDropPenalty * pointValue).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-stone-300 leading-relaxed">
                {gameVariant === 'Points'
                  ? 'Dropping now will end the round and settle your drop penalty points.'
                  : gameVariant === 'Pool'
                  ? `You will sit out the remainder of this round. If your cumulative score remains under ${modeConfig.eliminationThreshold}, you will play in Round ${currentRound + 1}.`
                  : `You will sit out this deal. You will rejoin Deal ${currentDeal + 1} of ${modeConfig.totalDeals}.`}
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDropConfirmModal(false)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmDrop}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl shadow-lg"
                >
                  CONFIRM DROP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROUND COMPLETE MODAL (FOR POOL & DEALS) */}
        {roundCompleteModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-[#6b0b14] via-[#850d18] to-[#45050b] border-2 border-amber-300 text-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  {gameVariant === 'Deals'
                    ? `DEAL ${roundCompleteModalData.deal} OF ${modeConfig.totalDeals} COMPLETED`
                    : `ROUND ${roundCompleteModalData.round} COMPLETED`}
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {roundCompleteModalData.isPlayerWinner
                    ? 'YOU WON THIS HAND!'
                    : `${roundCompleteModalData.winnerName} WON!`}
                </h2>
              </div>

              {/* Standings Table */}
              <div className="bg-stone-950/80 rounded-2xl border border-amber-500/30 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-[10px] font-bold text-stone-400 uppercase">
                      <th className="py-2 px-3">Player</th>
                      <th className="py-2 px-2 text-center">Hand Pts</th>
                      <th className="py-2 px-2 text-center">Total Pts</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {roundCompleteModalData.standings.map((st, idx) => (
                      <tr
                        key={idx}
                        className={st.isPlayer ? 'bg-amber-500/10' : ''}
                      >
                        <td className="py-2 px-3 flex items-center gap-2">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-6 h-6 rounded-full border border-stone-700"
                          />
                          <span className="font-bold text-white max-w-[100px] truncate">
                            {st.name}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-amber-300">
                          {st.roundScore === 0 ? 'WIN (0)' : `+${st.roundScore}`}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-black text-white">
                          {st.cumulativeScore}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              st.isEliminated
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : st.status === 'WON'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : st.status === 'DROPPED'
                                ? 'bg-stone-800 text-stone-300'
                                : 'bg-blue-950 text-blue-300'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Newly Eliminated Notification */}
              {roundCompleteModalData.eliminatedNames && roundCompleteModalData.eliminatedNames.length > 0 && (
                <div className="bg-red-950/70 border border-red-500/50 rounded-xl p-2.5 text-center text-xs text-red-200">
                  <span className="font-bold text-red-400">Eliminated at {modeConfig.eliminationThreshold} pts:</span>{' '}
                  {roundCompleteModalData.eliminatedNames.join(', ')}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleExit}
                  className="py-3 px-4 bg-black/40 hover:bg-black/60 text-white font-extrabold text-xs rounded-xl border border-white/20 active:scale-95 transition-all"
                >
                  LEAVE
                </button>
                <button
                  onClick={handleProceedNextRoundOrDeal}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{roundCompleteModalData.nextActionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE CHAMPION / FINAL WINNER MODAL */}
        {winModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-[#6b0b14] via-[#850d18] to-[#45050b] text-white rounded-3xl max-w-sm w-full p-6 text-center border-2 border-amber-300 shadow-2xl space-y-4">
              <button
                type="button"
                onClick={() => triggerWinConfetti()}
                title="Celebrate!"
                className="w-16 h-16 mx-auto rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center text-3xl shadow-xl animate-bounce cursor-pointer active:scale-95 transition-transform ring-4 ring-amber-300/50"
              >
                🏆
              </button>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                  {winModalData.title}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {winModalData.isPlayer ? 'YOU WON!' : `${winModalData.winnerName} WON!`}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-black/40 px-4 py-1.5 rounded-full border border-amber-400/40 text-lg font-black text-amber-300">
                  <span>Prize: ₹{winModalData.prize.toFixed(2)}</span>
                </div>
              </div>

              {/* Final Breakdown */}
              <div className="bg-black/40 rounded-xl p-3 border border-stone-800 text-xs space-y-1.5 text-left">
                {winModalData.breakdown.map((b, idx) => (
                  <div key={idx} className="flex justify-between items-center text-stone-200">
                    <span className="font-semibold truncate max-w-[150px]">
                      {b.rank ? `#${b.rank} ` : ''}{b.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-400">{b.score} pts</span>
                      {b.won > 0 && (
                        <span className="font-mono font-bold text-emerald-400">+₹{b.won.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setWinModalData(null);
                    initRoundDealing(1, 1);
                    setCurrentRound(1);
                    setCurrentDeal(1);
                    setUserCumulativeScore(0);
                    setUserDealScores([]);
                    setPlayerEliminated(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setWinModalData(null);
                    exitGame();
                  }}
                  className="flex-1 py-3 bg-black/40 hover:bg-black/60 text-white font-extrabold text-xs rounded-xl border border-white/20 active:scale-95 transition-all"
                >
                  LOBBY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. SCORE WINDOW Modal */}
        {showScoreWindow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col border border-slate-300">
              <div className="bg-[#6b0b14] text-white px-4 py-2.5 flex items-center justify-between">
                <span className="w-6" />
                <h2 className="text-base font-black tracking-wider uppercase">
                  SCORE WINDOW ({gameVariant.toUpperCase()} · {playersMode} PLAYERS)
                </h2>
                <button
                  onClick={() => setShowScoreWindow(false)}
                  className="p-1 hover:bg-black/20 rounded-full text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2 px-3">Player</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-center">Hand Pts</th>
                      {(gameVariant === 'Pool' || gameVariant === 'Deals') && (
                        <th className="py-2 px-3 text-center">Total Pts</th>
                      )}
                      {gameVariant === 'Pool' && (
                        <th className="py-2 px-3 text-center">Elim Limit</th>
                      )}
                      <th className="py-2 px-3 text-right">Chips</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="bg-amber-50/50">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <img
                          src={currentUser.avatar}
                          alt="Me"
                          className="w-6 h-6 rounded-full border border-amber-400"
                        />
                        <span className="font-extrabold text-slate-900">
                          {currentUser.username} (You)
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          playerEliminated
                            ? 'bg-red-100 text-red-800'
                            : playerDropped
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {playerEliminated ? 'ELIMINATED' : playerDropped ? 'DROPPED' : 'PLAYING'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-600 font-mono">
                        {totalScorePoints}
                      </td>
                      {(gameVariant === 'Pool' || gameVariant === 'Deals') && (
                        <td className="py-2.5 px-3 text-center font-black text-slate-900 font-mono">
                          {userCumulativeScore}
                        </td>
                      )}
                      {gameVariant === 'Pool' && (
                        <td className="py-2.5 px-3 text-center font-mono text-stone-500">
                          {modeConfig.eliminationThreshold}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right font-black text-amber-700 font-mono">
                        🪙 {currentUser.depositBalance + currentUser.withdrawalBalance}
                      </td>
                    </tr>

                    {seats.map((seat) => (
                      <tr key={seat.id}>
                        <td className="py-2.5 px-3 flex items-center gap-2">
                          <img
                            src={seat.avatar}
                            alt={seat.name}
                            className="w-6 h-6 rounded-full border border-slate-300"
                          />
                          <span className="text-slate-700 font-bold">{seat.name}</span>
                          {seat.isDealer && (
                            <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1 rounded-full">
                              D
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            seat.status === 'ELIMINATED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {seat.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-600 font-mono">
                          -
                        </td>
                        {(gameVariant === 'Pool' || gameVariant === 'Deals') && (
                          <td className="py-2.5 px-3 text-center font-black text-slate-900 font-mono">
                            {seat.cumulativeScore}
                          </td>
                        )}
                        {gameVariant === 'Pool' && (
                          <td className="py-2.5 px-3 text-center font-mono text-stone-500">
                            {modeConfig.eliminationThreshold}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 font-mono">
                          🪙 {seat.chips}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  RNG Certified · Drop Penalty: {modeConfig.firstDropPenalty} pts (1st) / {modeConfig.middleDropPenalty} pts (Mid)
                </span>
                <button
                  onClick={() => setShowScoreWindow(false)}
                  className="bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. TABLE CHAT DRAWER */}
        {showChatDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              onClick={() => setShowChatDrawer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
            />
            <div className="relative w-72 bg-white text-slate-800 h-full p-4 overflow-y-auto no-scrollbar shadow-2xl z-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="font-black text-sm text-slate-900">TABLE CHAT & EMOJIS</h3>
                  <button
                    onClick={() => setShowChatDrawer(false)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 py-3 border-b border-slate-200 text-2xl text-center">
                  {['😊', '😎', '🥳', '😈', '😋', '🥺', '🤨', '😡', '😭', '😴'].map((emo) => (
                    <button
                      key={emo}
                      onClick={() => handleSendChat(emo)}
                      className="p-1.5 hover:bg-slate-100 rounded-xl transition-transform hover:scale-125"
                    >
                      {emo}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-3">
                  {[
                    ['Hi all', 'Bye all'],
                    ['Hurry up', 'Your turn'],
                    ['Nice game'],
                    ['Good job'],
                    ['Thank you'],
                    ['Good luck'],
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2">
                      {row.map((msg) => (
                        <button
                          key={msg}
                          onClick={() => handleSendChat(msg)}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-lg text-center transition-colors"
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center pt-3">
                Master Rummy · 100% Fair Play Real Time
              </p>
            </div>
          </div>
        )}

        {/* 8. IN-GAME MENU DRAWER */}
        {showInGameMenu && (
          <div className="fixed inset-0 z-50 flex">
            <div
              onClick={() => setShowInGameMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-2xs"
            />
            <div className="relative w-64 bg-[#7a0c16] text-white h-full shadow-2xl z-10 flex flex-col justify-between select-none">
              <div className="p-4 border-b border-red-900/60 flex items-center justify-between">
                <h2 className="font-black text-base tracking-wider uppercase">‹ MENU</h2>
                <button
                  onClick={() => setShowInGameMenu(false)}
                  className="p-1 hover:bg-black/20 rounded-full"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>

              <div className="p-3 space-y-2.5 flex-1">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    if (window.confirm('Leave table? Current hand will be folded.')) {
                      handleExit();
                    }
                  }}
                  className="w-full py-3 px-4 bg-[#8b0f19] hover:bg-[#a11522] text-white font-extrabold text-xs rounded-lg flex items-center gap-3 shadow-xs border border-red-500/20 active:scale-95 transition-transform"
                >
                  <LogOut className="w-4 h-4 text-amber-300" />
                  <span>LEAVE TABLE</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setSoundEnabled(!soundEnabled);
                  }}
                  className="w-full py-3 px-4 bg-[#8b0f19] hover:bg-[#a11522] text-white font-extrabold text-xs rounded-lg flex items-center justify-between shadow-xs border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-emerald-300" />
                    <span>SETTINGS</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-300">
                    {soundEnabled ? 'SOUND ON' : 'MUTED'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.playCardClick();
                    alert(
                      `Table #${tableId}\nMode: ${gameVariant} (${gameDetail})\nPlayers: ${playersMode}\nStake: ₹${pointValue}/pt\nDrop Penalty: ${modeConfig.firstDropPenalty} / ${modeConfig.middleDropPenalty}`
                    );
                  }}
                  className="w-full py-3 px-4 bg-[#8b0f19] hover:bg-[#a11522] text-white font-extrabold text-xs rounded-lg flex items-center gap-3 shadow-xs border border-red-500/20"
                >
                  <Info className="w-4 h-4 text-amber-300" />
                  <span>TABLE INFO</span>
                </button>
              </div>

              <div className="p-4 border-t border-red-900/60 text-center text-[10px] text-white/50">
                Master Rummy v2.5.0 · Certified RNG
              </div>
            </div>
          </div>
        )}

      {/* Floating Card Ghost for Mobile Touch Drag */}
      {touchDrag?.isDragging && touchDrag.card && (
        <div
          style={{
            position: 'fixed',
            left: touchDrag.currentX,
            top: touchDrag.currentY,
            transform: 'translate(-50%, -60%) rotate(4deg)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="w-[56px] sm:w-[66px] h-[82px] sm:h-[98px] rounded-lg sm:rounded-xl bg-white border-2 border-amber-400 shadow-2xl p-1 sm:p-1.5 flex flex-col justify-between opacity-95 animate-pulse"
        >
          <div className="flex flex-col items-start leading-none">
            <span
              className={`text-base font-black ${
                touchDrag.card.suit === 'hearts' || touchDrag.card.suit === 'diamonds'
                  ? 'text-red-600'
                  : 'text-slate-900'
              }`}
            >
              {touchDrag.card.rank}
            </span>
            <span
              className={`text-xs font-black ${
                touchDrag.card.suit === 'hearts' || touchDrag.card.suit === 'diamonds'
                  ? 'text-red-600'
                  : 'text-slate-900'
              } -mt-0.5`}
            >
              {getSuitSymbol(touchDrag.card.suit)}
            </span>
          </div>
          <div className="text-center font-black text-xl leading-none">
            <span
              className={
                touchDrag.card.suit === 'hearts' || touchDrag.card.suit === 'diamonds'
                  ? 'text-red-600'
                  : 'text-slate-900'
              }
            >
              {getSuitSymbol(touchDrag.card.suit)}
            </span>
          </div>
          <div className="text-right text-[8px] font-mono text-slate-400">
            {touchDrag.card.points}
          </div>
        </div>
      )}
    </div>
  );
};
