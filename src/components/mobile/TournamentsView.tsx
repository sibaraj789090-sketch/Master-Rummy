import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { Trophy, ArrowUpDown, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/sound';

export const TournamentsView: React.FC = () => {
  const { tournaments, joinTournament, currentUser, launchGame } = useRummy();

  const [subTab, setSubTab] = useState<'ALL' | 'MY'>('ALL');
  const [filterMinFee, setFilterMinFee] = useState<number | null>(null);

  const displayedTournaments = tournaments.filter((t) => {
    if (subTab === 'MY') {
      return t.registeredUserIds.includes(currentUser.id);
    }
    if (filterMinFee !== null) {
      return t.entryFee <= filterMinFee;
    }
    return true;
  });

  const handleJoin = (id: string) => {
    const res = joinTournament(id);
    if (!res.success) {
      alert(res.message);
    } else {
      sounds.playWinFanfare();
      alert(res.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-8 bg-[#f8fafc] text-slate-800 flex flex-col select-none">
      {/* Promotional Top Banner (From Screenshot 9 & 10) */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 p-2.5 text-white flex items-center justify-between shadow-inner">
        <div>
          <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
            RESTART GIFT
          </span>
          <p className="font-extrabold text-xs text-amber-100 mt-0.5">
            BUY 1 GET 4 · 15% CASH PLUS ON TOURNAMENTS
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-amber-200">Win up to</span>
          <p className="text-sm font-black text-white">₹10 Lakhs</p>
        </div>
      </div>

      {/* Sub Tabs: All Games | My Games */}
      <div className="bg-white flex border-b border-slate-200 text-xs font-extrabold">
        <button
          onClick={() => {
            sounds.playCardClick();
            setSubTab('ALL');
          }}
          className={`flex-1 py-3 text-center transition-colors relative ${
            subTab === 'ALL' ? 'text-red-700 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {subTab === 'ALL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          All Games
        </button>
        <button
          onClick={() => {
            sounds.playCardClick();
            setSubTab('MY');
          }}
          className={`flex-1 py-3 text-center transition-colors relative ${
            subTab === 'MY' ? 'text-red-700 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {subTab === 'MY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          My Games ({tournaments.filter((t) => t.registeredUserIds.includes(currentUser.id)).length})
        </button>
      </div>

      {/* Filter / Sort bar (From Screenshot 9 & 10) */}
      <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-900">
            Start <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </span>
          <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-900">
            Entry <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </span>
          <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-900">
            Prize Pool <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </span>
          <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-900">
            Join <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playCardClick();
            setFilterMinFee(filterMinFee === null ? 1 : null);
          }}
          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
            filterMinFee !== null
              ? 'bg-red-700 text-white border-red-700'
              : 'border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Filter</span>
        </button>
      </div>

      {/* Tournaments List */}
      <div className="p-3 space-y-3">
        {displayedTournaments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500 my-6">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">No tournaments registered yet</p>
            <p className="text-xs text-slate-400 mt-1">Join an open tournament from the "All Games" tab!</p>
          </div>
        ) : (
          displayedTournaments.map((t) => {
            const isRegistered = t.registeredUserIds.includes(currentUser.id);
            const isFull = t.joinedCount >= t.maxParticipants;
            const progress = Math.min(100, Math.round((t.joinedCount / t.maxParticipants) * 100));

            return (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-red-200 transition-all"
              >
                {/* Title & Start Time */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                      <span>{t.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Tournament Starts at <span className="font-bold text-slate-800">{t.timeDisplay}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Entry:</span>{' '}
                    <span className="text-xs font-black text-slate-900">
                      {t.entryFee === 0 ? 'Free' : `₹${t.entryFee}`}
                    </span>
                  </div>
                </div>

                {/* Reward & Join Button */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <Trophy className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Reward:</span>
                      <p className="text-xs font-extrabold text-slate-900">Rs {t.prizePool}*</p>
                    </div>
                  </div>

                  <div>
                    {isRegistered ? (
                      <button
                        onClick={() => {
                          sounds.playCardClick();
                          launchGame({
                            category: 'CASH',
                            variant: 'Points',
                            playersCount: 6,
                            pointValue: 2,
                            entryFee: t.entryFee || 10,
                            gameTypeDetail: t.title,
                          });
                        }}
                        className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PLAY TABLE</span>
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="bg-slate-100 text-slate-400 font-extrabold text-xs px-4 py-1.5 rounded-lg border border-slate-200 cursor-not-allowed uppercase"
                      >
                        FULL
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(t.id)}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs px-4 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all uppercase tracking-wide"
                      >
                        JOIN NOW
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? 'bg-slate-400' : 'bg-emerald-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-end text-[10px] text-slate-500 mt-1 tabular-nums font-semibold">
                    <span>
                      {t.joinedCount} Joined / {t.maxParticipants} Max
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
