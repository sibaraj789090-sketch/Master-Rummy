import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Info,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { PlayingCard, Rank, Suit } from '../../types/rummy';
import { sounds } from '../../utils/sound';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  wildJokerRank?: Rank;
}

type TabKey = 'basics' | 'melds' | 'workflow' | 'declare' | 'practice';

// Helper Suit Visuals
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

// Simple Authentic Card Display for tutorials & sandbox
const GuideCard: React.FC<{
  rank: Rank | 'JOKER';
  suit: Suit;
  isJoker?: boolean;
  isWild?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}> = ({
  rank,
  suit,
  isJoker = false,
  isWild = false,
  isSelected = false,
  onClick,
  size = 'md',
  label,
}) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';

  const sizeClasses = {
    sm: 'w-10 h-14 text-xs rounded-md p-1',
    md: 'w-14 sm:w-16 h-20 sm:h-24 text-sm sm:text-base rounded-lg sm:rounded-xl p-1.5',
    lg: 'w-16 sm:w-20 h-24 sm:h-30 text-base sm:text-lg rounded-xl p-2',
  }[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => {
          if (onClick) {
            sounds.playCardClick();
            onClick();
          }
        }}
        className={`relative ${sizeClasses} bg-white shadow-md border transition-all duration-200 select-none flex flex-col justify-between cursor-pointer ${
          isSelected
            ? 'ring-3 ring-amber-400 -translate-y-2.5 shadow-amber-500/40 shadow-lg border-amber-500 bg-amber-50/50'
            : 'border-slate-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-400'
        }`}
      >
        {/* Top-left rank and suit */}
        <div className="flex flex-col items-start leading-none">
          <span className={`font-black ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {rank === 'JOKER' ? 'JK' : rank}
          </span>
          <span className={`text-[10px] sm:text-xs ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {getSuitSymbol(suit)}
          </span>
        </div>

        {/* Center Art or Symbol */}
        <div className="self-center my-auto flex flex-col items-center">
          {rank === 'JOKER' || isJoker ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-[10px] font-black text-amber-800">
              🃏
            </div>
          ) : (
            <span className={`text-base sm:text-xl font-black ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
              {getSuitSymbol(suit)}
            </span>
          )}
        </div>

        {/* Bottom-right inverted rank */}
        <div className="flex flex-col items-end leading-none rotate-180">
          <span className={`font-black ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {rank === 'JOKER' ? 'JK' : rank}
          </span>
          <span className={`text-[10px] sm:text-xs ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {getSuitSymbol(suit)}
          </span>
        </div>

        {/* Wild Joker or Printed Joker Badge */}
        {(isJoker || isWild) && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full border border-amber-300 shadow-xs whitespace-nowrap">
            JOKER
          </div>
        )}
      </button>
      {label && (
        <span className="text-[10px] font-semibold text-stone-300 text-center max-w-[70px] truncate">
          {label}
        </span>
      )}
    </div>
  );
};

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  wildJokerRank = '8',
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('basics');

  // Interactive sandbox state for Tab 3 (Workflow demo)
  const [workflowState, setWorkflowState] = useState<{
    phase: 'DRAW' | 'SELECT_DISCARD' | 'DONE';
    selectedCardId: string | null;
    drawnSource: 'closed' | 'open' | null;
    discardedCard: { rank: Rank; suit: Suit } | null;
  }>({
    phase: 'DRAW',
    selectedCardId: null,
    drawnSource: null,
    discardedCard: null,
  });

  // Interactive Practice Quiz state for Tab 5
  const [practiceStep, setPracticeStep] = useState<1 | 2 | 3>(1);
  const [selectedPracticeCards, setSelectedPracticeCards] = useState<string[]>([]);
  const [practiceFeedback, setPracticeFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Quiz choice for Step 3
  const [selectedHandChoice, setSelectedHandChoice] = useState<'A' | 'B' | null>(null);

  if (!isOpen) return null;

  const tabs: { key: TabKey; title: string; subtitle: string; icon: React.ReactNode }[] = [
    { key: 'basics', title: '1. The Basics', subtitle: 'Cards, Deal & Jokers', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'melds', title: '2. Melds & Sequences', subtitle: 'Pure vs Impure vs Sets', icon: <Layers className="w-4 h-4" /> },
    { key: 'workflow', title: '3. Turn Gameplay', subtitle: 'Draw & Discard', icon: <ArrowRight className="w-4 h-4" /> },
    { key: 'declare', title: '4. Declare & Win', subtitle: 'Finish Slot & Scoring', icon: <Award className="w-4 h-4" /> },
    { key: 'practice', title: '5. Interactive Lab', subtitle: 'Practice with Cards', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.key === activeTab);
    if (currentIndex < tabs.length - 1) {
      sounds.playCardClick();
      setActiveTab(tabs[currentIndex + 1].key);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.findIndex((t) => t.key === activeTab);
    if (currentIndex > 0) {
      sounds.playCardClick();
      setActiveTab(tabs[currentIndex - 1].key);
    }
  };

  // Workflow demo reset
  const resetWorkflowDemo = () => {
    setWorkflowState({
      phase: 'DRAW',
      selectedCardId: null,
      drawnSource: null,
      discardedCard: null,
    });
  };

  // Workflow demo actions
  const handleWorkflowDraw = (source: 'closed' | 'open') => {
    sounds.playCardClick();
    setWorkflowState((prev) => ({
      ...prev,
      phase: 'SELECT_DISCARD',
      drawnSource: source,
      selectedCardId: null,
    }));
  };

  const handleWorkflowDiscard = () => {
    if (!workflowState.selectedCardId) return;
    sounds.playCardClick();

    // Map card id to rank/suit
    const cardMap: Record<string, { rank: Rank; suit: Suit }> = {
      c1: { rank: 'K', suit: 'spades' },
      c2: { rank: '4', suit: 'hearts' },
      c3: { rank: '5', suit: 'hearts' },
      c4: { rank: '6', suit: 'hearts' },
      c_drawn_closed: { rank: '7', suit: 'diamonds' },
      c_drawn_open: { rank: 'Q', suit: 'clubs' },
    };

    const discarded = cardMap[workflowState.selectedCardId] || { rank: 'K', suit: 'spades' };

    setWorkflowState((prev) => ({
      ...prev,
      phase: 'DONE',
      discardedCard: discarded,
    }));
  };

  // Practice Quiz Evaluation
  const handleEvaluatePractice = () => {
    sounds.playCardClick();
    if (practiceStep === 1) {
      // Challenge 1: Pure sequence in Spades [4♠, 5♠, 6♠]
      const required = ['c_p1_4s', 'c_p1_5s', 'c_p1_6s'];
      const isCorrect =
        selectedPracticeCards.length === 3 &&
        required.every((id) => selectedPracticeCards.includes(id));

      if (isCorrect) {
        sounds.playCoinSound();
        setPracticeFeedback({
          status: 'success',
          message: 'Excellent! 4♠ - 5♠ - 6♠ is a strictly consecutive run of the same suit without any joker. This is a valid Pure Sequence!',
        });
      } else {
        setPracticeFeedback({
          status: 'error',
          message: 'Not quite. A Pure Sequence requires 3 consecutive cards of the exact same suit with no Jokers. Try selecting 4♠, 5♠, and 6♠!',
        });
      }
    } else if (practiceStep === 2) {
      // Challenge 2: Impure sequence with Joker [7♦, Joker, 9♦]
      const required = ['c_p2_7d', 'c_p2_jk', 'c_p2_9d'];
      const isCorrect =
        selectedPracticeCards.length === 3 &&
        required.every((id) => selectedPracticeCards.includes(id));

      if (isCorrect) {
        sounds.playCoinSound();
        setPracticeFeedback({
          status: 'success',
          message: 'Spot on! The Joker acts as the missing 8♦ to bridge 7♦ and 9♦, creating a valid Impure Sequence!',
        });
      } else {
        setPracticeFeedback({
          status: 'error',
          message: 'Try selecting 7♦, the Joker (acting as 8♦), and 9♦ to complete the sequence.',
        });
      }
    }
  };

  const handleEvaluateDeclarationChoice = (choice: 'A' | 'B') => {
    sounds.playCardClick();
    setSelectedHandChoice(choice);
    if (choice === 'A') {
      sounds.playCoinSound();
      setPracticeFeedback({
        status: 'success',
        message: 'Correct! Hand A contains at least 1 Pure Sequence (A♠-2♠-3♠), which is mandatory. Hand B has no Pure Sequence and would result in an 80-point wrong show penalty!',
      });
    } else {
      setPracticeFeedback({
        status: 'error',
        message: 'Incorrect! Hand B contains only Impure Sequences and Sets, but zero Pure Sequences. Without a Pure Sequence, declaring results in a full 80-point penalty.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c1424] text-stone-100 rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#111c33] via-[#1a2947] to-[#111c33] border-b border-stone-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                How to Play Master Rummy
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Beginner Guide
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Indian 13-Card Rummy rules, melding strategies, and declaration walkthrough
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playCardClick();
              onClose();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors shadow-xs"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 bg-[#090e1a] border-b border-stone-800/80 overflow-x-auto no-scrollbar">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  sounds.playCardClick();
                  setActiveTab(tab.key);
                }}
                className={`flex-1 min-w-[120px] sm:min-w-0 py-2 px-2.5 sm:px-3 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="overflow-hidden">
                  <div className={`text-xs truncate ${isActive ? 'font-black' : 'font-bold'}`}>
                    {tab.title}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-amber-950/80 font-semibold' : 'text-stone-500'}`}>
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-stone-200 text-xs sm:text-sm">
          
          {/* TAB 1: THE BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Core Objective Card */}
              <div className="bg-gradient-to-br from-stone-900 to-[#141e33] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm sm:text-base uppercase mb-2">
                  <Award className="w-5 h-5" />
                  Primary Objective
                </div>
                <p className="text-stone-300 leading-relaxed sm:text-sm">
                  In 13-Card Indian Rummy, you are dealt <strong>13 cards</strong>. Your objective is to arrange all 13 cards into valid <strong>Sequences</strong> and <strong>Sets</strong>, then make a valid declaration with <strong>0 penalty points</strong>.
                </p>
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-300 text-xs font-medium">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Golden Rule:</strong> You MUST form at least <strong>TWO sequences</strong>, and at least <strong>ONE must be a Pure Sequence</strong> (no Jokers allowed in it). Without a Pure Sequence, any declaration is invalid and carries a maximum penalty of 80 points!
                  </span>
                </div>
              </div>

              {/* Deal & Decks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    2 Decks & Card Values
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Played with 2 standard decks of 52 cards each plus 2 Printed Jokers per deck (108 cards total).
                  </p>
                  <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside pt-1">
                    <li><strong className="text-amber-300">Face cards (A, K, Q, J, 10):</strong> 10 points each.</li>
                    <li><strong className="text-amber-300">Numbered cards (2-9):</strong> Face value (e.g. 5 = 5 pts).</li>
                    <li><strong className="text-amber-300">Jokers (Wild & Printed):</strong> 0 points.</li>
                  </ul>
                </div>

                <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Wild Jokers & Cut Card
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    At the start of each deal, one card is cut from the deck and turned face-up as the <strong className="text-amber-300">Wild Joker</strong>.
                  </p>
                  <div className="p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-amber-400">Current Table Cut Card: {wildJokerRank}</div>
                      <div className="text-[11px] text-stone-400">
                        All {wildJokerRank}s across all suits are now Wild Jokers!
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center font-black text-amber-300">
                      {wildJokerRank}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toss & Turn Order */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4">
                <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  The Toss (Who plays first?)
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Before cards are dealt, a virtual toss deals one card to every player. The player with the highest card plays first (Ace is high in toss). The player immediately to their right becomes the Dealer.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MELDS & SEQUENCES */}
          {activeTab === 'melds' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-stone-300 text-xs sm:text-sm">
                Cards in your hand must be organized into 4 melds (combinations of 3 or 4 cards). Learn the three valid meld types below:
              </div>

              {/* 1. Pure Sequence */}
              <div className="bg-stone-900/90 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-black text-white text-sm sm:text-base tracking-wide">
                      PURE SEQUENCE (Mandatory)
                    </h3>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Min 1 Required
                  </span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  A group of 3 or more <strong>consecutive cards of the EXACT SAME SUIT</strong>, formed <strong>without using any Joker</strong> as a wildcard substitute.
                </p>

                {/* Example Cards */}
                <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <GuideCard rank="4" suit="spades" />
                  <GuideCard rank="5" suit="spades" />
                  <GuideCard rank="6" suit="spades" />
                  <GuideCard rank="7" suit="spades" />
                </div>
                <div className="text-[11px] text-emerald-400 text-center font-bold">
                  ✓ Valid Pure Sequence: 4♠ - 5♠ - 6♠ - 7♠ (All Spades, strictly in order)
                </div>
              </div>

              {/* 2. Impure Sequence */}
              <div className="bg-stone-900/90 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-black text-white text-sm sm:text-base tracking-wide">
                      IMPURE SEQUENCE (Second Sequence)
                    </h3>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Joker Allowed
                  </span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  A group of 3 or more consecutive cards of the same suit where <strong>one or more Jokers</strong> (wild or printed) substitute for missing cards.
                </p>

                {/* Example Cards */}
                <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <GuideCard rank="9" suit="hearts" />
                  <GuideCard rank="10" suit="hearts" />
                  <GuideCard rank="JOKER" suit="spades" isJoker label="Acts as J♥" />
                  <GuideCard rank="Q" suit="hearts" />
                </div>
                <div className="text-[11px] text-amber-400 text-center font-bold">
                  ✓ Valid Impure Sequence: The Joker replaces Jack of Hearts (9♥ - 10♥ - 🃏 - Q♥)
                </div>
              </div>

              {/* 3. Valid Sets */}
              <div className="bg-stone-900/90 border-2 border-blue-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-black text-white text-sm sm:text-base tracking-wide">
                      SET (Cards of Same Rank)
                    </h3>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Different Suits Only
                  </span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  A group of 3 or 4 cards of the <strong>SAME RANK</strong> with <strong>DIFFERENT SUITS</strong>. You can also use a Joker to complete a set.
                </p>

                {/* Example Cards */}
                <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <GuideCard rank="K" suit="spades" />
                  <GuideCard rank="K" suit="hearts" />
                  <GuideCard rank="K" suit="diamonds" />
                </div>
                <div className="text-[11px] text-blue-400 text-center font-bold">
                  ✓ Valid Set: Three Kings of different suits (K♠ - K♥ - K♦).
                </div>
                <div className="p-2.5 bg-red-950/30 border border-red-500/30 rounded-xl text-[11px] text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>Caution:</strong> A set CANNOT have two cards of the same suit (e.g., K♠ + K♠ + K♥ is INVALID).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKFLOW / DRAW & DISCARD */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-stone-900 to-[#16233d] border border-amber-500/30 rounded-2xl p-4">
                <h3 className="font-black text-amber-400 text-sm mb-1 uppercase">
                  Every Turn Follows 2 Steps:
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  1. <strong>DRAW:</strong> Pick 1 card from either the <strong>Closed Deck</strong> or the <strong>Open Discard Pile</strong>.<br />
                  2. <strong>DISCARD:</strong> Choose 1 unwanted card from your hand and discard it to the open pile (leaving 13 cards).
                </p>
              </div>

              {/* Interactive Turn Simulator */}
              <div className="bg-stone-900/90 border border-stone-700 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-black text-white text-xs sm:text-sm">
                      Interactive Simulation: Try Drawing & Discarding
                    </span>
                  </div>
                  <button
                    onClick={resetWorkflowDemo}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                {/* Instruction banner for interactive stage */}
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-center font-bold">
                  {workflowState.phase === 'DRAW' && (
                    <span className="text-amber-400">
                      Step 1: Click either the <strong>Closed Deck</strong> or <strong>Open Discard Pile</strong> to draw a card!
                    </span>
                  )}
                  {workflowState.phase === 'SELECT_DISCARD' && (
                    <span className="text-emerald-400">
                      Step 2: You now have 14 cards! Click any card in your hand below, then tap "DISCARD".
                    </span>
                  )}
                  {workflowState.phase === 'DONE' && (
                    <span className="text-amber-300 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Turn Completed! Card discarded to pile. Your hand has 13 cards ready for the next move.
                    </span>
                  )}
                </div>

                {/* Table Simulation Area */}
                <div className="p-4 sm:p-6 bg-[#072419] rounded-2xl border-4 border-[#2b180d] shadow-inner flex flex-col items-center justify-center gap-6">
                  
                  {/* Central Decks */}
                  <div className="flex items-center justify-center gap-6 sm:gap-10">
                    {/* Closed Deck */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        disabled={workflowState.phase !== 'DRAW'}
                        onClick={() => handleWorkflowDraw('closed')}
                        className={`w-14 sm:w-16 h-20 sm:h-24 rounded-xl border-2 transition-all relative flex flex-col items-center justify-center ${
                          workflowState.phase === 'DRAW'
                            ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-amber-400 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-amber-400/50'
                            : 'bg-amber-950/60 border-stone-700 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-amber-300 text-base font-black">♠</span>
                        <span className="text-[8px] text-amber-200 font-black tracking-widest mt-1">CLOSED</span>
                      </button>
                      <span className="text-[10px] font-bold text-stone-300">Closed Deck</span>
                    </div>

                    {/* Open Discard Pile */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        disabled={workflowState.phase !== 'DRAW'}
                        onClick={() => handleWorkflowDraw('open')}
                        className={`transition-all ${
                          workflowState.phase === 'DRAW'
                            ? 'hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-400/60 rounded-xl'
                            : 'opacity-80'
                        }`}
                      >
                        {workflowState.discardedCard ? (
                          <GuideCard
                            rank={workflowState.discardedCard.rank}
                            suit={workflowState.discardedCard.suit}
                            size="md"
                          />
                        ) : (
                          <GuideCard rank="Q" suit="clubs" size="md" />
                        )}
                      </button>
                      <span className="text-[10px] font-bold text-stone-300">Open Discard Pile</span>
                    </div>
                  </div>

                  {/* Player Hand Simulation */}
                  <div className="w-full pt-2 border-t border-emerald-900/40 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                      Your Hand ({workflowState.phase === 'SELECT_DISCARD' ? '14 Cards' : '13 Cards'})
                    </span>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                      <GuideCard
                        rank="K"
                        suit="spades"
                        isSelected={workflowState.selectedCardId === 'c1'}
                        onClick={() => {
                          if (workflowState.phase === 'SELECT_DISCARD') {
                            setWorkflowState((p) => ({ ...p, selectedCardId: 'c1' }));
                          }
                        }}
                      />
                      <GuideCard
                        rank="4"
                        suit="hearts"
                        isSelected={workflowState.selectedCardId === 'c2'}
                        onClick={() => {
                          if (workflowState.phase === 'SELECT_DISCARD') {
                            setWorkflowState((p) => ({ ...p, selectedCardId: 'c2' }));
                          }
                        }}
                      />
                      <GuideCard
                        rank="5"
                        suit="hearts"
                        isSelected={workflowState.selectedCardId === 'c3'}
                        onClick={() => {
                          if (workflowState.phase === 'SELECT_DISCARD') {
                            setWorkflowState((p) => ({ ...p, selectedCardId: 'c3' }));
                          }
                        }}
                      />
                      <GuideCard
                        rank="6"
                        suit="hearts"
                        isSelected={workflowState.selectedCardId === 'c4'}
                        onClick={() => {
                          if (workflowState.phase === 'SELECT_DISCARD') {
                            setWorkflowState((p) => ({ ...p, selectedCardId: 'c4' }));
                          }
                        }}
                      />

                      {/* Newly Drawn Card (if drawn) */}
                      {workflowState.phase === 'SELECT_DISCARD' && (
                        <div className="animate-in zoom-in-75 duration-300">
                          <GuideCard
                            rank={workflowState.drawnSource === 'closed' ? '7' : 'Q'}
                            suit={workflowState.drawnSource === 'closed' ? 'diamonds' : 'clubs'}
                            isSelected={workflowState.selectedCardId === (workflowState.drawnSource === 'closed' ? 'c_drawn_closed' : 'c_drawn_open')}
                            label="Drawn Card"
                            onClick={() => {
                              const id = workflowState.drawnSource === 'closed' ? 'c_drawn_closed' : 'c_drawn_open';
                              setWorkflowState((p) => ({ ...p, selectedCardId: id }));
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Discard Action Button */}
                    {workflowState.phase === 'SELECT_DISCARD' && (
                      <button
                        onClick={handleWorkflowDiscard}
                        disabled={!workflowState.selectedCardId}
                        className={`mt-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                          workflowState.selectedCardId
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 scale-105 active:scale-95 cursor-pointer'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        Discard Selected Card
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DECLARE & WIN */}
          {activeTab === 'declare' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-amber-950/40 via-stone-900 to-[#16233d] border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm sm:text-base uppercase">
                  <Award className="w-5 h-5" />
                  Making a Valid Declaration
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Once all your 13 cards are arranged into valid combinations, move your 14th card to the <strong>FINISH SLOT</strong> and tap <strong>DECLARE</strong>.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="font-black text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Valid Show = 0 Points
                    </div>
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                      You win the round! Opponents are scored based on the unmelded cards in their hands.
                    </p>
                  </div>

                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl space-y-1">
                    <div className="font-black text-red-400 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Wrong Show = 80 Points
                    </div>
                    <p className="text-[11px] text-red-200/80 leading-relaxed">
                      Declaring without meeting the rules (e.g. missing Pure Sequence) incurs the maximum penalty of 80 points!
                    </p>
                  </div>
                </div>
              </div>

              {/* Declaration Checklist */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-white text-sm">Valid Declaration Checklist</h3>
                <ul className="text-xs text-stone-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                    <span><strong>At least 1 Pure Sequence:</strong> 3+ cards in consecutive order of the same suit without Joker.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                    <span><strong>At least 1 Second Sequence:</strong> Can be Pure or Impure (using Wild or Printed Joker).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                    <span><strong>Remaining cards:</strong> Grouped into valid sequences or sets of 3 or 4 cards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                    <span><strong>Finish Card:</strong> The 14th card is placed into the red Finish slot, leaving exactly 13 cards in your melds.</span>
                  </li>
                </ul>
              </div>

              {/* Dropping Rules Table */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Drop Strategy (Cut Your Losses)
                </h3>
                <p className="text-stone-400 text-xs">
                  If you are dealt a very weak hand with zero jokers or sequences, you can choose to "Drop" to minimize penalty points rather than risk losing 80 points.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                    <div className="text-amber-400 font-black text-sm">FIRST DROP</div>
                    <div className="text-stone-400 text-[11px] mt-0.5">Dropped before picking any card</div>
                    <div className="mt-2 text-base font-black text-white">20 Points</div>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                    <div className="text-amber-400 font-black text-sm">MIDDLE DROP</div>
                    <div className="text-stone-400 text-[11px] mt-0.5">Dropped on any subsequent turn</div>
                    <div className="mt-2 text-base font-black text-white">40 Points</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTERACTIVE PRACTICE LAB */}
          {activeTab === 'practice' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-stone-900 to-[#192642] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-amber-400 text-sm uppercase">
                    Interactive Practice Lab
                  </h3>
                  <p className="text-stone-400 text-xs">
                    Test your understanding with real mini-scenarios before playing!
                  </p>
                </div>
                <div className="flex gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-bold">
                  {[1, 2, 3].map((stepNum) => (
                    <button
                      key={stepNum}
                      onClick={() => {
                        sounds.playCardClick();
                        setPracticeStep(stepNum as 1 | 2 | 3);
                        setSelectedPracticeCards([]);
                        setPracticeFeedback({ status: 'idle', message: '' });
                        setSelectedHandChoice(null);
                      }}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        practiceStep === stepNum
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Task {stepNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* TASK 1: Pure Sequence Builder */}
              {practiceStep === 1 && (
                <div className="bg-stone-900/90 border border-stone-700 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      Challenge 1 of 3
                    </span>
                    <h4 className="font-black text-white text-sm sm:text-base">
                      Assemble a Valid Pure Sequence
                    </h4>
                    <p className="text-stone-400 text-xs">
                      Tap the 3 cards that form a strictly consecutive <strong>Pure Sequence</strong> of the same suit.
                    </p>
                  </div>

                  {/* Card Choices */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-center gap-3">
                    <GuideCard
                      rank="4"
                      suit="spades"
                      isSelected={selectedPracticeCards.includes('c_p1_4s')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p1_4s') ? prev.filter((id) => id !== 'c_p1_4s') : [...prev, 'c_p1_4s']
                        );
                      }}
                    />
                    <GuideCard
                      rank="8"
                      suit="hearts"
                      isSelected={selectedPracticeCards.includes('c_p1_8h')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p1_8h') ? prev.filter((id) => id !== 'c_p1_8h') : [...prev, 'c_p1_8h']
                        );
                      }}
                    />
                    <GuideCard
                      rank="5"
                      suit="spades"
                      isSelected={selectedPracticeCards.includes('c_p1_5s')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p1_5s') ? prev.filter((id) => id !== 'c_p1_5s') : [...prev, 'c_p1_5s']
                        );
                      }}
                    />
                    <GuideCard
                      rank="9"
                      suit="diamonds"
                      isSelected={selectedPracticeCards.includes('c_p1_9d')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p1_9d') ? prev.filter((id) => id !== 'c_p1_9d') : [...prev, 'c_p1_9d']
                        );
                      }}
                    />
                    <GuideCard
                      rank="6"
                      suit="spades"
                      isSelected={selectedPracticeCards.includes('c_p1_6s')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p1_6s') ? prev.filter((id) => id !== 'c_p1_6s') : [...prev, 'c_p1_6s']
                        );
                      }}
                    />
                  </div>

                  {/* Feedback Message */}
                  {practiceFeedback.status !== 'idle' && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        practiceFeedback.status === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}
                    >
                      {practiceFeedback.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span>{practiceFeedback.message}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-400">
                      Selected: {selectedPracticeCards.length} / 3 cards
                    </span>
                    <button
                      onClick={handleEvaluatePractice}
                      disabled={selectedPracticeCards.length === 0}
                      className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      Check Sequence
                    </button>
                  </div>
                </div>
              )}

              {/* TASK 2: Impure Sequence Builder */}
              {practiceStep === 2 && (
                <div className="bg-stone-900/90 border border-stone-700 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      Challenge 2 of 3
                    </span>
                    <h4 className="font-black text-white text-sm sm:text-base">
                      Complete an Impure Sequence with a Joker
                    </h4>
                    <p className="text-stone-400 text-xs">
                      Tap the 3 cards that form a valid sequence where the Joker substitutes for the missing rank.
                    </p>
                  </div>

                  {/* Card Choices */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-center gap-3">
                    <GuideCard
                      rank="7"
                      suit="diamonds"
                      isSelected={selectedPracticeCards.includes('c_p2_7d')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p2_7d') ? prev.filter((id) => id !== 'c_p2_7d') : [...prev, 'c_p2_7d']
                        );
                      }}
                    />
                    <GuideCard
                      rank="JOKER"
                      suit="spades"
                      isJoker
                      isSelected={selectedPracticeCards.includes('c_p2_jk')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p2_jk') ? prev.filter((id) => id !== 'c_p2_jk') : [...prev, 'c_p2_jk']
                        );
                      }}
                    />
                    <GuideCard
                      rank="9"
                      suit="diamonds"
                      isSelected={selectedPracticeCards.includes('c_p2_9d')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p2_9d') ? prev.filter((id) => id !== 'c_p2_9d') : [...prev, 'c_p2_9d']
                        );
                      }}
                    />
                    <GuideCard
                      rank="2"
                      suit="clubs"
                      isSelected={selectedPracticeCards.includes('c_p2_2c')}
                      onClick={() => {
                        setSelectedPracticeCards((prev) =>
                          prev.includes('c_p2_2c') ? prev.filter((id) => id !== 'c_p2_2c') : [...prev, 'c_p2_2c']
                        );
                      }}
                    />
                  </div>

                  {/* Feedback Message */}
                  {practiceFeedback.status !== 'idle' && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        practiceFeedback.status === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}
                    >
                      {practiceFeedback.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span>{practiceFeedback.message}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-400">
                      Selected: {selectedPracticeCards.length} / 3 cards
                    </span>
                    <button
                      onClick={handleEvaluatePractice}
                      disabled={selectedPracticeCards.length === 0}
                      className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      Check Sequence
                    </button>
                  </div>
                </div>
              )}

              {/* TASK 3: Spot the Valid Declare Hand */}
              {practiceStep === 3 && (
                <div className="bg-stone-900/90 border border-stone-700 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      Challenge 3 of 3
                    </span>
                    <h4 className="font-black text-white text-sm sm:text-base">
                      Which of these two hands can declare a WIN?
                    </h4>
                    <p className="text-stone-400 text-xs">
                      Examine both hands carefully. Remember the mandatory Pure Sequence requirement!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Hand A */}
                    <div
                      onClick={() => handleEvaluateDeclarationChoice('A')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                        selectedHandChoice === 'A'
                          ? 'border-emerald-400 bg-emerald-950/20 shadow-lg shadow-emerald-500/20'
                          : 'border-stone-800 bg-stone-950 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white text-xs sm:text-sm">HAND A</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          1 Pure + 1 Impure + 2 Sets
                        </span>
                      </div>
                      <div className="space-y-2 text-[11px] text-stone-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">Seq 1:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">A♠ - 2♠ - 3♠</span>
                          <span className="text-[10px] text-emerald-400 font-bold">(Pure)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold">Seq 2:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">7♦ - 🃏 - 9♦</span>
                          <span className="text-[10px] text-amber-400 font-bold">(Impure)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-400 font-bold">Set 1:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">8♠ - 8♥ - 8♣</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-400 font-bold">Set 2:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">K♥ - K♦ - K♣ - 🃏</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
                      >
                        Select Hand A
                      </button>
                    </div>

                    {/* Hand B */}
                    <div
                      onClick={() => handleEvaluateDeclarationChoice('B')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                        selectedHandChoice === 'B'
                          ? 'border-red-400 bg-red-950/20 shadow-lg shadow-red-500/20'
                          : 'border-stone-800 bg-stone-950 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white text-xs sm:text-sm">HAND B</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          0 Pure Sequences
                        </span>
                      </div>
                      <div className="space-y-2 text-[11px] text-stone-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold">Seq 1:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">4♠ - 🃏 - 6♠</span>
                          <span className="text-[10px] text-amber-400 font-bold">(Impure)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold">Seq 2:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">7♦ - 🃏 - 9♦</span>
                          <span className="text-[10px] text-amber-400 font-bold">(Impure)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-400 font-bold">Set 1:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">8♠ - 8♥ - 8♣</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-400 font-bold">Set 2:</span>
                          <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-white">K♥ - K♦ - K♣ - 🃏</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
                      >
                        Select Hand B
                      </button>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {practiceFeedback.status !== 'idle' && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        practiceFeedback.status === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}
                    >
                      {practiceFeedback.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span>{practiceFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0a0f1d] border-t border-stone-800">
          <button
            onClick={handlePrevTab}
            disabled={activeTab === 'basics'}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playCardClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-stone-400 hover:text-white transition-colors"
            >
              Back to Table
            </button>

            {activeTab !== 'practice' ? (
              <button
                onClick={handleNextTab}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md active:scale-95"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.playCardClick();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                Ready to Play!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
