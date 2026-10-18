import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { CashGameVariant, GameCategory, PlayersCount, GameRoom, RoomPlayer } from '../../types/rummy';
import {
  Trophy,
  Coins,
  Settings,
  Minus,
  Plus,
  Gift,
  Sparkles,
  ChevronRight,
  Info,
  Users,
  Copy,
  Check,
  Zap,
  KeyRound,
  X,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import { TournamentsView } from './TournamentsView';
import { multiplayerService } from '../../services/multiplayerService';

interface LobbyViewProps {
  onOpenAddCash: () => void;
  onOpenTournaments: () => void;
  onOpenInstall?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  onOpenAddCash,
  onOpenTournaments,
  onOpenInstall,
}) => {
  const { launchGame, currentUser, adminSettings, setMultiplayerState } = useRummy();

  // Matchmaking & Room Code states
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [matchedRoom, setMatchedRoom] = useState<GameRoom | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [matchingStatus, setMatchingStatus] = useState<string>('Searching for opponents...');
  const [countdown, setCountdown] = useState<number | null>(null);

  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Primary tab: CASH | TOURNAMENTS | PRACTICE
  const [category, setCategory] = useState<GameCategory>('CASH');

  // Sub-tabs under CASH / PRACTICE
  const [variant, setVariant] = useState<CashGameVariant>('Points');
  const [playersCount, setPlayersCount] = useState<PlayersCount>(6);

  // Variant specific parameters
  const [pointsType, setPointsType] = useState<'Classic' | 'Double'>('Classic');
  const [poolType, setPoolType] = useState<'101' | '201'>('101');
  const [dealsCount, setDealsCount] = useState<'2' | '3'>('2');

  // Sliders
  // For Points: Point values [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 125]
  const pointSteps = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 125];
  const [pointIndex, setPointIndex] = useState(0);

  // For Pool: Entry fees [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000]
  const poolSteps = [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000];
  const [poolIndex, setPoolIndex] = useState(1); // default ₹2

  // For Deals: Entry fees [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000, 2000]
  const dealSteps = [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000, 2000];
  const [dealIndex, setDealIndex] = useState(1); // default ₹2

  // Practice sliders
  const [practicePointIndex, setPracticePointIndex] = useState(2); // 50 pts

  // Promo Gift Modal
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftClaimed, setGiftClaimed] = useState(false);

  // Computed values
  const currentPointVal = pointSteps[pointIndex];
  const minEntryForPoints = Math.round(currentPointVal * 80); // 80 points standard Indian rummy table limit

  const currentPoolEntry = poolSteps[poolIndex];
  const currentDealEntry = dealSteps[dealIndex];
  const triggerFullscreenRotate = () => {
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
        }
      }
    } catch {}
  };

  const handlePlayNow = async () => {
    triggerFullscreenRotate();
    if (category === 'TOURNAMENTS') {
      onOpenTournaments();
      return;
    }

    sounds.playCoinSound();
    setIsMatchmakingOpen(true);
    setMatchingStatus('Connecting to Realtime matchmaking...');
    setCountdown(null);

    const entryFee =
      variant === 'Points'
        ? minEntryForPoints
        : variant === 'Pool'
        ? currentPoolEntry
        : currentDealEntry;

    try {
      const { room, player } = await multiplayerService.findOrCreateMatch({
        variant,
        maxPlayers: playersCount,
        entryChips: entryFee,
        pointValue: currentPointVal,
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      });

      setMatchedRoom(room);
      setRoomPlayers([player]);

      // Subscribe to Realtime room updates
      multiplayerService.subscribeToRoom(room.id, {
        onPlayersChange: (players) => {
          setRoomPlayers(players);
          if (players.length >= 2) {
            setMatchingStatus('All players seated! Starting cards deal...');
            setCountdown(2);
          }
        },
      });

      // Launch session
      setTimeout(async () => {
        setMatchingStatus('Dealing 13 cards...');
        const session = await multiplayerService.startSession(room.id);
        setMultiplayerState(room, player, session);
        launchGame({
          category,
          variant,
          playersCount,
          pointValue: currentPointVal,
          entryFee,
          gameTypeDetail: variant === 'Points' ? pointsType : variant === 'Pool' ? poolType : dealsCount,
          roomId: room.id,
          isMultiplayer: true,
        });
        setIsMatchmakingOpen(false);
      }, 2200);
    } catch (err: any) {
      console.warn('Matchmaking fallback:', err);
      launchGame({
        category,
        variant,
        playersCount,
        pointValue: currentPointVal,
        entryFee,
        gameTypeDetail: variant === 'Points' ? pointsType : variant === 'Pool' ? poolType : dealsCount,
      });
      setIsMatchmakingOpen(false);
    }
  };

  const handleJoinCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInputValue.trim();
    if (!clean || clean.length < 5) {
      setCodeError('Please enter a valid room code');
      return;
    }

    setIsJoining(true);
    setCodeError(null);
    sounds.playCardClick();

    const res = await multiplayerService.joinRoomByCode(clean, {
      id: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
    });

    if (res.success && res.room && res.player) {
      sounds.playWinFanfare();
      const session = await multiplayerService.startSession(res.room.id);
      setMultiplayerState(res.room, res.player, session);
      launchGame({
        category: 'CASH',
        variant: res.room.variant,
        playersCount: res.room.max_players,
        pointValue: res.room.point_value,
        entryFee: res.room.entry_chips,
        roomId: res.room.id,
        isMultiplayer: true,
      });
      setIsJoinCodeOpen(false);
    } else {
      setCodeError(res.error || 'Room not found or table is full');
    }
    setIsJoining(false);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-6 bg-[#f8fafc] text-slate-800 flex flex-col relative select-none">
      {/* 1. Dynamic Promotional Hero Banner (From Screenshots 1, 6, 7) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#7f0b15] via-[#a31522] to-[#60050e] text-white p-3 shadow-inner">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                BUY 1 GET 3
              </span>
              <span className="text-[11px] font-bold text-amber-200">Free 2-Day Rewards</span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5 tracking-tight">
              WELCOME BACK UP TO <span className="text-yellow-300">₹398*</span>
            </h2>
            <p className="text-[11px] text-white/80 line-clamp-1">Recharge once and get instant extra cashback</p>
          </div>

          <div
            onClick={() => {
              sounds.playCoinSound();
              onOpenAddCash();
            }}
            className="w-16 h-14 rounded-lg overflow-hidden bg-black/20 border border-amber-400/40 shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-md relative"
          >
            <img
              src="/src/assets/images/rummy_buy_get_banner_1792280693617.jpg"
              alt="Promo Gift"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-0.5">
              <span className="text-[8px] font-black text-amber-300 uppercase">CLAIM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Main Category Tabs: CASH | TOURNAMENTS | PRACTICE (From Screenshots 1, 6, 7, 8) */}
      <div className="bg-white grid grid-cols-3 border-b border-slate-200 shadow-xs">
        {/* CASH Tab */}
        <button
          onClick={() => {
            sounds.playCardClick();
            setCategory('CASH');
          }}
          className={`py-3 px-2 flex flex-col items-center justify-center relative transition-all ${
            category === 'CASH'
              ? 'bg-[#850d18] text-white font-bold shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {category === 'CASH' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#850d18]" />
          )}
          <Coins className={`w-5 h-5 mb-0.5 ${category === 'CASH' ? 'text-amber-300' : 'text-slate-500'}`} />
          <span className="text-xs uppercase font-extrabold tracking-wide">CASH</span>
        </button>

        {/* TOURNAMENTS Tab */}
        <button
          onClick={() => {
            sounds.playCardClick();
            onOpenTournaments();
          }}
          className={`py-3 px-2 flex flex-col items-center justify-center relative transition-all ${
            category === 'TOURNAMENTS'
              ? 'bg-[#850d18] text-white font-bold shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {category === 'TOURNAMENTS' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#850d18]" />
          )}
          <Trophy className={`w-5 h-5 mb-0.5 ${category === 'TOURNAMENTS' ? 'text-amber-300' : 'text-slate-500'}`} />
          <span className="text-xs uppercase font-extrabold tracking-wide">TOURNAMENTS</span>
        </button>

        {/* PRACTICE Tab */}
        <button
          onClick={() => {
            sounds.playCardClick();
            setCategory('PRACTICE');
          }}
          className={`py-3 px-2 flex flex-col items-center justify-center relative transition-all ${
            category === 'PRACTICE'
              ? 'bg-[#850d18] text-white font-bold shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {category === 'PRACTICE' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#850d18]" />
          )}
          <Settings className={`w-5 h-5 mb-0.5 ${category === 'PRACTICE' ? 'text-amber-300' : 'text-slate-500'}`} />
          <span className="text-xs uppercase font-extrabold tracking-wide">PRACTICE</span>
        </button>
      </div>

      {/* If TOURNAMENTS is selected, render Tournaments view directly */}
      {category === 'TOURNAMENTS' ? (
        <TournamentsView />
      ) : (
        <>
          {/* 3. Sub-Tabs: Points | Pool | Deals (From Screenshots 1, 6, 7) */}
          <div className="bg-slate-100 flex items-center justify-around border-b border-slate-300/80">
            <button
              onClick={() => {
                sounds.playCardClick();
                setVariant('Points');
              }}
              className={`flex-1 py-2.5 text-center text-xs font-bold transition-all relative ${
                variant === 'Points' ? 'text-red-700 bg-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {variant === 'Points' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
              Points
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                setVariant('Pool');
              }}
              className={`flex-1 py-2.5 text-center text-xs font-bold transition-all relative ${
                variant === 'Pool' ? 'text-red-700 bg-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {variant === 'Pool' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
              Pool
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                setVariant('Deals');
              }}
              className={`flex-1 py-2.5 text-center text-xs font-bold transition-all relative ${
                variant === 'Deals' ? 'text-red-700 bg-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {variant === 'Deals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
              Deals
            </button>
          </div>

          {/* 4. Practice Chips Badge if in Practice Mode */}
          {category === 'PRACTICE' && (
            <div className="px-4 pt-3 flex justify-center">
              <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-4 h-4 rounded-full bg-red-700 text-white font-black flex items-center justify-center text-[10px]">
                  ♣
                </span>
                <span>Practice Chips:</span>
                <span className="font-extrabold tabular-nums">{currentUser.practiceChips.toLocaleString()}</span>
              </div>
            </div>
          )}

      {/* 5. Main Game Configuration Panel */}
      <div className="p-4 flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
        <div className="space-y-6">
          {/* Select Players: 2 or 6 (From Screenshots 1, 6, 7) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-extrabold text-slate-700 text-center mb-1.5">Select Players</p>
              <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-0.5 shadow-xs">
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setPlayersCount(2);
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                    playersCount === 2 ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    setPlayersCount(6);
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                    playersCount === 6 ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  6
                </button>
              </div>
            </div>

            {/* Game Type Selection (Based on Variant) */}
            <div>
              <p className="text-xs font-extrabold text-slate-700 text-center mb-1.5">Game Type</p>

              {variant === 'Points' && (
                <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-0.5 shadow-xs">
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setPointsType('Classic');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                      pointsType === 'Classic' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setPointsType('Double');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                      pointsType === 'Double' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Double
                  </button>
                </div>
              )}

              {variant === 'Pool' && (
                <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-0.5 shadow-xs">
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setPoolType('101');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                      poolType === '101' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    101 Pool
                  </button>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setPoolType('201');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                      poolType === '201' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    201 Pool
                  </button>
                </div>
              )}

              {variant === 'Deals' && (
                <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-0.5 shadow-xs">
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setDealsCount('2');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                      dealsCount === '2' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    2 Deals
                  </button>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      setDealsCount('3');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-md transition-colors ${
                      dealsCount === '3' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    3 Deals
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rules Summary Badge for Current Game Mode */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 shadow-xs text-center text-xs">
            {variant === 'Points' && (
              <div>
                <span className="font-black text-amber-950 uppercase tracking-wide">Points Rummy</span>
                <p className="text-[11px] text-amber-900/90 mt-0.5">
                  1 Round · ₹{currentPointVal}/point · Max penalty 80 pts · Drop: 20 pts (1st) / 40 pts (Mid)
                </p>
              </div>
            )}
            {variant === 'Pool' && (
              <div>
                <span className="font-black text-amber-950 uppercase tracking-wide">
                  {poolType} Pool Rummy
                </span>
                <p className="text-[11px] text-amber-900/90 mt-0.5">
                  Cumulative scoring · Elimination at {poolType} pts · Drop: {poolType === '101' ? '20' : '25'} pts (1st) / {poolType === '101' ? '40' : '50'} pts (Mid) · Last survivor wins
                </p>
              </div>
            )}
            {variant === 'Deals' && (
              <div>
                <span className="font-black text-amber-950 uppercase tracking-wide">
                  {dealsCount} Deals Rummy
                </span>
                <p className="text-[11px] text-amber-900/90 mt-0.5">
                  Exactly {dealsCount} deals · Scores accumulate across all deals · Lowest cumulative score wins table
                </p>
              </div>
            )}
          </div>

          {/* Value Display / Min Entry indicator (From Screenshots 1, 6, 7) */}
          <div className="text-center pt-1">
            {variant === 'Points' ? (
              <div className="flex items-center justify-center gap-3 text-sm font-bold">
                <span className="text-slate-600">
                  Point Value <span className="font-extrabold text-slate-900 text-base">₹{currentPointVal}</span>
                </span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-600">
                  Min Entry <span className="font-extrabold text-red-700 text-base">₹{minEntryForPoints}</span>
                </span>
              </div>
            ) : (
              <div className="text-base font-extrabold text-slate-900">
                Entry Fee <span className="text-xl text-red-700">₹{variant === 'Pool' ? currentPoolEntry : currentDealEntry}</span>
              </div>
            )}
          </div>

          {/* Stepper & Slider Control with [-] and [+] (From Screenshots 1, 6, 7) */}
          <div className="px-2">
            <div className="flex items-center gap-3">
              {/* Minus Button */}
              <button
                onClick={() => {
                  sounds.playCardClick();
                  if (variant === 'Points') setPointIndex(Math.max(0, pointIndex - 1));
                  else if (variant === 'Pool') setPoolIndex(Math.max(0, poolIndex - 1));
                  else setDealIndex(Math.max(0, dealIndex - 1));
                }}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center shadow-xs transition-colors shrink-0"
              >
                <Minus className="w-5 h-5" />
              </button>

              {/* Slider Input */}
              <div className="flex-1 relative py-2">
                <input
                  type="range"
                  min={0}
                  max={
                    variant === 'Points'
                      ? pointSteps.length - 1
                      : variant === 'Pool'
                      ? poolSteps.length - 1
                      : dealSteps.length - 1
                  }
                  value={variant === 'Points' ? pointIndex : variant === 'Pool' ? poolIndex : dealIndex}
                  onChange={(e) => {
                    sounds.playCardClick();
                    const val = Number(e.target.value);
                    if (variant === 'Points') setPointIndex(val);
                    else if (variant === 'Pool') setPoolIndex(val);
                    else setDealIndex(val);
                  }}
                  className="w-full accent-emerald-600 h-2 bg-slate-300 rounded-lg cursor-pointer"
                />

                {/* Slider Tick Markers */}
                <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1 mt-1 tabular-nums">
                  {variant === 'Points' ? (
                    <>
                      <span>0.05</span>
                      <span>0.5</span>
                      <span>10</span>
                      <span>125</span>
                    </>
                  ) : variant === 'Pool' ? (
                    <>
                      <span>1</span>
                      <span>10</span>
                      <span>200</span>
                      <span>5000</span>
                    </>
                  ) : (
                    <>
                      <span>1</span>
                      <span>10</span>
                      <span>100</span>
                      <span>2000</span>
                    </>
                  )}
                </div>
              </div>

              {/* Plus Button */}
              <button
                onClick={() => {
                  sounds.playCardClick();
                  if (variant === 'Points') setPointIndex(Math.min(pointSteps.length - 1, pointIndex + 1));
                  else if (variant === 'Pool') setPoolIndex(Math.min(poolSteps.length - 1, poolIndex + 1));
                  else setDealIndex(Math.min(dealSteps.length - 1, dealIndex + 1));
                }}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: PLAY NOW + JOIN WITH CODE */}
        <div className="mt-6 flex flex-col items-center gap-2.5 w-full max-w-xs mx-auto">
          <button
            onClick={handlePlayNow}
            className="w-full py-3.5 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white font-black text-lg tracking-wider rounded-xl shadow-lg border border-emerald-400/50 active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 fill-white" />
            <span>PLAY NOW</span>
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              setIsJoinCodeOpen(true);
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Join with 6-Digit Room Code</span>
          </button>

          <p className="text-[10px] text-slate-500 font-semibold text-center mt-1">
            Certified RNG · Anti-Cheat RLS · Realtime Supabase Matchmaking
          </p>
        </div>
      </div>
    </>
  )}

      {/* Matchmaking Overlay Dialog */}
      {isMatchmakingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#59040c] border border-amber-400/50 text-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => {
                sounds.playCardClick();
                setIsMatchmakingOpen(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/70"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 animate-spin">
              <Zap className="w-7 h-7 text-amber-400" />
            </div>

            <h3 className="text-xl font-black text-white italic tracking-tight">
              MASTER RUMMY MATCHMAKING
            </h3>
            <p className="text-xs text-amber-300 font-bold mt-1">
              {variant} Rummy · {playersCount} Players Table
            </p>

            {matchedRoom && (
              <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-3 my-4">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Invite Code (Share with Friend or 2nd Device)
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-2xl font-black text-amber-300 tracking-widest font-mono">
                    #{matchedRoom.room_code}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      navigator.clipboard.writeText(matchedRoom.room_code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 font-bold"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Players in Room */}
            <div className="my-3">
              <span className="text-[10px] uppercase text-stone-300 font-bold tracking-wider block mb-2">
                Seated Players ({roomPlayers.length}/{playersCount})
              </span>
              <div className="flex items-center justify-center gap-3">
                {roomPlayers.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={p.avatar}
                        alt={p.username}
                        className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-stone-900" />
                    </div>
                    <span className="text-[10px] font-bold text-white mt-1 max-w-[70px] truncate">
                      {p.username}
                    </span>
                  </div>
                ))}
                {/* Empty seat slot */}
                {roomPlayers.length < playersCount && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-400/60 flex items-center justify-center bg-black/20 animate-pulse">
                      <Users className="w-5 h-5 text-stone-400" />
                    </div>
                    <span className="text-[10px] text-stone-400 font-semibold mt-1">
                      {playersCount === 2 ? 'Waiting Opponent...' : 'Searching...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-stone-200 mt-2 font-medium">
              {matchingStatus}
            </p>

            {countdown !== null && (
              <div className="text-amber-300 font-black text-2xl mt-2 animate-bounce">
                Starting in {countdown}s...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Room by Code Modal */}
      {isJoinCodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
          <div className="bg-stone-900 border border-stone-700 text-white rounded-3xl p-5 max-w-xs w-full shadow-2xl relative">
            <button
              onClick={() => {
                sounds.playCardClick();
                setIsJoinCodeOpen(false);
              }}
              className="absolute top-3.5 right-3.5 p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">Join Room by Code</h3>
            </div>

            <p className="text-xs text-stone-300 mb-3">
              Enter the 6-digit room code from your opponent or second device:
            </p>

            <form onSubmit={handleJoinCodeSubmit} className="space-y-3">
              <input
                type="text"
                maxLength={8}
                value={codeInputValue}
                onChange={(e) => setCodeInputValue(e.target.value.toUpperCase())}
                placeholder="e.g. 849201"
                className="w-full text-center bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-black text-xl tracking-widest focus:outline-hidden focus:border-amber-400"
              />

              {codeError && (
                <p className="text-xs text-rose-400 font-semibold">{codeError}</p>
              )}

              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all"
              >
                {isJoining ? 'JOINING TABLE...' : 'JOIN TABLE & PLAY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Floating Gift Reward Button */}
      <div className="fixed right-3 bottom-16 flex flex-col items-center gap-3 z-20">

        {/* GIFT Prize Box */}
        <button
          onClick={() => {
            sounds.playCoinSound();
            setShowGiftModal(true);
          }}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 text-white p-1 shadow-xl border-2 border-amber-300 flex flex-col items-center justify-center hover:scale-105 transition-transform"
        >
          <Gift className="w-6 h-6 text-amber-200" />
          <span className="text-[8px] font-black tracking-tighter uppercase">GIFT</span>
        </button>
      </div>

      {/* Daily Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-stone-900 border border-amber-400/40 rounded-2xl p-5 max-w-xs w-full text-center text-white relative shadow-2xl">
            <Gift className="w-14 h-14 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-black text-amber-300">Daily Login Bonus Gift</h3>
            <p className="text-xs text-stone-300 mt-1">Claim your lucky daily scratch reward on Master Rummy!</p>

            <div className="bg-stone-950 border border-amber-500/30 rounded-xl p-4 my-4">
              <span className="text-xs text-stone-400">Bonus Cash Prize</span>
              <p className="text-3xl font-black text-amber-400 mt-0.5">₹50.00</p>
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Instant Wallet Credit</p>
            </div>

            <button
              onClick={() => {
                sounds.playWinFanfare();
                setGiftClaimed(true);
                setTimeout(() => {
                  setShowGiftModal(false);
                }, 1200);
              }}
              disabled={giftClaimed}
              className={`w-full py-2.5 rounded-lg font-extrabold text-sm uppercase tracking-wider ${
                giftClaimed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:brightness-110'
              }`}
            >
              {giftClaimed ? 'CLAIMED! +₹50' : 'CLAIM FREE REWARD'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
