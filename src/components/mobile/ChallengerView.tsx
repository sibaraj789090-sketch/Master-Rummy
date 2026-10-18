import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { Trophy, ChevronDown, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/sound';

export const ChallengerView: React.FC = () => {
  const { currentUser, setActiveScreen, launchGame } = useRummy();
  const [activeTab, setActiveTab] = useState<'MINI' | 'MEGA'>('MEGA');

  const miniLeaderboard = [
    { rank: 1, name: 'player79477', points: '2,211,200', prize: '₹15,000', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { rank: 2, name: 'player52883', points: '1,236,000', prize: '₹11,000', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { rank: 3, name: 'Nagavendra m v', points: '1,236,000', prize: '₹7,000', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { rank: 4, name: 'SanjayG***', points: '984,000', prize: '₹4,000', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
    { rank: 5, name: 'Aakash99', points: '812,000', prize: '₹2,500', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
  ];

  const megaLeaderboard = [
    { rank: 1, name: 'player06589', points: '45,112,000', prize: '₹1,20,000', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
    { rank: 2, name: 'AK 47', points: '39,841,600', prize: '₹80,000', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { rank: 3, name: 'player79477', points: '30,127,920', prize: '₹50,000', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { rank: 4, name: 'VikramSingh', points: '24,550,000', prize: '₹30,000', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { rank: 5, name: 'RajeshKumar', points: '18,200,000', prize: '₹20,000', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
  ];

  const handleQuickPlay = () => {
    sounds.playCardClick();
    launchGame({
      category: 'CASH',
      variant: 'Points',
      playersCount: 6,
      pointValue: 0.05,
      entryFee: 4,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#f8fafc] text-slate-800 flex flex-col select-none">
      {/* 1. Challenger Header with Total Prizes Issued 2.2Cr (From Screenshots 16, 17) */}
      <div className="relative bg-gradient-to-b from-[#690710] to-[#3a0308] text-white p-4 text-center overflow-hidden shadow-inner">
        <span className="text-xs uppercase tracking-wider text-amber-200/90 font-bold">Total Prizes Issued</span>
        <h1 className="text-4xl font-black text-amber-400 tracking-tight drop-shadow-md mt-0.5">2.2Cr</h1>
      </div>

      {/* 2. Mini + Mega Challenger Card (From Screenshots 16, 17) */}
      <div className="p-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">
              Mini + Mega Challenger Prizes
            </span>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Live
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-0.5">Mega + 30Minis, 24th Sep to 23rd Oct</p>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-500 fill-amber-400" />
              <div>
                <p className="text-xl font-black text-slate-900">₹55L</p>
                <p className="text-[10px] text-slate-400">*Fees: 3% of cash game winnings</p>
              </div>
            </div>

            <button
              onClick={handleQuickPlay}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-lg shadow-md uppercase active:scale-95 transition-all"
            >
              PLAY NOW
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-600 font-semibold">
            <span className="bg-slate-100 px-2 py-0.5 rounded">All variants</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded">All Player(s)</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded">Entry Fee: All Values</span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>
              Current challenger ends in: <strong className="text-red-700">18:50:19</strong>
            </span>
            <span className="text-blue-600 hover:underline cursor-pointer font-medium">View Schedule</span>
          </div>
        </div>
      </div>

      {/* 3. Sub Tabs: Mini Challenger | Mega Challenger */}
      <div className="bg-slate-100 flex border-y border-slate-200 text-xs font-extrabold">
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('MINI');
          }}
          className={`flex-1 py-3 text-center transition-all relative ${
            activeTab === 'MINI' ? 'text-red-700 bg-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'MINI' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          Mini Challenger
        </button>
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('MEGA');
          }}
          className={`flex-1 py-3 text-center transition-all relative ${
            activeTab === 'MEGA' ? 'text-red-700 bg-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'MEGA' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          Mega Challenger
        </button>
      </div>

      {/* Time & Total Prize bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
        <span>
          Time Period:{' '}
          <span className="text-slate-900 font-bold">
            {activeTab === 'MINI' ? '18th Oct 0:00am to 23:59pm' : '24th Sep - 23rd Oct'}
          </span>
        </span>
        <div className="flex items-center gap-1 text-slate-900 font-bold cursor-pointer">
          <span>Total Prize: {activeTab === 'MINI' ? '₹1L' : '₹10L'}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-3">
        {/* Header Row */}
        <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase">
          <span className="col-span-2">Rank</span>
          <span className="col-span-7">Player / Score</span>
          <span className="col-span-3 text-right">Expected Prize</span>
        </div>

        {/* User's own rank card (highlighted beige from Screenshots 16, 17) */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 my-2 shadow-xs grid grid-cols-12 items-center">
          <div className="col-span-2 font-black text-slate-900 text-xs">
            {activeTab === 'MEGA' ? '298385' : '-'}
          </div>
          <div className="col-span-7 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-amber-400 overflow-hidden bg-stone-900 shrink-0">
              <img
                src={currentUser.avatar}
                alt="Me"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-900">Me</p>
              <p className="text-[10px] text-slate-500 font-semibold">
                {activeTab === 'MEGA' ? '4640 Points' : '0 Points'}
              </p>
            </div>
          </div>
          <div className="col-span-3 text-right font-extrabold text-xs text-slate-600">-</div>
        </div>

        {/* Competitor List */}
        <div className="space-y-2 mt-2">
          {(activeTab === 'MINI' ? miniLeaderboard : megaLeaderboard).map((item) => (
            <div
              key={item.name}
              className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs grid grid-cols-12 items-center"
            >
              {/* Medal / Rank */}
              <div className="col-span-2 flex items-center">
                {item.rank === 1 ? (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                    🥇
                  </div>
                ) : item.rank === 2 ? (
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-xs">
                    🥈
                  </div>
                ) : item.rank === 3 ? (
                  <div className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-xs">
                    🥉
                  </div>
                ) : (
                  <span className="font-black text-slate-700 text-xs px-2">{item.rank}</span>
                )}
              </div>

              {/* Player Avatar & Points */}
              <div className="col-span-7 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="truncate">
                  <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{item.points} Points</p>
                </div>
              </div>

              {/* Expected Prize */}
              <div className="col-span-3 text-right font-black text-xs text-slate-900 tabular-nums">
                {item.prize}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Floating Sticky Bottom Challenger Pill (From Screenshots 16, 17) */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-slate-300 shadow-xl rounded-full p-2 flex items-center justify-between pointer-events-auto">
          <div className="pl-3">
            <span className="text-xs font-black text-slate-900">Win ₹55L Cash Prize</span>
            <p className="text-[10px] text-slate-500 font-medium">End in: 18:50:19</p>
          </div>
          <button
            onClick={handleQuickPlay}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2 rounded-full shadow-md uppercase active:scale-95 transition-all"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};
