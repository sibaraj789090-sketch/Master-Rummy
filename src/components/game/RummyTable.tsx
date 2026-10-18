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
  RANKS,
} from '../../utils/rummyRules';
import { sounds } from '../../utils/sound';
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
  HelpCircle,
  Check,
  Lock,
  ArrowRight,
  Trophy,
  Maximize2,
  Minimize2,
  Layers,
  Smartphone,
  Repeat,
  Users,
  Database,
  Wifi,
} from 'lucide-react';
import { multiplayerService } from '../../services/multiplayerService';
import { getSupabaseConfig } from '../../lib/supabase';

interface SeatPlayer {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  score: number;
  status: 'PLAYING' | 'DROPPED' | 'WON' | 'EMPTY';
  cardsCount: number;
  isDealer?: boolean;
  activeChat?: string | null;
}

// 2-Player Table Opponent (Matching Screenshot 1)
const TWO_PLAYER_OPPONENT: SeatPlayer = {
  id: 'seat_rohotara',
  name: 'Rohotara',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  chips: 3000,
  score: 0,
  status: 'PLAYING',
  cardsCount: 13,
  isDealer: false,
};

// 6-Player Table Opponents (Matching Screenshot 2: 5 opponents across top oval)
const SIX_PLAYER_OPPONENTS: SeatPlayer[] = [
  {
    id: 'seat_sanjiv',
    name: 'Sanjiv Sa',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    chips: 3000,
    score: 0,
    status: 'PLAYING',
    cardsCount: 13,
    isDealer: false,
  },
  {
    id: 'seat_mahmad',
    name: 'Mahmad Ma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    chips: 4000,
    score: 0,
    status: 'PLAYING',
    cardsCount: 13,
    isDealer: false,
  },
  {
    id: 'seat_madhusuda',
    name: 'Madhusuda',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    chips: 3500,
    score: 0,
    status: 'PLAYING',
    cardsCount: 13,
    isDealer: false,
  },
  {
    id: 'seat_ankit',
    name: 'Ankit Awa',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    chips: 4500,
    score: 0,
    status: 'PLAYING',
    cardsCount: 13,
    isDealer: false,
  },
  {
    id: 'seat_sonelal',
    name: 'Sonelal K',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    chips: 4000,
    score: 0,
    status: 'PLAYING',
    cardsCount: 13,
    isDealer: true,
  },
];

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
  const mySeatIndex = multiplayerPlayer?.seat_index ?? 0;

  // Active Players Mode: 2 Players or 6 Players
  const [playersMode, setPlayersMode] = useState<2 | 6>(
    activeGameConfig?.playersCount === 2 ? 2 : 6
  );

  // Auto-Rotate to Landscape mode when game starts
  const [isLandscape, setIsLandscape] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);

  // Countdown at table start (Screenshot 5: "The game starts in 2s")
  const [countdown, setCountdown] = useState<number>(2);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [tossAnnouncement, setTossAnnouncement] = useState<string | null>(null);

  // Deck & Piles
  const [wildJokerRank, setWildJokerRank] = useState<Rank>('10');
  const [wildJokerSuit, setWildJokerSuit] = useState<Suit>('diamonds');
  const [closedDeck, setClosedDeck] = useState<PlayingCard[]>([]);
  const [openDiscardPile, setOpenDiscardPile] = useState<PlayingCard[]>([]);

  // 13 Cards divided into Groups (as shown in Screenshots 1 & 2: 4 separate meld groups)
  const [cardGroups, setCardGroups] = useState<PlayingCard[][]>([]);

  // Multi-card selection: stores array of { cardId, groupIdx }
  const [selectedCards, setSelectedCards] = useState<{ cardId: string; groupIdx: number }[]>([]);

  // Turn management: 0 = User (ME), 1..N = opponent seats
  const [currentTurnSeat, setCurrentTurnSeat] = useState<number>(
    activeGameConfig?.playersCount === 2 ? 1 : 4 // In 2P, Rohotara starts or in 6P Ankit Awa starts (Screenshot 2)
  );
  const [hasDrawnCard, setHasDrawnCard] = useState<boolean>(false);
  const [turnTimer, setTurnTimer] = useState<number>(30);

  // UI Modals & Drawers from screenshots
  const [showScoreWindow, setShowScoreWindow] = useState<boolean>(false);
  const [showInGameMenu, setShowInGameMenu] = useState<boolean>(false);
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false);
  const [playerChatBubble, setPlayerChatBubble] = useState<string | null>(null);
  const [playerDropped, setPlayerDropped] = useState<boolean>(false);

  // Declaration / Win Modal
  const [winModalData, setWinModalData] = useState<{
    winnerName: string;
    isPlayer: boolean;
    prize: number;
    breakdown: { name: string; score: number; won: number }[];
  } | null>(null);
  const [invalidShowMessage, setInvalidShowMessage] = useState<string | null>(null);

  // Table ID & Stakes
  const tableId = useRef(
    activeGameConfig?.playersCount === 2 ? 1132717034 : 1132656901
  ).current;
  const pointValue = activeGameConfig?.pointValue || 50;
  const entryFee = activeGameConfig?.entryFee || 1000;

  // Active Seats state depending on 2-Player or 6-Player
  const [seats, setSeats] = useState<SeatPlayer[]>(
    activeGameConfig?.playersCount === 2 ? [TWO_PLAYER_OPPONENT] : SIX_PLAYER_OPPONENTS
  );

  // Switch between 2-Player and 6-Player Table
  const handleTogglePlayerMode = (mode: 2 | 6) => {
    sounds.playCardClick();
    setPlayersMode(mode);
    if (mode === 2) {
      setSeats([TWO_PLAYER_OPPONENT]);
      setCurrentTurnSeat(1); // Rohotara's turn (Screenshot 1)
      setWildJokerRank('10');
      setWildJokerSuit('diamonds');
    } else {
      setSeats(SIX_PLAYER_OPPONENTS);
      setCurrentTurnSeat(4); // Ankit Awa's turn (Screenshot 2)
      setWildJokerRank('5');
      setWildJokerSuit('spades');
    }
    setTurnTimer(30);
    setHasDrawnCard(false);
  };

  // Realtime Multiplayer Session Subscription
  useEffect(() => {
    if (!isMultiplayer || !multiplayerSession) return;

    if (multiplayerSession.wild_joker_card) {
      setWildJokerRank(multiplayerSession.wild_joker_card.rank);
      setWildJokerSuit(multiplayerSession.wild_joker_card.suit);
    }
    if (multiplayerSession.discard_pile) {
      setOpenDiscardPile(multiplayerSession.discard_pile);
    }
    setCurrentTurnSeat(multiplayerSession.current_turn_seat ?? 0);

    const unsub = multiplayerService.subscribeToSession(multiplayerSession.id, {
      onSessionChange: (updatedSession) => {
        if (updatedSession.discard_pile) {
          setOpenDiscardPile(updatedSession.discard_pile);
        }
        setCurrentTurnSeat(updatedSession.current_turn_seat);
        setTurnTimer(updatedSession.turn_timer || 30);

        if (updatedSession.status === 'FINISHED' && updatedSession.winner_user_id) {
          const isMe = updatedSession.winner_user_id === currentUser.id;
          const prizeAmount = entryFee * (seats.length + 1) * 0.9;
          setWinModalData({
            winnerName: isMe ? currentUser.username : 'Opponent Player',
            isPlayer: isMe,
            prize: prizeAmount,
            breakdown: [
              { name: currentUser.username, score: isMe ? 0 : 80, won: isMe ? prizeAmount : 0 },
            ],
          });
        }
      },
      onMove: (move) => {
        if (move.move_type === 'DISCARD') {
          sounds.playCardClick();
        } else if (move.move_type?.startsWith('DRAW')) {
          sounds.playCardDeal();
        }
      },
      onFinished: (winnerId) => {
        sounds.playWinFanfare();
        const isMe = winnerId === currentUser.id;
        const prizeAmount = entryFee * (seats.length + 1) * 0.9;
        setWinModalData({
          winnerName: isMe ? currentUser.username : 'Opponent Player',
          isPlayer: isMe,
          prize: prizeAmount,
          breakdown: [
            { name: currentUser.username, score: isMe ? 0 : 80, won: isMe ? prizeAmount : 0 },
          ],
        });
      },
    });

    return () => {
      unsub();
    };
  }, [isMultiplayer, multiplayerSession]);

  // Screen and Device Orientation Tracking
  const [isDevicePortrait, setIsDevicePortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

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

  // Auto-Rotate effect on mount (Requests fullscreen and landscape lock)
  useEffect(() => {
    sounds.playRotate();
    setIsAutoRotating(true);

    try {
      if (typeof document !== 'undefined') {
        const docEl = document.documentElement as any;
        const req =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;
        if (req) {
          req.call(docEl).then(() => {
            try {
              if (screen.orientation && (screen.orientation as any).lock) {
                (screen.orientation as any).lock('landscape').catch(() => {});
              }
            } catch {}
          }).catch(() => {});
        } else if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      }
    } catch {}

    const rotateTimer = setTimeout(() => {
      setIsAutoRotating(false);
    }, 1200);

    return () => {
      clearTimeout(rotateTimer);
      try {
        if (typeof window !== 'undefined' && 'screen' in window && window.screen.orientation) {
          (window.screen.orientation as any).unlock?.();
        }
      } catch {}
    };
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    const is2P = playersMode === 2;
    const initialJokerRank: Rank = is2P ? '10' : '5';
    const initialJokerSuit: Suit = is2P ? 'diamonds' : 'spades';
    setWildJokerRank(initialJokerRank);
    setWildJokerSuit(initialJokerSuit);

    // Create 2 decks
    const deck = shuffleCards(createDeck(2, initialJokerRank));

    // Deal 13 cards to player (customized to closely match user screenshots)
    const dealtPlayer = deck.splice(0, 13);

    // Group cards into 4 authentic meld groups (as shown in Screenshots 1 & 2)
    const g1 = dealtPlayer.slice(0, 3);
    const g2 = dealtPlayer.slice(3, 7);
    const g3 = dealtPlayer.slice(7, 10);
    const g4 = dealtPlayer.slice(10, 13);
    setCardGroups([g1, g2, g3, g4]);

    // Top open discard card
    const firstOpen: PlayingCard = is2P
      ? { id: 'disc_6s', rank: '6', suit: 'spades', value: 6, points: 6 }
      : { id: 'disc_jh', rank: 'J', suit: 'hearts', value: 11, points: 10, isJoker: true };

    setOpenDiscardPile([firstOpen]);
    setClosedDeck(deck);

    // Countdown from 2s (Screenshot 5: "The game starts in 2s")
    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countTimer);
          setGameStarted(true);
          sounds.playCardDeal();
          const dealerName = is2P ? 'You' : 'Sonelal K (D)';
          setTossAnnouncement(`Toss: ${dealerName} is Dealer. Game Started!`);
          setTimeout(() => setTossAnnouncement(null), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countTimer);
  }, []);

  // Real-Time Turn Timer Loop (Counts down from 30s)
  useEffect(() => {
    if (!gameStarted || playerDropped || winModalData) return;

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
  }, [gameStarted, currentTurnSeat, hasDrawnCard, playerDropped, winModalData, seats.length]);

  // Real-Time Bot / Opponent Turn Simulator
  useEffect(() => {
    if (!gameStarted || currentTurnSeat === 0 || playerDropped || winModalData) return;
    if (isMultiplayer) return; // In real multiplayer, real opponent plays turn via Supabase Realtime!

    const botIndex = currentTurnSeat - 1;
    const bot = seats[botIndex];
    if (!bot || bot.status !== 'PLAYING') {
      advanceTurn();
      return;
    }

    // Bot "Thinking" period -> draws card -> discards -> advances turn
    const thinkDelay = setTimeout(() => {
      sounds.playCardDeal();
      // Bot picks card from closed deck or discard pile
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

      // After 1.5s, Bot discards to discard pile
      setTimeout(() => {
        sounds.playCardClick();
        setOpenDiscardPile((prev) => [botDrawnCard, ...prev]);

        // 20% chance of friendly in-game chat bubble
        if (Math.random() < 0.2) {
          triggerBotChat(
            botIndex,
            ['Nice move', 'Good luck', 'Hurry up', 'Play fast'][Math.floor(Math.random() * 4)]
          );
        }

        advanceTurn();
      }, 1500);
    }, 1800);

    return () => clearTimeout(thinkDelay);
  }, [currentTurnSeat, gameStarted, playerDropped, winModalData, seats.length, isMultiplayer]);

  const advanceTurn = () => {
    setHasDrawnCard(false);
    setSelectedCards([]);
    setTurnTimer(30);
    const totalPlayers = seats.length + 1; // 0 is User, 1..seats.length are opponents
    setCurrentTurnSeat((prev) => (prev + 1) % totalPlayers);
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
    if (hasDrawnCard) {
      alert("You have already drawn a card! Please discard one card.");
      return;
    }

    if (isMultiplayer && multiplayerSession) {
      const res = await multiplayerService.drawCard(multiplayerSession.id, currentUser.id, 'CLOSED');
      if (res.success && res.drawnCard) {
        sounds.playCardDeal();
        setCardGroups((prev) => {
          const copy = [...prev];
          copy[0] = [...copy[0], res.drawnCard!];
          return copy;
        });
        setHasDrawnCard(true);
        return;
      }
    }

    if (closedDeck.length === 0) return;

    sounds.playCardDeal();
    const [card, ...rest] = closedDeck;
    setClosedDeck(rest);

    // Add to first group
    setCardGroups((prev) => {
      const copy = [...prev];
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
    if (hasDrawnCard) {
      alert("You have already drawn a card! Please discard one card.");
      return;
    }

    if (isMultiplayer && multiplayerSession) {
      const res = await multiplayerService.drawCard(multiplayerSession.id, currentUser.id, 'OPEN');
      if (res.success && res.drawnCard) {
        sounds.playCardDeal();
        setOpenDiscardPile((prev) => prev.slice(1));
        setCardGroups((prev) => {
          const copy = [...prev];
          copy[0] = [...copy[0], res.drawnCard!];
          return copy;
        });
        setHasDrawnCard(true);
        return;
      }
    }

    if (openDiscardPile.length === 0) return;

    sounds.playCardDeal();
    const [card, ...rest] = openDiscardPile;
    setOpenDiscardPile(rest);

    // Add to first group
    setCardGroups((prev) => {
      const copy = [...prev];
      copy[0] = [...copy[0], card];
      return copy;
    });
    setHasDrawnCard(true);
  };

  // Toggle selection of a card
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
    const discardedCard = group.find((c) => c.id === cardId);
    if (!discardedCard) return;

    sounds.playCardClick();

    // Remove from group
    setCardGroups((prev) => {
      const copy = prev.map((g, idx) =>
        idx === groupIdx ? g.filter((c) => c.id !== cardId) : g
      );
      return copy.filter((g) => g.length > 0);
    });

    // Add to discard pile
    setOpenDiscardPile((prev) => [discardedCard, ...prev]);

    if (isMultiplayer && multiplayerSession) {
      await multiplayerService.discardCard(
        multiplayerSession.id,
        currentUser.id,
        discardedCard,
        seats.length + 1
      );
    }

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
    const selectedIds = new Set(selectedCards.map((sc) => sc.cardId));
    const groupedCards: PlayingCard[] = [];

    // Extract selected cards
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

    // Append new grouped cards as separate meld group
    newGroups.push(groupedCards);
    setCardGroups(newGroups);
    setSelectedCards([]);
  };

  // Auto-Sort Cards into valid Pure Sequences, Impure Sequences, Sets & Ungrouped
  const handleAutoSort = () => {
    sounds.playCardClick();
    const allCards = cardGroups.flat();
    const sortedGroups = autoSortHand(allCards, wildJokerRank);
    setCardGroups(sortedGroups);
    setSelectedCards([]);
  };

  // Drop Hand (Penalty 20 points)
  const handleDrop = () => {
    sounds.playCardClick();
    if (
      window.confirm(
        `Are you sure you want to DROP? First drop penalty is 20 points (₹${
          pointValue * 20
        }).`
      )
    ) {
      setPlayerDropped(true);
      sounds.playBell();
      alert(`You have dropped this round. Penalty: 20 points.`);
      exitGame();
    }
  };

  // Declare / Show Hand
  const handleDeclareShow = () => {
    if (currentTurnSeat !== 0) {
      alert("You can only declare on your turn!");
      return;
    }

    // Check Rummy Rules:
    const pureSeqCount = cardGroups.filter((g) => isPureSequence(g)).length;
    const impureSeqCount = cardGroups.filter((g) =>
      isImpureSequence(g, wildJokerRank)
    ).length;
    const setsCount = cardGroups.filter((g) => isValidSet(g, wildJokerRank)).length;

    const totalValid = pureSeqCount + impureSeqCount + setsCount;

    if (pureSeqCount >= 1 && pureSeqCount + impureSeqCount >= 2 && totalValid >= 3) {
      // Valid Show!
      sounds.playWinFanfare();
      const prizeAmount = entryFee * (seats.length + 1) * 0.9;
      settleGameWin(prizeAmount);

      setWinModalData({
        winnerName: currentUser.username,
        isPlayer: true,
        prize: prizeAmount,
        breakdown: [
          { name: `${currentUser.username} (You)`, score: 0, won: prizeAmount },
          ...seats.map((s) => ({
            name: s.name,
            score: Math.floor(Math.random() * 40) + 20,
            won: 0,
          })),
        ],
      });
    } else {
      // Invalid Show Penalty: 80 points
      sounds.playBell();
      setInvalidShowMessage(
        "Invalid Show! Indian Rummy requires at least 1 Pure Sequence + 1 Second Sequence."
      );
      setTimeout(() => setInvalidShowMessage(null), 4000);
    }
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

  // Toggle Landscape vs Portrait with hardware lock
  const handleToggleOrientation = async () => {
    sounds.playRotate();
    const nextVal = !isLandscape;
    setIsLandscape(nextVal);

    if (nextVal) {
      try {
        const docEl = document.documentElement as any;
        const req =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;
        if (req) {
          await req.call(docEl);
        }
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch {}
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch {}
    }
  };

  const handleExit = () => {
    sounds.playCardClick();
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    } catch {}
    exitGame();
  };

  // Group validation helper
  const getGroupStatus = (group: PlayingCard[]) => {
    if (isPureSequence(group)) {
      return { label: 'Pure Seq', isValid: true, points: 0 };
    }
    if (isImpureSequence(group, wildJokerRank)) {
      return { label: 'Impure Seq', isValid: true, points: 0 };
    }
    if (isValidSet(group, wildJokerRank)) {
      return { label: 'Set', isValid: true, points: 0 };
    }

    const points = group.reduce(
      (acc, c) => (c.rank === wildJokerRank || c.isJoker ? acc : acc + c.points),
      0
    );
    return { label: `Invalid(${points})`, isValid: false, points };
  };

  // Score Points: Screenshot 1 shows 73, Screenshot 2 shows 80
  const totalScorePoints = Math.min(
    80,
    cardGroups.reduce((acc, group) => {
      const status = getGroupStatus(group);
      return acc + (status.isValid ? 0 : status.points);
    }, 0)
  );

  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case 'spades':
        return '♠';
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
    }
  };

  const getSuitColor = (suit: Suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-slate-900';
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.some((sc) => sc.cardId === cardId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a] text-white flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {/* 🔄 AUTO-ROTATE OVERLAY ANIMATION */}
      {isAutoRotating && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-fade-in pointer-events-none">
          <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 animate-ping" />
            <div className="w-16 h-16 rounded-2xl border-4 border-amber-400 bg-amber-500/10 flex items-center justify-center shadow-2xl animate-spin">
              <Repeat className="w-8 h-8 text-amber-300" />
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-amber-300">
            REAL TIME GAME STARTED
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            {playersMode === 2 ? '2-Player Table' : '6-Player Table'} Landscape...
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xs">
            Auto-rotating table into wide horizontal casino view ↔
          </p>
        </div>
      )}

      {/* Main Container Shell: Automatically Landscape or Portrait if toggled */}
      <div
        style={
          isDevicePortrait && isLandscape && !isFullWidth
            ? {
                position: 'fixed',
                width: '100vh',
                height: '100vw',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
                transformOrigin: 'center center',
                zIndex: 40,
                maxWidth: 'none',
                maxHeight: 'none',
              }
            : {}
        }
        className={`w-full flex flex-col justify-between overflow-hidden relative shadow-2xl transition-all duration-300 ease-in-out ${
          isFullWidth
            ? 'h-full max-w-none'
            : isLandscape
            ? 'max-w-[960px] h-[96vh] md:h-[490px] md:rounded-[36px] md:border-[8px] md:border-stone-800 md:ring-2 md:ring-stone-700'
            : 'max-w-[420px] h-full md:h-[844px] md:rounded-[40px] md:border-[10px] md:border-stone-800'
        }`}
      >
        {/* 1. In-Game Top Bar */}
        <div className="bg-[#18191d] px-3 py-1.5 flex items-center justify-between text-xs border-b border-stone-800 z-30 shrink-0">
          {/* Left Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playCardClick();
                setShowInGameMenu(true);
              }}
              title="Menu"
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 transition-colors active:scale-95"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playCardClick();
                setShowScoreWindow(true);
              }}
              title="Score Window"
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 transition-colors active:scale-95"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* 👥 Real-Time Mode Switcher: 2-Player vs 6-Player (Requested Feature) */}
            <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => handleTogglePlayerMode(2)}
                className={`px-2 py-1 rounded text-[10px] font-black transition-all flex items-center gap-1 ${
                  playersMode === 2
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>2P</span>
              </button>
              <button
                onClick={() => handleTogglePlayerMode(6)}
                className={`px-2 py-1 rounded text-[10px] font-black transition-all flex items-center gap-1 ${
                  playersMode === 6
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>6P</span>
              </button>
            </div>

            {/* 🔄 Auto-Rotate Toggle Button */}
            <button
              onClick={handleToggleOrientation}
              title={`Switch to ${isLandscape ? 'Portrait' : 'Landscape'} mode`}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                isLandscape
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Smartphone
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  isLandscape ? 'rotate-90 text-stone-950' : 'text-amber-300'
                }`}
              />
              <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
            </button>
          </div>

          {/* Center: Table ID, Game Type, Value, Signal (Matching Screenshots 1 & 2) */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-300">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
              <span className="font-mono text-stone-300">{tableId}</span>
            </div>

            <span className="text-stone-600">|</span>
            <span className="text-stone-200 font-bold hidden xs:inline">
              Points Rummy
            </span>
            <span className="text-stone-600 hidden xs:inline">|</span>

            <div className="flex items-center gap-1">
              <span>Value:</span>
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[9px] font-bold">
                🪙
              </span>
              <span className="font-bold text-amber-300 font-mono">{pointValue}</span>
            </div>

            {/* Cellular Signal Icon */}
            <div className="flex items-end gap-0.5 h-3 ml-1" title="Signal: Excellent">
              <div className="w-0.5 h-1.5 bg-emerald-400 rounded-2xs" />
              <div className="w-0.5 h-2 bg-emerald-400 rounded-2xs" />
              <div className="w-0.5 h-2.5 bg-emerald-400 rounded-2xs" />
              <div className="w-0.5 h-3 bg-emerald-400 rounded-2xs" />
            </div>
          </div>

          {/* Right: Exit / Switch Table */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExit}
              title="Leave Table"
              className="px-2.5 py-1 rounded-md bg-red-900/50 hover:bg-red-800 text-red-200 text-[11px] font-black border border-red-700/50 transition-colors"
            >
              Exit
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                handleTogglePlayerMode(playersMode === 2 ? 6 : 2);
              }}
              title="Switch Table Mode"
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 transition-colors active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Main Oval Rummy Felt Table Arena */}
        <div className="flex-1 relative felt-table felt-wood-border flex flex-col justify-between p-2 sm:p-3 overflow-hidden">
          {/* Countdown Overlay (Screenshot 5: "The game starts in 2s") */}
          {!gameStarted && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-2xs">
              <div className="bg-black/85 border-2 border-amber-400/80 px-6 py-4 rounded-2xl shadow-2xl text-center animate-bounce">
                <span className="text-xs text-amber-300 uppercase tracking-widest font-black">
                  TABLE MATCHED ({playersMode} PLAYERS)
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
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-amber-400 text-amber-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl border-2 border-white animate-pulse">
              {tossAnnouncement}
            </div>
          )}

          {/* Invalid Show Warning Banner */}
          {invalidShowMessage && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-2xl border-2 border-amber-300 max-w-sm text-center">
              {invalidShowMessage}
            </div>
          )}

          {/* OPPONENT SEATS RENDERING */}
          {/* MODE 1: 2-PLAYER TABLE (Matching Screenshot 1: Single Opponent 'Rohotara' at top center) */}
          {playersMode === 2 ? (
            <div className="flex justify-center pt-1 z-20">
              <div className="flex flex-col items-center relative">
                {seats[0]?.activeChat && (
                  <div className="absolute -top-7 bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-lg z-30 whitespace-nowrap animate-bounce">
                    {seats[0].activeChat}
                  </div>
                )}

                {/* Turn Timer Badge (Stacked 30 & seconds countdown as seen in Screenshot 1) */}
                {currentTurnSeat === 1 && (
                  <div className="absolute -top-3.5 left-0 z-20 flex flex-col items-center">
                    <span className="bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.2 rounded-t-md leading-tight border border-emerald-400">
                      30
                    </span>
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-b-md leading-tight border border-emerald-300 shadow-md">
                      {turnTimer}
                    </span>
                  </div>
                )}

                {/* Card Back Stack directly on top of opponent avatar (Screenshot 1) */}
                <div className="w-8 h-10 bg-gradient-to-br from-amber-700 to-amber-950 rounded-sm border border-yellow-300/80 shadow-md flex items-center justify-center -mb-2 z-10">
                  <div className="w-5 h-7 border border-amber-400/60 rounded-xs flex items-center justify-center">
                    <span className="text-amber-300 text-xs font-black">♠</span>
                  </div>
                </div>

                {/* Avatar with circular turn ring */}
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 border-2 transition-all ${
                    currentTurnSeat === 1
                      ? 'border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.9)] scale-105'
                      : 'border-stone-700'
                  }`}
                >
                  <img
                    src={seats[0]?.avatar}
                    alt={seats[0]?.name}
                    className="w-full h-full rounded-full object-cover bg-stone-900"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Opponent Name Pill */}
                <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 border border-stone-700 shadow-sm">
                  {seats[0]?.name}
                </span>
              </div>
            </div>
          ) : (
            /* MODE 2: 6-PLAYER TABLE (Matching Screenshot 2: 5 Opponents spread across top oval curve) */
            <div
              className={`grid grid-cols-5 gap-2 px-2 sm:px-6 pt-1 z-20 ${
                isLandscape ? 'max-w-3xl mx-auto w-full' : ''
              }`}
            >
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

                    {/* Turn Timer Badge (Stacked 30 & seconds countdown as seen in Screenshot 2 on Ankit Awa) */}
                    {isThisBotTurn && (
                      <div className="absolute -top-2 left-0 z-20 flex flex-col items-center">
                        <span className="bg-emerald-700 text-white text-[8px] font-black px-1.5 py-0.2 rounded-t-md leading-tight border border-emerald-400">
                          30
                        </span>
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-b-md leading-tight border border-emerald-300 shadow-md">
                          {turnTimer}
                        </span>
                      </div>
                    )}

                    {/* Avatar with circular turn ring */}
                    <div
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 border-2 transition-all ${
                        isThisBotTurn
                          ? 'border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-105'
                          : 'border-stone-700'
                      }`}
                    >
                      <img
                        src={seat.avatar}
                        alt={seat.name}
                        className="w-full h-full rounded-full object-cover bg-stone-900"
                        referrerPolicy="no-referrer"
                      />

                      {/* Golden Dealer 'D' Coin (on Sonelal K in Screenshot 2) */}
                      {seat.isDealer && (
                        <div className="absolute -left-1.5 top-1 bg-amber-400 text-amber-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md">
                          D
                        </div>
                      )}
                    </div>

                    {/* Opponent Name Pill */}
                    <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md truncate max-w-[70px] text-center">
                      {seat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. CENTER TABLE: Wild Joker + Closed Deck + Finish Slot + Open Discard Pile */}
          <div className="my-auto flex items-center justify-center gap-4 sm:gap-7 z-20 relative">
            {/* Left: Wild Joker + Closed Deck */}
            <div className="relative flex items-center">
              {/* Sideways Wild Joker Card */}
              <div className="w-12 h-16 sm:w-14 sm:h-20 bg-amber-50 rounded-lg border border-amber-300 shadow-xl -rotate-90 transform -mr-5 z-10 flex flex-col justify-between p-1">
                <div className="flex items-center justify-between text-[11px] font-black">
                  <span className={getSuitColor(wildJokerSuit)}>{wildJokerRank}</span>
                  <span className="text-amber-600 text-[10px]">🃏</span>
                </div>
                <div className="text-center font-black text-sm">
                  <span className={getSuitColor(wildJokerSuit)}>
                    {getSuitSymbol(wildJokerSuit)}
                  </span>
                </div>
                <div className="flex justify-end text-[9px] text-amber-700 font-black">
                  JOKER
                </div>
              </div>

              {/* Closed Deck Stack (Click to draw card) */}
              <div
                onClick={handleDrawClosed}
                title="Tap to draw from Closed Deck"
                className={`relative w-12 h-16 sm:w-14 sm:h-20 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 rounded-lg border-2 border-yellow-300/80 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 flex flex-col items-center justify-center ${
                  currentTurnSeat === 0 && !hasDrawnCard ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                <div className="w-9 h-13 sm:w-11 sm:h-16 border border-amber-400/60 rounded flex flex-col items-center justify-center text-center p-0.5">
                  <span className="text-amber-200 text-lg">♠</span>
                  <span className="text-[8px] text-amber-300 font-extrabold uppercase">
                    RUMMY
                  </span>
                </div>

                {/* Remaining Cards Badge */}
                <span className="absolute -bottom-2 bg-black/80 text-amber-300 font-mono text-[9px] px-1.5 py-0.2 rounded-full border border-amber-400/40">
                  {closedDeck.length}
                </span>
              </div>
            </div>

            {/* Middle: FINISH SLOT */}
            <div
              onClick={() => {
                if (currentTurnSeat === 0 && selectedCards.length === 1) {
                  handleDeclareShow();
                } else {
                  alert("Select 1 card and tap Finish Slot to DECLARE!");
                }
              }}
              title="Finish Slot (Select 1 card to Declare)"
              className="w-14 h-18 sm:w-16 sm:h-22 rounded-xl border-2 border-emerald-600/70 bg-emerald-950/40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-900/50 hover:border-emerald-400 transition-all p-1 shadow-inner"
            >
              <span className="text-[10px] font-black text-emerald-400 tracking-wider">
                FINISH
              </span>
              <span className="text-[10px] font-black text-emerald-400 tracking-wider">
                SLOT
              </span>
            </div>

            {/* Right: Open Discard Pile + Blue >> Prompt + Star Rating */}
            <div className="relative flex items-center">
              {openDiscardPile.length > 0 ? (
                <div
                  onClick={handleDrawOpen}
                  title="Draw from Open Discard Pile"
                  className={`w-12 h-16 sm:w-14 sm:h-20 bg-white rounded-lg border border-slate-300 shadow-2xl flex flex-col justify-between p-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all z-10 ${
                    currentTurnSeat === 0 && !hasDrawnCard ? 'ring-2 ring-emerald-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black ${getSuitColor(openDiscardPile[0].suit)}`}
                    >
                      {openDiscardPile[0].rank}
                    </span>
                    <span
                      className={`text-xs ${getSuitColor(openDiscardPile[0].suit)}`}
                    >
                      {getSuitSymbol(openDiscardPile[0].suit)}
                    </span>
                  </div>

                  <div className="text-center text-lg font-black">
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
                <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg border-2 border-dashed border-stone-600/70 flex items-center justify-center text-[10px] text-stone-500 font-bold">
                  EMPTY
                </div>
              )}

              {/* Blue >> Button on discard pile (Directly matching Screenshots 1 & 2) */}
              <button
                onClick={handleDrawOpen}
                title="Pick from Discard"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center font-black text-xs shadow-md -ml-2 z-20 transition-transform active:scale-90"
              >
                »
              </button>

              {/* Star Rating from Screenshots: ★★★☆☆ 3.3 in 2P, ★☆☆☆☆ 0.1 in 6P */}
              <div className="absolute -right-22 sm:-right-24 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-stone-300">
                <span className="text-amber-400">
                  {playersMode === 2 ? '★★★☆☆' : '★☆☆☆☆'}
                </span>
                <span className="text-stone-400 font-mono text-[10px]">
                  {playersMode === 2 ? '3.3' : '0.1'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. PLAYER HAND: 13 Cards in 4 distinct meld groups (Matching Screenshots 1 & 2) */}
          <div className="w-full flex justify-center px-1 sm:px-4 z-20">
            <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3 max-w-full">
              {cardGroups.map((group, groupIdx) => {
                const groupStatus = getGroupStatus(group);

                return (
                  <div key={groupIdx} className="flex flex-col items-center">
                    {/* Cards in this meld group */}
                    <div className="flex -space-x-4 sm:-space-x-5">
                      {group.map((card) => {
                        const isWild = card.rank === wildJokerRank;
                        const isSelected = isCardSelected(card.id);

                        return (
                          <div
                            key={card.id}
                            onClick={() => handleCardClick(card.id, groupIdx)}
                            className={`w-11 h-16 sm:w-13 sm:h-19 rounded-md sm:rounded-lg bg-white border cursor-pointer transition-all duration-150 flex flex-col justify-between p-1 shadow-md ${
                              isSelected
                                ? 'transform -translate-y-4 ring-2 ring-amber-400 shadow-xl'
                                : 'hover:-translate-y-1'
                            } ${
                              isWild
                                ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-400/50'
                                : 'border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between leading-none">
                              <span
                                className={`text-xs sm:text-sm font-black ${getSuitColor(
                                  card.suit
                                )}`}
                              >
                                {card.rank}
                              </span>
                              <span
                                className={`text-[10px] ${getSuitColor(card.suit)}`}
                              >
                                {getSuitSymbol(card.suit)}
                              </span>
                            </div>

                            <div className="text-center font-black text-sm sm:text-base leading-none">
                              <span className={getSuitColor(card.suit)}>
                                {getSuitSymbol(card.suit)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[8px] leading-none">
                              {isWild ? (
                                <span className="bg-amber-400 text-amber-950 font-black px-1 rounded-2xs text-[7px]">
                                  🃏 JOKER
                                </span>
                              ) : (
                                <span className="text-stone-400 font-mono">
                                  {card.points}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Meld Group Status Badge (Matching Screenshot red "✖ Invalid(points)") */}
                    <div className="mt-1">
                      {groupStatus.isValid ? (
                        <span className="bg-emerald-600/90 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-emerald-400">
                          <span>✔</span>
                          <span>{groupStatus.label}</span>
                        </span>
                      ) : (
                        <span className="bg-[#b91c1c]/95 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-red-400">
                          <span className="text-[10px]">✖</span>
                          <span>{groupStatus.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. BOTTOM CONTROL BAR (Directly matching Screenshots 1 & 2) */}
          <div className="w-full bg-[#18191d]/95 border-t border-stone-800 px-2 sm:px-4 py-1.5 flex items-center justify-between z-30 shrink-0">
            {/* Left: Points Pill Button + Plus Button */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setShowScoreWindow(true);
                }}
                className="bg-[#15803d] hover:bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md border border-emerald-500/50"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                <span>Points</span>
                <span className="text-amber-300 font-mono text-[11px]">🪙 {pointValue}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  alert(`Table Stake: ₹${pointValue} per point\nPlayers: ${playersMode}`);
                }}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>

            {/* Center: Chips + Dealer Coin + User Avatar + Turn Timer + Score */}
            <div className="flex items-center gap-2 relative">
              {/* Chips Display (Screenshot 1: 3000, Screenshot 2: 4000) */}
              <div className="bg-black/60 px-2.5 py-1 rounded-lg border border-stone-700 flex items-center gap-1 text-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-[9px]">
                  🪙
                </span>
                <span className="font-black text-amber-300 font-mono">
                  {playersMode === 2 ? 3000 : 4000}
                </span>
              </div>

              {/* User Avatar with Dealer Coin & Active Turn Timer Ring */}
              <div className="relative">
                {/* Dealer Coin 'D' on user (Screenshot 1 has 'D' on user) */}
                {playersMode === 2 && (
                  <div className="absolute -left-1.5 top-1 bg-amber-400 text-amber-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md z-20">
                    D
                  </div>
                )}

                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 border-2 transition-all ${
                    currentTurnSeat === 0
                      ? 'border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-105'
                      : 'border-stone-700'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full rounded-full object-cover bg-stone-900"
                    referrerPolicy="no-referrer"
                  />

                  {/* Active Turn Seconds Countdown */}
                  {currentTurnSeat === 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {turnTimer}
                    </div>
                  )}
                </div>

                {/* Player Chat Bubble */}
                {playerChatBubble && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-lg z-30 whitespace-nowrap animate-bounce">
                    {playerChatBubble}
                  </div>
                )}
              </div>

              {/* Score Display: Real dynamically computed penalty points */}
              <div className="text-xs font-black text-stone-200">
                Score: <span className={`font-mono ${totalScorePoints === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{totalScorePoints}</span>
              </div>
            </div>

            {/* Right: Action Buttons (DISCARD / GROUP / DROP / AUTO SORT) */}
            <div className="flex items-center gap-1.5">
              {/* GROUP Button (Shows when 2 or more cards selected) */}
              {selectedCards.length >= 2 && (
                <button
                  onClick={handleGroupCards}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-2.5 py-1.5 rounded-lg shadow-md uppercase active:scale-95 transition-all"
                >
                  GROUP
                </button>
              )}

              {/* DISCARD Button (Shows when 1 card selected and user has drawn) */}
              {selectedCards.length === 1 && currentTurnSeat === 0 && hasDrawnCard && (
                <button
                  onClick={handleDiscard}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-2.5 py-1.5 rounded-lg shadow-md uppercase active:scale-95 transition-all animate-pulse"
                >
                  DISCARD
                </button>
              )}

              {/* DROP 1000 Button */}
              <button
                onClick={handleDrop}
                disabled={playerDropped}
                className="bg-[#b91c1c] hover:bg-red-700 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md uppercase active:scale-95 transition-all leading-tight text-center"
              >
                <div>DROP</div>
                <div className="text-[9px] font-mono text-amber-300">{entryFee}</div>
              </button>

              {/* AUTO SORT Button */}
              <button
                onClick={handleAutoSort}
                className="bg-[#1d4ed8] hover:bg-blue-700 text-white font-black text-xs px-2.5 py-1.5 rounded-lg shadow-md uppercase active:scale-95 transition-all flex items-center gap-1"
              >
                <div className="w-3.5 h-3.5 rounded bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-black">
                  ✓
                </div>
                <span>AUTO SORT</span>
              </button>
            </div>
          </div>

          {/* Floating Chat Icon (Right side) */}
          <button
            onClick={() => {
              sounds.playCardClick();
              setShowChatDrawer(true);
            }}
            title="Chat & Emojis"
            className="fixed right-3 bottom-18 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center shadow-2xl z-30 hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        {/* 6. In-Game Chat & Emoji Drawer */}
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

        {/* 7. In-Game Menu Drawer */}
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
                    setShowInGameMenu(false);
                    handleTogglePlayerMode(playersMode === 2 ? 6 : 2);
                  }}
                  className="w-full py-3 px-4 bg-[#8b0f19] hover:bg-[#a11522] text-white font-extrabold text-xs rounded-lg flex items-center gap-3 shadow-xs border border-red-500/20 active:scale-95 transition-transform"
                >
                  <Users className="w-4 h-4 text-amber-300" />
                  <span>SWITCH TO {playersMode === 2 ? '6 PLAYERS' : '2 PLAYERS'}</span>
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
                      `Table #${tableId}\nPlayers: ${playersMode}\nStake: ₹${pointValue}/pt\nMax Drop Penalty: 20 pts`
                    );
                  }}
                  className="w-full py-3 px-4 bg-[#8b0f19] hover:bg-[#a11522] text-white font-extrabold text-xs rounded-lg flex items-center gap-3 shadow-xs border border-red-500/20"
                >
                  <Info className="w-4 h-4 text-amber-300" />
                  <span>TABLE INFO</span>
                </button>
              </div>

              <div className="p-4 border-t border-red-900/60 text-center text-[10px] text-white/50">
                Master Rummy v2.4.9 · Certified RNG
              </div>
            </div>
          </div>
        )}

        {/* 8. SCORE WINDOW Modal */}
        {showScoreWindow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col border border-slate-300">
              <div className="bg-[#6b0b14] text-white px-4 py-2.5 flex items-center justify-between">
                <span className="w-6" />
                <h2 className="text-base font-black tracking-wider uppercase">
                  SCORE WINDOW ({playersMode} PLAYERS)
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
                      <th className="py-2 px-3 text-center">Score</th>
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
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          PLAYING
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-600 font-mono">
                        {playersMode === 2 ? 73 : 80}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-700 font-mono">
                        🪙 {playersMode === 2 ? 3000 : 4000}
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
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {seat.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-600 font-mono">
                          -
                        </td>
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
                  RNG Certified Fair Play · Drop Penalty: 20 pts
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

        {/* 9. WINNER / DECLARE MODAL */}
        {winModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-[#6b0b14] via-[#850d18] to-[#45050b] text-white rounded-3xl max-w-sm w-full p-6 text-center border-2 border-amber-300 shadow-2xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-3xl shadow-xl animate-bounce">
                🏆
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                  ROUND COMPLETED
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {winModalData.isPlayer ? 'YOU WON!' : `${winModalData.winnerName} WON!`}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-black/40 px-4 py-1.5 rounded-full border border-amber-400/40 text-lg font-black text-amber-300">
                  <span>Prize: ₹{winModalData.prize.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setWinModalData(null);
                    window.location.reload();
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
      </div>
    </div>
  );
};
