import React, { useState } from 'react';
import {
  ChevronLeft,
  Headphones,
  Send,
  Bot,
  User,
  CheckCircle2,
  BookOpen,
  Layers,
  Award,
  AlertTriangle,
  ShieldCheck,
  Search,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Scale,
  Info,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { sounds } from '../../utils/sound';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'rules' | 'chat';
}

type RuleCategory = 'all' | 'basics' | 'melds' | 'scoring' | 'variants' | 'drops';

// Mini Card Component for visual rule cards
const MiniRuleCard: React.FC<{
  rank: string;
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  isJoker?: boolean;
  isWild?: boolean;
}> = ({ rank, suit, isJoker, isWild }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const suitSymbols = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };

  return (
    <div className="relative w-11 sm:w-13 h-16 sm:h-18 bg-white rounded-lg shadow-sm border border-slate-300 flex flex-col justify-between p-1 select-none shrink-0">
      <div className="flex flex-col items-start leading-none">
        <span className={`text-xs font-black ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {rank}
        </span>
        <span className={`text-[9px] ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {suitSymbols[suit]}
        </span>
      </div>

      <div className="self-center text-center font-black">
        {isJoker ? (
          <span className="text-xs">🃏</span>
        ) : (
          <span className={`text-sm ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {suitSymbols[suit]}
          </span>
        )}
      </div>

      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`text-xs font-black ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {rank}
        </span>
        <span className={`text-[9px] ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {suitSymbols[suit]}
        </span>
      </div>

      {(isJoker || isWild) && (
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[7px] px-1 rounded-full border border-amber-500 whitespace-nowrap shadow-xs">
          JOKER
        </div>
      )}
    </div>
  );
};

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'rules',
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'chat'>(initialTab);
  const [ruleCategory, setRuleCategory] = useState<RuleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 24x7 Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Namaste! Welcome to Master Rummy 24x7 Priority Support. How can we assist you today?',
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    sounds.playCardClick();
    const userMsg = { sender: 'user' as const, text, time: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      sounds.playBell();
      let reply = 'Thank you for reaching out! Our support team is online 24x7 to assist with your query.';
      const lower = text.toLowerCase();
      if (lower.includes('rule') || lower.includes('rummy') || lower.includes('how to play')) {
        reply = 'Indian Rummy requires 13 cards arranged into at least 2 sequences (at least 1 must be Pure). Check out the "Rummy Rules" tab above for complete rules, meld types, and point tables!';
      } else if (lower.includes('score') || lower.includes('point') || lower.includes('penalty')) {
        reply = 'In Indian Rummy, Face cards (A, K, Q, J, 10) carry 10 points. Numbered cards 2-9 carry face value. A valid declaration gives 0 points, while a wrong show gives maximum 80 points penalty!';
      } else if (lower.includes('pure') || lower.includes('sequence')) {
        reply = 'A Pure Sequence consists of 3 or more consecutive cards of the same suit with NO Joker substitutes (e.g. 4♠-5♠-6♠). Having at least 1 Pure Sequence is mandatory to declare!';
      } else if (lower.includes('drop')) {
        reply = 'Dropping lets you exit a poor hand with minimal penalty: First Drop is 20 points, and Middle Drop is 40 points in Points/101 Pool.';
      } else if (lower.includes('withdraw') || lower.includes('withdrawal')) {
        reply = 'Withdrawals are processed via instant IMPS within 5-15 minutes once approved by the Admin in your Wallet tab.';
      } else if (lower.includes('deposit') || lower.includes('add cash')) {
        reply = 'Deposits are credited instantly via UPI, Cards, or Netbanking with 160% EXTRA004 bonus!';
      } else if (lower.includes('kyc') || lower.includes('verify')) {
        reply = 'Your mobile number is verified. You can update your bank details in the Withdrawal tab for instant payouts.';
      }

      setMessages((prev) => [...prev, { sender: 'agent', text: reply, time: 'Just now' }]);
    }, 700);
  };

  const quickFaqs = [
    'What are the Indian Rummy rules?',
    'What is a Pure Sequence?',
    'How are penalty points calculated?',
    'What is the difference between Points, Pool, and Deals?',
    'How long does withdrawal take?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#610710] via-[#7d0a15] to-[#610710] text-white px-3 sm:px-6 py-3 flex items-center justify-between shadow-lg shrink-0 border-b border-red-900/60">
        <button
          onClick={() => {
            sounds.playCardClick();
            onClose();
          }}
          className="p-1 hover:bg-black/20 rounded-full flex items-center transition-colors text-white"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-sm sm:text-base font-black tracking-wider uppercase flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            HELP & SUPPORT CENTRE
          </h1>
          <p className="text-[10px] text-amber-300 font-semibold tracking-wide">
            Master Rummy · Certified Fair Play
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playCardClick();
            onClose();
          }}
          className="p-1 hover:bg-black/20 rounded-full flex items-center text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Mode Navigation Bar (Rummy Rules vs Live Chat) */}
      <div className="bg-[#1e293b] px-3 sm:px-6 py-2 border-b border-slate-700/80 flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('rules');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'rules'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Rummy Rules & Scoring</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('chat');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>24x7 Live Support</span>
        </button>
      </div>

      {/* TAB 1: RUMMY RULES & SCORING */}
      {activeTab === 'rules' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#090e17]">
          {/* Sub-header Filter & Search */}
          <div className="p-3 sm:px-6 bg-[#0f172a] border-b border-slate-800 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rules, scoring, jokers, melds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Rules' },
                { id: 'basics', label: '13-Card Basics' },
                { id: 'melds', label: 'Meld Types' },
                { id: 'scoring', label: 'Scoring Table' },
                { id: 'drops', label: 'Drop Penalties' },
                { id: 'variants', label: 'Game Formats' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playCardClick();
                    setRuleCategory(cat.id as RuleCategory);
                  }}
                  className={`text-xs px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                    ruleCategory === cat.id
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Content Container (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
            
            {/* Quick Summary Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                ★
              </div>
              <div>
                <h3 className="text-amber-400 font-black text-sm uppercase">
                  Indian 13-Card Rummy Core Objective
                </h3>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Arrange your 13 cards into valid combinations consisting of at least <strong>TWO sequences</strong>, of which at least <strong>ONE MUST BE A PURE SEQUENCE</strong>. The remaining cards can be valid sequences or sets. Make a valid declaration to win with <strong>0 points</strong>!
                </p>
              </div>
            </div>

            {/* SECTION 1: 13-CARD BASICS & JOKERS */}
            {(ruleCategory === 'all' || ruleCategory === 'basics') && (
              <div className="bg-[#131d2e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>1. Standard Indian Rummy Rules & Setup</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      The Deal & Decks
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Played with <strong>2 standard 52-card decks</strong> plus 2 printed jokers per deck (108 cards total). Each player is dealt exactly <strong>13 cards</strong> at the start of each round.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      The Toss
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Before dealing, each player receives one card face up. The player with the highest rank card plays first. The player to their right is assigned as Dealer.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Wild Joker (Cut Card)
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      One card is randomly cut from the deck and placed face-up. All cards of that rank across all 4 suits become <strong>Wild Jokers</strong>. If a printed Joker is cut, Ace becomes the Wild Joker.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      Turn Cycle (Draw & Discard)
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Every turn, you must <strong>DRAW 1 card</strong> (from the Closed Deck or Open Discard Pile), evaluate your hand, and <strong>DISCARD 1 card</strong> to the discard pile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: MELD TYPES (PURE, IMPURE, SETS) */}
            {(ruleCategory === 'all' || ruleCategory === 'melds') && (
              <div className="bg-[#131d2e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>2. Valid Meld Types & Combinations</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Required for Show
                  </span>
                </div>

                {/* Pure Sequence */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border-2 border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        ✓
                      </span>
                      <h4 className="font-black text-white text-sm">
                        PURE SEQUENCE (Mandatory - Min 1 Required)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      NO JOKER ALLOWED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A sequence of 3 or more consecutive cards of the <strong>exact same suit</strong> formed naturally without any Joker substituting for another card.
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <MiniRuleCard rank="5" suit="spades" />
                    <MiniRuleCard rank="6" suit="spades" />
                    <MiniRuleCard rank="7" suit="spades" />
                    <MiniRuleCard rank="8" suit="spades" />
                    <span className="text-xs font-bold text-emerald-400 ml-2">
                      = Valid Pure Sequence (5♠ - 6♠ - 7♠ - 8♠)
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200">
                    💡 <em>Note: An Ace can form A-2-3 (low) or Q-K-A (high), but cannot wrap around like K-A-2.</em>
                  </div>
                </div>

                {/* Impure Sequence */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border-2 border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        ✓
                      </span>
                      <h4 className="font-black text-white text-sm">
                        IMPURE SEQUENCE (Second Sequence)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-500/30">
                      JOKER PERMITTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A sequence of 3 or more consecutive cards of the same suit where <strong>one or more Jokers</strong> (wild or printed) substitute for the missing card(s).
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <MiniRuleCard rank="9" suit="hearts" />
                    <MiniRuleCard rank="JK" suit="hearts" isJoker />
                    <MiniRuleCard rank="J" suit="hearts" />
                    <MiniRuleCard rank="Q" suit="hearts" />
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      = Valid Impure Sequence (Joker acts as 10♥)
                    </span>
                  </div>
                </div>

                {/* Valid Sets */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border-2 border-blue-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        ✓
                      </span>
                      <h4 className="font-black text-white text-sm">
                        SET (Cards of Same Rank, Different Suits)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black text-blue-300 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-500/30">
                      3 or 4 Cards
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A group of 3 or 4 cards of the <strong>SAME RANK</strong>, each belonging to a <strong>DIFFERENT SUIT</strong>. You can also use a Joker to complete a set.
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <MiniRuleCard rank="K" suit="spades" />
                    <MiniRuleCard rank="K" suit="hearts" />
                    <MiniRuleCard rank="K" suit="diamonds" />
                    <MiniRuleCard rank="JK" suit="clubs" isJoker />
                    <span className="text-xs font-bold text-blue-400 ml-2">
                      = Valid 4-Card Set (3 Kings + 1 Joker)
                    </span>
                  </div>
                  <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Rule:</strong> A set CANNOT contain two cards of the same suit. For example, 7♠ + 7♠ + 7♦ is strictly INVALID even though 2 decks are in play.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: SCORING & CARD POINTS TABLE */}
            {(ruleCategory === 'all' || ruleCategory === 'scoring') && (
              <div className="bg-[#131d2e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>3. Scoring, Card Values & Penalties</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Max 80 Pts
                  </span>
                </div>

                {/* Card Points Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-amber-400 font-black text-sm">Face Cards</span>
                    <p className="text-[11px] text-slate-300 font-bold mt-1">A, K, Q, J, 10</p>
                    <span className="text-xs font-black text-white mt-1 block">10 Points Each</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-emerald-400 font-black text-sm">Cards 2 - 9</span>
                    <p className="text-[11px] text-slate-300 font-bold mt-1">Pip value</p>
                    <span className="text-xs font-black text-white mt-1 block">Face Value (e.g. 7 = 7 pts)</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <span className="text-blue-400 font-black text-sm">All Jokers</span>
                    <p className="text-[11px] text-slate-300 font-bold mt-1">Wild & Printed</p>
                    <span className="text-xs font-black text-white mt-1 block">0 Points</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center col-span-3 sm:col-span-1">
                    <span className="text-red-400 font-black text-sm">Wrong Show</span>
                    <p className="text-[11px] text-slate-300 font-bold mt-1">Invalid declare</p>
                    <span className="text-xs font-black text-red-400 mt-1 block">80 Points Penalty</span>
                  </div>
                </div>

                {/* How loser's score is computed */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    How Losers' Penalty Points Are Calculated:
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2">
                      <span className="text-red-400 font-black shrink-0">1.</span>
                      <span>
                        <strong>No Pure Sequence:</strong> If the losing player has not formed a Pure Sequence, ALL 13 cards in their hand are counted as penalty (capped at 80 points maximum).
                      </span>
                    </li>
                    <li className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2">
                      <span className="text-amber-400 font-black shrink-0">2.</span>
                      <span>
                        <strong>1 Pure Sequence Formed:</strong> The Pure Sequence is awarded 0 points. Only the remaining ungrouped or invalid cards are summed towards penalty points.
                      </span>
                    </li>
                    <li className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2">
                      <span className="text-emerald-400 font-black shrink-0">3.</span>
                      <span>
                        <strong>2 Sequences Formed (1 Pure + 1 Impure):</strong> Both sequences carry 0 penalty points. Only unmelded sets or lone cards count towards the final score.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* SECTION 4: DROP PENALTIES */}
            {(ruleCategory === 'all' || ruleCategory === 'drops') && (
              <div className="bg-[#131d2e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>4. Dropping Strategy (Minimize Losses)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When dealt an unfavourable hand with no jokers or connected cards, dropping is a strategic move to concede minimal points rather than risk a full 80-point penalty.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="font-black text-amber-400 text-xs">FIRST DROP</span>
                    <p className="text-[11px] text-slate-400">Dropped on 1st turn before picking any card</p>
                    <div className="text-base font-black text-white pt-1">
                      20 Points <span className="text-[10px] text-slate-400">(25 in 201 Pool)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="font-black text-amber-400 text-xs">MIDDLE DROP</span>
                    <p className="text-[11px] text-slate-400">Dropped on any subsequent turn after picking</p>
                    <div className="text-base font-black text-white pt-1">
                      40 Points <span className="text-[10px] text-slate-400">(50 in 201 Pool)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="font-black text-red-400 text-xs">AUTO DROP (TIMEOUT)</span>
                    <p className="text-[11px] text-slate-400">Missing 3 consecutive turn timers</p>
                    <div className="text-base font-black text-red-400 pt-1">
                      Middle Drop Penalty
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: GAME FORMATS & SETTLEMENT */}
            {(ruleCategory === 'all' || ruleCategory === 'variants') && (
              <div className="bg-[#131d2e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base border-b border-slate-800 pb-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>5. Game Formats (Points, Pool & Deals)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Points Rummy */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 text-xs">POINTS RUMMY</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-400/20 text-amber-300">Fast 1 Deal</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Single deal format. Each point has a fixed pre-decided cash value (e.g. ₹50/pt).
                    </p>
                    <div className="p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-emerald-300">
                      Winnings = (Opponents' Total Points × Point Value) - Fee
                    </div>
                  </div>

                  {/* Pool Rummy */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-400 text-xs">POOL RUMMY (101 / 201)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-400/20 text-emerald-300">Elimination</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Points accumulate over rounds. Players reaching 101 (or 201) are eliminated. Last surviving player wins the pool!
                    </p>
                    <div className="p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-emerald-300">
                      Prize = Total Entry Fees - House Fee
                    </div>
                  </div>

                  {/* Deals Rummy */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-400 text-xs">DEALS RUMMY</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-400/20 text-blue-300">2 or 3 Deals</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Played for a fixed number of deals. Winner of each deal wins chips equal to the opponents' loss points.
                    </p>
                    <div className="p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-emerald-300">
                      Player with highest chips at end wins
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Need More Help / Chat CTA */}
            <div className="bg-[#1e293b] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Still have questions or need assistance?</h4>
                  <p className="text-[11px] text-slate-400">Our customer support team is available 24 hours a day, 7 days a week.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setActiveTab('chat');
                }}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Chat with Live Support
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: 24x7 LIVE CHAT SUPPORT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] text-slate-800">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-red-700 text-amber-300'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-red-700 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5 block">{m.time}</span>
                </div>
              </div>
            ))}

            {/* Quick FAQ Chips */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Frequently Asked Questions:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {quickFaqs.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xs transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Box */}
          <div className="bg-white border-t border-slate-200 p-2.5 shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask any question about rules, withdrawals, or gameplay..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-2 text-xs focus:outline-hidden text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-full shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
