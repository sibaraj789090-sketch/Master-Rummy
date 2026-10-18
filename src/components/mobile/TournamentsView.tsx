import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  Trophy,
  Clock,
  Coins,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Flame,
  ArrowUpDown,
  PlusCircle,
  Play
} from 'lucide-react';
import { sounds } from '../../utils/sound';

export const TournamentsView: React.FC = () => {
  const { tournaments, joinTournament, currentUser, launchGame, setActiveScreen } = useRummy();

  const [subTab, setSubTab] = useState<'ALL' | 'MY'>('ALL');
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'UNDER_25' | '25_100' | '100_PLUS' | 'JACKPOT'>('ALL');
  const [sortBy, setSortBy] = useState<'START' | 'ENTRY_ASC' | 'PRIZE_DESC'>('START');
  const [joinMessage, setJoinMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const totalBalance = currentUser.depositBalance + currentUser.withdrawalBalance;

  // Filter tournaments
  const filteredTournaments = tournaments.filter((t) => {
    if (subTab === 'MY') {
      return t.registeredUserIds.includes(currentUser.id);
    }
    if (feeFilter === 'UNDER_25') {
      return t.entryFee < 25;
    }
    if (feeFilter === '25_100') {
      return t.entryFee >= 25 && t.entryFee <= 100;
    }
    if (feeFilter === '100_PLUS') {
      return t.entryFee > 100;
    }
    if (feeFilter === 'JACKPOT') {
      return t.prizePool >= 50000;
    }
    return true;
  });

  // Sort tournaments
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    if (sortBy === 'ENTRY_ASC') {
      return a.entryFee - b.entryFee;
    }
    if (sortBy === 'PRIZE_DESC') {
      return b.prizePool - a.prizePool;
    }
    return 0; // Default order
  });

  const handleJoin = (id: string, title: string, fee: number) => {
    if (totalBalance < fee) {
      sounds.playCardClick();
      setJoinMessage({
        text: `Insufficient cash (₹${totalBalance.toFixed(2)}). Need ₹${fee} to join ${title}. Please Add Cash.`,
        type: 'error',
      });
      setTimeout(() => setJoinMessage(null), 4000);
      return;
    }

    const res = joinTournament(id);
    if (!res.success) {
      setJoinMessage({ text: res.message, type: 'error' });
    } else {
      sounds.playWinFanfare();
      setJoinMessage({ text: `Registered successfully for ${title}! Entry fee ₹${fee} deducted.`, type: 'success' });
    }
    setTimeout(() => setJoinMessage(null), 4000);
  };

  const myRegisteredCount = tournaments.filter((t) => t.registeredUserIds.includes(currentUser.id)).length;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#f8fafc] text-slate-800 flex flex-col select-none">
      {/* 1. Real Cash Tournaments Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#7a0c16] via-[#94111f] to-[#5c0810] text-white p-3.5 shadow-md overflow-hidden">
        <div className="absolute right-[-15px] top-[-10px] opacity-15 pointer-events-none">
          <Trophy className="w-32 h-32 text-amber-300" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Flame className="w-3 h-3 fill-stone-950" />
                REAL CASH TOURNAMENTS
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1 tracking-tight flex items-center gap-1.5">
              <span>Mega Prize Series</span>
              <span className="text-amber-300 text-sm font-extrabold">₹10 Lakhs+ Daily</span>
            </h1>
            <p className="text-[11px] text-amber-100/90 font-medium mt-0.5">
              Compete with real players & win instant withdrawable cash!
            </p>
          </div>

          {/* Wallet summary in header */}
          <div className="bg-black/30 border border-amber-400/30 rounded-xl px-2.5 py-1.5 text-right shrink-0">
            <span className="text-[9px] text-stone-300 uppercase font-bold tracking-wider">Your Balance</span>
            <p className="text-sm font-black text-amber-300">₹{totalBalance.toFixed(2)}</p>
            <button
              onClick={() => {
                sounds.playCoinSound();
                setActiveScreen('ADD_CASH');
              }}
              className="text-[9px] font-black text-white bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 rounded-md mt-1 flex items-center gap-1 justify-end ml-auto shadow-xs active:scale-95 transition-transform"
            >
              <PlusCircle className="w-2.5 h-2.5" />
              ADD CASH
            </button>
          </div>
        </div>
      </div>

      {/* Join Notification Toast */}
      {joinMessage && (
        <div
          className={`mx-3 mt-3 p-3 rounded-xl border text-xs font-bold shadow-md transition-all flex items-center justify-between ${
            joinMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {joinMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Zap className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{joinMessage.text}</span>
          </div>
          {joinMessage.type === 'error' && totalBalance < 10 && (
            <button
              onClick={() => {
                sounds.playCoinSound();
                setActiveScreen('ADD_CASH');
              }}
              className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-md ml-2 shrink-0 shadow-xs"
            >
              Add Cash
            </button>
          )}
        </div>
      )}

      {/* 2. Primary Tabs: All Tournaments | My Registrations */}
      <div className="bg-white flex border-b border-slate-200 text-xs font-extrabold sticky top-0 z-10 shadow-xs">
        <button
          onClick={() => {
            sounds.playCardClick();
            setSubTab('ALL');
          }}
          className={`flex-1 py-3 text-center transition-all relative ${
            subTab === 'ALL' ? 'text-red-700 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {subTab === 'ALL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          All Tournaments ({tournaments.length})
        </button>
        <button
          onClick={() => {
            sounds.playCardClick();
            setSubTab('MY');
          }}
          className={`flex-1 py-3 text-center transition-all relative ${
            subTab === 'MY' ? 'text-red-700 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {subTab === 'MY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          My Registrations ({myRegisteredCount})
        </button>
      </div>

      {/* 3. Filter Chips and Sorting Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200 p-2.5 flex flex-col gap-2">
        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold">
          <button
            onClick={() => {
              sounds.playCardClick();
              setFeeFilter('ALL');
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              feeFilter === 'ALL'
                ? 'bg-[#850d18] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Stakes
          </button>
          <button
            onClick={() => {
              sounds.playCardClick();
              setFeeFilter('UNDER_25');
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              feeFilter === 'UNDER_25'
                ? 'bg-[#850d18] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Under ₹25
          </button>
          <button
            onClick={() => {
              sounds.playCardClick();
              setFeeFilter('25_100');
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              feeFilter === '25_100'
                ? 'bg-[#850d18] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ₹25 - ₹100
          </button>
          <button
            onClick={() => {
              sounds.playCardClick();
              setFeeFilter('100_PLUS');
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              feeFilter === '100_PLUS'
                ? 'bg-[#850d18] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            High Stakes (₹100+)
          </button>
          <button
            onClick={() => {
              sounds.playCardClick();
              setFeeFilter('JACKPOT');
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              feeFilter === 'JACKPOT'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
            }`}
          >
            <Sparkles className="w-3 h-3 fill-current" />
            ₹50K+ Jackpots
          </button>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
          <span className="font-semibold">
            Showing <strong className="text-slate-800">{sortedTournaments.length}</strong> tournaments
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sort by:</span>
            <button
              onClick={() => {
                sounds.playCardClick();
                setSortBy(sortBy === 'START' ? 'PRIZE_DESC' : sortBy === 'PRIZE_DESC' ? 'ENTRY_ASC' : 'START');
              }}
              className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold hover:bg-slate-50 text-[11px]"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <span>
                {sortBy === 'START' && 'Time'}
                {sortBy === 'PRIZE_DESC' && 'Prize: High to Low'}
                {sortBy === 'ENTRY_ASC' && 'Entry: Low to High'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tournaments Cards List */}
      <div className="p-3 space-y-3">
        {sortedTournaments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 my-4 shadow-xs">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-extrabold text-sm text-slate-800">No tournaments match this filter</p>
            <p className="text-xs text-slate-400 mt-1">
              {subTab === 'MY'
                ? 'You have not joined any tournaments yet. Join one from the "All Tournaments" tab!'
                : 'Try selecting a different filter above to see more tournaments.'}
            </p>
            {subTab === 'MY' && (
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setSubTab('ALL');
                }}
                className="mt-3 bg-red-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm hover:bg-red-800 transition-colors"
              >
                Browse All Tournaments
              </button>
            )}
          </div>
        ) : (
          sortedTournaments.map((t) => {
            const isRegistered = t.registeredUserIds.includes(currentUser.id);
            const isFull = t.joinedCount >= t.maxParticipants;
            const progress = Math.min(100, Math.round((t.joinedCount / t.maxParticipants) * 100));
            const isMega = t.prizePool >= 100000;

            return (
              <div
                key={t.id}
                className={`bg-white border rounded-2xl p-4 shadow-xs transition-all relative overflow-hidden ${
                  isRegistered
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                    : isMega
                    ? 'border-amber-300 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Badge & Entry */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isRegistered ? (
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        REGISTERED
                      </span>
                    ) : isFull ? (
                      <span className="text-[10px] font-extrabold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        HOUSE FULL
                      </span>
                    ) : isMega ? (
                      <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 fill-stone-950" />
                        MEGA JACKPOT
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        REGISTRATION OPEN
                      </span>
                    )}

                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {t.timeDisplay}
                    </span>
                  </div>

                  {/* Entry fee pill */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Entry:</span>
                    <span className="text-sm font-black text-slate-900 bg-amber-100 border border-amber-300/60 px-2 py-0.5 rounded-lg">
                      ₹{t.entryFee}
                    </span>
                  </div>
                </div>

                {/* Tournament Title */}
                <div className="mt-2.5">
                  <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
                    <span>{t.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </h3>
                </div>

                {/* Prize Pool and Action */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-stone-950 shadow-sm shrink-0">
                      <Trophy className="w-5 h-5 fill-stone-950" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Prize Pool
                      </span>
                      <p className="text-base font-black text-slate-900 leading-none mt-0.5">
                        ₹{t.prizePool.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {isRegistered ? (
                      <button
                        onClick={() => {
                          sounds.playCardClick();
                          launchGame({
                            category: 'TOURNAMENTS',
                            variant: 'Points',
                            playersCount: 6,
                            pointValue: 2,
                            entryFee: t.entryFee,
                            gameTypeDetail: t.title,
                          });
                        }}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md active:scale-95 transition-all animate-pulse"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>PLAY TABLE</span>
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="bg-slate-100 text-slate-400 font-black text-xs px-4 py-2 rounded-xl border border-slate-200 cursor-not-allowed uppercase"
                      >
                        FULL
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(t.id, t.title, t.entryFee)}
                        className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-[#850d18] hover:from-red-500 hover:to-red-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md active:scale-95 transition-all tracking-wide uppercase"
                      >
                        <span>JOIN NOW</span>
                        <span className="bg-black/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-black ml-0.5">
                          ₹{t.entryFee}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Participants Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull
                          ? 'bg-slate-400'
                          : isMega
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-semibold tabular-nums">
                    <span>
                      {progress}% filled ({t.joinedCount} players)
                    </span>
                    <span>Max {t.maxParticipants}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Tournament Info & Rules Footer */}
      <div className="mx-3 mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
        <div className="font-extrabold text-slate-800 flex items-center gap-1 text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Real Cash Tournament Rules</span>
        </div>
        <p>• All players get equal starting chips. Winners progress round by round.</p>
        <p>• Winning prizes are credited directly to your withdrawable cash balance.</p>
        <p>• If you register and are unable to play, tournament rules apply.</p>
      </div>
    </div>
  );
};
