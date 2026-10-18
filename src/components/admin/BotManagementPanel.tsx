import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { BotProfile, BotSettings } from '../../types/rummy';
import { queryBotPool, getBotByIndex } from '../../utils/botEngine';
import { sounds } from '../../utils/sound';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  Trophy,
  Activity,
  RotateCw,
  Coins,
  TrendingUp,
  MessageSquare,
  EyeOff,
  Flame,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';

export const BotManagementPanel: React.FC = () => {
  const {
    botSettings,
    botStats,
    updateBotSettings,
    resetBotSettings,
    triggerAdminBotWinOverride,
    simulateBotBatchGames,
  } = useRummy();

  // Local state for 100k+ Bot Directory Explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedVip, setSelectedVip] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBotModal, setSelectedBotModal] = useState<BotProfile | null>(null);

  // Simulation state
  const [simulationCount, setSimulationCount] = useState<number>(500);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [lastSimResult, setLastSimResult] = useState<{
    botWins: number;
    playerWins: number;
    winRate: number;
    total: number;
  } | null>(null);

  const [saveToast, setSaveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Query the 100k+ bot pool
  const { bots, totalMatching } = queryBotPool({
    searchQuery,
    state: selectedState || undefined,
    vipTier: selectedVip || undefined,
    page: currentPage,
    pageSize: 15,
  });

  const totalPages = Math.ceil(totalMatching / 15);

  const handleApplyPreset = (mode: BotSettings['aiMode']) => {
    sounds.playCoinSound();
    if (mode === 'MASTER_97') {
      updateBotSettings({
        aiMode: 'MASTER_97',
        botWinRatePercent: 97,
        playerTargetWinRatePercent: 3,
        turnDelaySeconds: 1.6,
        smartDiscardEnabled: true,
        smartDrawEnabled: true,
        dropProbabilityPercent: 5,
      });
      triggerToast('Preset Applied: Master AI (97% Bot Win Rate)');
    } else if (mode === 'PLAYER_ADVANTAGE_67_78') {
      updateBotSettings({
        aiMode: 'PLAYER_ADVANTAGE_67_78',
        botWinRatePercent: 28,
        playerTargetWinRatePercent: 72,
        turnDelaySeconds: 2.2,
        smartDiscardEnabled: true,
        smartDrawEnabled: true,
        dropProbabilityPercent: 18,
      });
      triggerToast('Preset Applied: Real Player Advantage (67% - 78% Win Rate)');
    } else if (mode === 'BALANCED_50') {
      updateBotSettings({
        aiMode: 'BALANCED_50',
        botWinRatePercent: 50,
        playerTargetWinRatePercent: 50,
        turnDelaySeconds: 1.8,
        smartDiscardEnabled: true,
        smartDrawEnabled: true,
        dropProbabilityPercent: 10,
      });
      triggerToast('Preset Applied: Balanced 50/50 Matchmaking');
    }
  };

  const handleRunSimulation = (count: number) => {
    sounds.playCardDeal();
    setSimulationRunning(true);
    setTimeout(() => {
      const res = simulateBotBatchGames(count);
      setLastSimResult({
        ...res,
        total: count,
      });
      setSimulationRunning(false);
      sounds.playWinFanfare();
      triggerToast(`Simulated ${count} games! Measured Bot Win Rate: ${res.winRate}%`);
    }, 700);
  };

  const calculatedBotWinRate = botStats.totalGamesTracked > 0
    ? ((botStats.botWinsCount / botStats.totalGamesTracked) * 100).toFixed(1)
    : '97.0';

  const calculatedPlayerWinRate = botStats.totalGamesTracked > 0
    ? ((botStats.playerWinsCount / botStats.totalGamesTracked) * 100).toFixed(1)
    : '3.0';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-white flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-yellow-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Stealth Protection Banner */}
      <div className="bg-gradient-to-r from-purple-950/90 via-stone-900 to-stone-950 border border-purple-500/40 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white tracking-wide">
                100k+ Real-Time Bot Intelligence & Matchmaking Suite
              </h2>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                100% Hidden Server-Side
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl">
              Real players will <strong>never</strong> know opponents are simulated. Every bot has authentic Indian player names, phone-style IDs, real profile avatars, VIP levels, realistic turn timers (1.5s–3s), and in-game Hinglish chat reactions.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 bg-stone-950/80 border border-stone-800 p-2 rounded-2xl shrink-0">
          <span className="text-xs font-bold text-stone-300">Bot Engine:</span>
          <button
            onClick={() => {
              sounds.playCardClick();
              updateBotSettings({ enabled: !botSettings.enabled });
              triggerToast(botSettings.enabled ? 'Bot System Paused' : 'Bot System Activated');
            }}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${
              botSettings.enabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700'
            }`}
          >
            {botSettings.enabled ? (
              <>
                <Check className="w-4 h-4 text-yellow-300" />
                <span>ONLINE & ACTIVE</span>
              </>
            ) : (
              <span>DISABLED</span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bot Pool</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {botStats.totalBotPoolSize.toLocaleString()}+
          </div>
          <div className="text-[11px] text-purple-300 mt-1 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>28 Indian States & VIP 1–Master</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Empirical Bot Win Rate</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {calculatedBotWinRate}%
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Target Setting: <strong className="text-white">{botSettings.botWinRatePercent}%</strong>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Real Player Win Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {calculatedPlayerWinRate}%
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Target Setting: <strong className="text-white">{botSettings.playerTargetWinRatePercent}%</strong>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Bots in Tables</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {botStats.activeBotsPlaying.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-semibold">
            Across Points, Pool 101/201, Deals
          </div>
        </div>
      </div>

      {/* Preset Win Rate Strategies (Directly from User Brief) */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Quick Win Rate Presets (Single Click Mode)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Instantly toggle between Master 97% Bot Domination or Real Player 67%–78% retention mode.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-400 bg-stone-950 px-3 py-1 rounded-full border border-stone-800">
            Active Mode: <span className="text-amber-400 font-black">{botSettings.aiMode}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset 1: 97% Bot Win Rate (Requested) */}
          <div
            onClick={() => handleApplyPreset('MASTER_97')}
            className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
              botSettings.aiMode === 'MASTER_97'
                ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
            }`}
          >
            {botSettings.aiMode === 'MASTER_97' && (
              <div className="absolute top-2 right-2 bg-amber-400 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                ACTIVE
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                👑
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Master Bots (97% Win Rate)</h4>
                <span className="text-[10px] text-amber-400 font-bold">Requested Default Mode</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              Hyper-advanced bots that calculate optimal pure sequences, minimize deadwood discards, and declare with 97% win rate precision on turns 4–7.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-stone-800/80">
              <span className="text-amber-300">Bot Win: 97%</span>
              <span className="text-stone-400">Player Win: 3%</span>
            </div>
          </div>

          {/* Preset 2: 67-78% Player Win Rate (Requested) */}
          <div
            onClick={() => handleApplyPreset('PLAYER_ADVANTAGE_67_78')}
            className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
              botSettings.aiMode === 'PLAYER_ADVANTAGE_67_78'
                ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
            }`}
          >
            {botSettings.aiMode === 'PLAYER_ADVANTAGE_67_78' && (
              <div className="absolute top-2 right-2 bg-emerald-400 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                ACTIVE
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                🎯
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Player Sweet Spot (67%–78%)</h4>
                <span className="text-[10px] text-emerald-400 font-bold">Retention & Deposit Mode</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              Regulates bot declare timings to ensure real players win 67% to 78% of their matches, boosting satisfaction, engagement, and deposits.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-stone-800/80">
              <span className="text-stone-400">Bot Win: ~28%</span>
              <span className="text-emerald-300">Player Win: 72%</span>
            </div>
          </div>

          {/* Preset 3: Balanced Pro 50/50 */}
          <div
            onClick={() => handleApplyPreset('BALANCED_50')}
            className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
              botSettings.aiMode === 'BALANCED_50'
                ? 'bg-blue-950/40 border-blue-400 ring-2 ring-blue-400/50 shadow-lg'
                : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
            }`}
          >
            {botSettings.aiMode === 'BALANCED_50' && (
              <div className="absolute top-2 right-2 bg-blue-400 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                ACTIVE
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                ⚖️
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Balanced 50/50 Competition</h4>
                <span className="text-[10px] text-blue-400 font-bold">Neutral Fair Play</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              Equal 50/50 win odds between real players and bots. Bots play standard pro Indian rummy rules without positive or negative bias.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-stone-800/80">
              <span className="text-stone-300">Bot Win: 50%</span>
              <span className="text-stone-300">Player Win: 50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fine-Tuning Sliders & Live Overrides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Box */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Fine-Grained AI Parameter Sliders
            </h3>
            <button
              onClick={() => {
                resetBotSettings();
                triggerToast('Reset to Default Settings (Master 97%)');
              }}
              className="text-[11px] text-stone-400 hover:text-amber-300 font-bold underline"
            >
              Reset Defaults
            </button>
          </div>

          <div className="space-y-4">
            {/* Bot Win Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-300">Bot Target Win Rate:</span>
                <span className="text-amber-300 font-mono font-black text-sm">
                  {botSettings.botWinRatePercent}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="99"
                step="1"
                value={botSettings.botWinRatePercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateBotSettings({
                    aiMode: 'CUSTOM',
                    botWinRatePercent: val,
                    playerTargetWinRatePercent: 100 - val,
                  });
                }}
                className="w-full accent-amber-500 h-2 bg-stone-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                <span>10% (Casual)</span>
                <span>50% (Fair)</span>
                <span>97% (Master)</span>
                <span>99% (Invincible)</span>
              </div>
            </div>

            {/* Real Player Target Win Rate */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-300">Real Player Target Win Rate:</span>
                <span className="text-emerald-400 font-mono font-black text-sm">
                  {botSettings.playerTargetWinRatePercent}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                value={botSettings.playerTargetWinRatePercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateBotSettings({
                    aiMode: 'CUSTOM',
                    playerTargetWinRatePercent: val,
                    botWinRatePercent: 100 - val,
                  });
                }}
                className="w-full accent-emerald-500 h-2 bg-stone-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                <span>3% (Hard)</span>
                <span>50% (Normal)</span>
                <span>67%–78% (Sweet Spot)</span>
                <span>90% (Generous)</span>
              </div>
            </div>

            {/* Bot Turn Thinking Delay */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-300">Bot Thinking / Turn Speed:</span>
                <span className="text-cyan-400 font-mono font-black text-sm">
                  {botSettings.turnDelaySeconds}s
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.2"
                value={botSettings.turnDelaySeconds}
                onChange={(e) => {
                  updateBotSettings({ turnDelaySeconds: parseFloat(e.target.value) });
                }}
                className="w-full accent-cyan-500 h-2 bg-stone-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                <span>0.8s (Fast)</span>
                <span>1.6s (Realistic Human)</span>
                <span>4.0s (Deliberate)</span>
              </div>
            </div>

            {/* In-Game Hinglish Chat Frequency */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-300">In-Game Chat Frequency:</span>
                <span className="text-purple-300 font-mono font-black text-sm">
                  {botSettings.chatFrequencyPercent}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={botSettings.chatFrequencyPercent}
                onChange={(e) => {
                  updateBotSettings({ chatFrequencyPercent: parseInt(e.target.value, 10) });
                }}
                className="w-full accent-purple-500 h-2 bg-stone-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                <span>0% (Silent)</span>
                <span>25% (Natural)</span>
                <span>80% (Chatty)</span>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
              <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <input
                  type="checkbox"
                  checked={botSettings.smartDrawEnabled}
                  onChange={(e) => updateBotSettings({ smartDrawEnabled: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span className="font-bold">Smart Discard Pile Draw</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <input
                  type="checkbox"
                  checked={botSettings.smartDiscardEnabled}
                  onChange={(e) => updateBotSettings({ smartDiscardEnabled: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span className="font-bold">Optimal Deadwood Discard</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Override & Match Simulation Box */}
        <div className="space-y-6">
          {/* Live Table Overrides */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              Live Table Next Hand Override
            </h3>
            <p className="text-xs text-stone-400">
              Instantly force the winner of the next round on active game tables for testing or VIP assistance.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  sounds.playWinFanfare();
                  triggerAdminBotWinOverride('BOT');
                  triggerToast('Override Set: Next Round Winner = BOT');
                }}
                className={`py-3 px-2 rounded-xl text-xs font-black border transition-all ${
                  botSettings.forceNextWinner === 'BOT'
                    ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg'
                    : 'bg-stone-950 hover:bg-stone-800 text-amber-300 border-amber-500/30'
                }`}
              >
                FORCE BOT WIN
              </button>

              <button
                onClick={() => {
                  sounds.playWinFanfare();
                  triggerAdminBotWinOverride('PLAYER');
                  triggerToast('Override Set: Next Round Winner = REAL PLAYER');
                }}
                className={`py-3 px-2 rounded-xl text-xs font-black border transition-all ${
                  botSettings.forceNextWinner === 'PLAYER'
                    ? 'bg-emerald-500 text-stone-950 border-emerald-300 shadow-lg'
                    : 'bg-stone-950 hover:bg-stone-800 text-emerald-300 border-emerald-500/30'
                }`}
              >
                FORCE PLAYER WIN
              </button>

              <button
                onClick={() => {
                  sounds.playCardClick();
                  triggerAdminBotWinOverride('NONE');
                  triggerToast('Override Cleared: Normal AI Engine Active');
                }}
                className={`py-3 px-2 rounded-xl text-xs font-black border transition-all ${
                  botSettings.forceNextWinner === 'NONE'
                    ? 'bg-stone-800 text-white border-stone-600'
                    : 'bg-stone-950 hover:bg-stone-800 text-stone-400 border-stone-800'
                }`}
              >
                CLEAR (NORMAL)
              </button>
            </div>
          </div>

          {/* Live Batch Match Simulator */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                Live Batch Match Simulator
              </h3>
              <span className="text-[10px] text-stone-400 font-bold bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                Algorithm Verification
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Run simulated games against the active AI engine to verify that empirical win rates match the 97% or 67–78% target.
            </p>

            <div className="flex items-center gap-2">
              {[100, 500, 1000].map((count) => (
                <button
                  key={count}
                  disabled={simulationRunning}
                  onClick={() => handleRunSimulation(count)}
                  className="flex-1 bg-stone-950 hover:bg-stone-800 border border-stone-700 py-2 rounded-xl text-xs font-bold text-stone-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  Simulate {count}
                </button>
              ))}
            </div>

            {lastSimResult && (
              <div className="bg-stone-950 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Batch of {lastSimResult.total} matches:</span>
                  <span className="text-amber-400 font-mono font-black">
                    Bot Win Rate: {lastSimResult.winRate}%
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${lastSimResult.winRate}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${100 - lastSimResult.winRate}%` }}
                    className="bg-emerald-400 h-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-stone-300">
                  <span>Bot Wins: <strong className="text-amber-300">{lastSimResult.botWins}</strong></span>
                  <span>Player Wins: <strong className="text-emerald-400">{lastSimResult.playerWins}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 100,000+ Bot Pool Directory Explorer */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              100,000+ Simulated Bot Player Registry
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Browse realistic player identities seeded across 28 Indian States, VIP levels, and skill ratings.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <span>Pool Index: 0 to 105,420</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, city, username..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-400"
            />
          </div>

          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-400"
            >
              <option value="">All States (28 Indian States)</option>
              <option value="Maharashtra">Maharashtra (Mumbai, Pune)</option>
              <option value="Delhi NCR">Delhi NCR (New Delhi, Noida)</option>
              <option value="Karnataka">Karnataka (Bengaluru)</option>
              <option value="Gujarat">Gujarat (Ahmedabad)</option>
              <option value="Punjab">Punjab (Ludhiana, Amritsar)</option>
              <option value="West Bengal">West Bengal (Kolkata)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (Lucknow)</option>
              <option value="Rajasthan">Rajasthan (Jaipur)</option>
              <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
              <option value="Telangana">Telangana (Hyderabad)</option>
              <option value="Bihar">Bihar (Patna)</option>
              <option value="Madhya Pradesh">Madhya Pradesh (Indore)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedVip}
              onChange={(e) => {
                setSelectedVip(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-400"
            >
              <option value="">All VIP Tiers</option>
              <option value="VIP 1">VIP 1</option>
              <option value="VIP 2">VIP 2</option>
              <option value="VIP 3">VIP 3</option>
              <option value="VIP 4">VIP 4</option>
              <option value="VIP 5">VIP 5</option>
              <option value="VIP 6">VIP 6</option>
              <option value="Crown">Crown Member</option>
              <option value="Master">Master Club</option>
            </select>
          </div>
        </div>

        {/* Bots Table */}
        <div className="overflow-x-auto no-scrollbar border border-stone-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase font-bold tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-2.5 px-3">Player Identity (Stealth)</th>
                <th className="py-2.5 px-3">State & City</th>
                <th className="py-2.5 px-3">VIP Tier</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Win Rate</th>
                <th className="py-2.5 px-3">Matches</th>
                <th className="py-2.5 px-3">Chips Balance</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-sans">
              {bots.map((bot) => (
                <tr key={bot.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={bot.avatar}
                        alt={bot.name}
                        className="w-8 h-8 rounded-full object-cover border border-stone-700 bg-stone-950"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{bot.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">@{bot.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-stone-300 font-semibold">{bot.city}</div>
                    <div className="text-[10px] text-stone-500">{bot.state}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-stone-950 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {bot.vipTier}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-stone-200">
                    {bot.rating}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    {bot.winRate}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-stone-400">
                    {bot.gamesPlayed.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                    ₹{bot.chips.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        sounds.playCardClick();
                        setSelectedBotModal(bot);
                      }}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-stone-700 transition-all"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
          <span>Showing page {currentPage} of {totalPages} (over {totalMatching.toLocaleString()} bots indexed)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="bg-stone-950 hover:bg-stone-800 disabled:opacity-40 px-3 py-1.5 rounded-xl border border-stone-800 font-bold"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="bg-stone-950 hover:bg-stone-800 disabled:opacity-40 px-3 py-1.5 rounded-xl border border-stone-800 font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Bot Modal */}
      {selectedBotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBotModal(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <img
                src={selectedBotModal.avatar}
                alt={selectedBotModal.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-xl mb-3"
                referrerPolicy="no-referrer"
              />
              <h4 className="text-base font-black text-white">{selectedBotModal.name}</h4>
              <p className="text-xs text-stone-400 font-mono">@{selectedBotModal.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {selectedBotModal.vipTier}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {selectedBotModal.city}, {selectedBotModal.state}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-800 text-xs font-mono">
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Chips Balance</span>
                <span className="text-emerald-400 font-bold text-sm">₹{selectedBotModal.chips.toLocaleString()}</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Win Rate</span>
                <span className="text-amber-400 font-bold text-sm">{selectedBotModal.winRate}%</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Total Matches</span>
                <span className="text-white font-bold text-sm">{selectedBotModal.gamesPlayed.toLocaleString()}</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Skill Rating</span>
                <span className="text-purple-300 font-bold text-sm">{selectedBotModal.rating} ELO</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBotModal(null)}
              className="w-full mt-4 bg-stone-800 hover:bg-stone-700 text-white font-bold py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
