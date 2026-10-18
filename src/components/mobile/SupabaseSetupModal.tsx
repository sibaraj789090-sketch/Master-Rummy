import React, { useState, useEffect } from 'react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabase';
import { runRummyEngineTests, TestResult } from '../../utils/rummyEngine.test';
import { sounds } from '../../utils/sound';
import {
  Database,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  X,
  Play,
  RefreshCw,
  ExternalLink,
  Server,
  Zap,
  Users,
} from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'STATUS' | 'SQL' | 'TESTS' | 'MULTI'>('STATUS');
  const [config, setConfig] = useState(getSupabaseConfig());
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testSuiteResults, setTestSuiteResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
      setTestSuiteResults(runRummyEngineTests());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    sounds.playCardClick();
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCoinSound();
    saveSupabaseConfig(urlInput, keyInput);
  };

  const handleCopySql = () => {
    sounds.playCardClick();
    const sqlScript = `-- MASTER RUMMY MULTIPLAYER TABLES & REALTIME
-- Run this in Supabase Dashboard > SQL Editor > New Query
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  practice_chips BIGINT DEFAULT 10000 NOT NULL,
  total_matches INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  variant TEXT DEFAULT 'Points' NOT NULL,
  max_players INTEGER NOT NULL CHECK (max_players IN (2, 6)),
  entry_chips INTEGER DEFAULT 100 NOT NULL,
  point_value INTEGER DEFAULT 50 NOT NULL,
  status TEXT DEFAULT 'WAITING' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  seat_index INTEGER NOT NULL CHECK (seat_index >= 0 AND seat_index < 6),
  status TEXT DEFAULT 'READY' NOT NULL,
  is_dealer BOOLEAN DEFAULT FALSE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_room_seat UNIQUE (room_id, seat_index)
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms, public.room_players;`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 select-none animate-fade-in">
      <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">
                SUPABASE MULTIPLAYER BACKEND
              </h2>
              <p className="text-[10px] text-stone-400">
                PostgreSQL · Supabase Realtime · Row Level Security
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playCardClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab('STATUS')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'STATUS'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Connection</span>
          </button>

          <button
            onClick={() => setActiveTab('SQL')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'SQL'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>SQL Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('TESTS')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'TESTS'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Engine Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('MULTI')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'MULTI'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2P Testing</span>
          </button>
        </div>

        {/* Tab 1: Connection & Credentials */}
        {activeTab === 'STATUS' && (
          <div className="p-4 overflow-y-auto no-scrollbar space-y-4 text-xs">
            {/* Status Card */}
            <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-200 flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      testResult?.success ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  Status: {testResult?.success ? 'Connected & Verified' : 'Checking Configuration'}
                </span>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold flex items-center gap-1 text-[11px] disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Test Now</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] font-medium border ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>

            {/* Custom URL & Key Input */}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-stone-300 mb-1">
                  SUPABASE PROJECT URL
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-300 mb-1">
                  SUPABASE ANON PUBLIC KEY
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition-colors"
                >
                  Save & Apply Credentials
                </button>
                {config.isConfigured && (
                  <button
                    type="button"
                    onClick={clearSupabaseConfig}
                    className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: SQL Migration Schema */}
        {activeTab === 'SQL' && (
          <div className="p-4 overflow-y-auto no-scrollbar space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-300">
                PostgreSQL Schema (`supabase/migrations/`)
              </span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 text-[11px]"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 font-mono text-[10px] text-stone-300 overflow-x-auto max-h-56 no-scrollbar">
              <pre className="whitespace-pre">{`-- 8 Required Tables created in:
-- supabase/migrations/20261018000000_master_rummy_multiplayer.sql

1. profiles (linked to auth.users, avatar, chips)
2. game_rooms (room_code, 2P & 6P max_players, variant)
3. room_players (seats 0-5, status, presence)
4. game_sessions (wild_joker, closed_deck, discard_pile, turn)
5. player_game_states (hand_cards, meld groups, RLS protected)
6. game_moves (draw, discard, drop, show, timestamps)
7. match_results (winner, chips_pool, summary)
8. leaderboards (wins, matches, win_rate)

Row Level Security (RLS) is ENABLED on all tables.
Opponent hidden cards cannot be accessed by other players.`}</pre>
            </div>
          </div>
        )}

        {/* Tab 3: Rummy Engine Unit Tests */}
        {activeTab === 'TESTS' && (
          <div className="p-4 overflow-y-auto no-scrollbar space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="font-extrabold text-stone-200">
                Server-Side Rummy Rules & Win Detection Tests
              </span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {testSuiteResults.filter((t) => t.passed).length}/{testSuiteResults.length} PASSED
              </span>
            </div>

            <div className="space-y-1.5">
              {testSuiteResults.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80 flex items-start gap-2 text-xs"
                >
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-extrabold text-stone-200">{t.name}</p>
                    {t.message && <p className="text-[11px] text-stone-400 mt-0.5">{t.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: 2-Player & Multi-Device Testing Guide */}
        {activeTab === 'MULTI' && (
          <div className="p-4 overflow-y-auto no-scrollbar space-y-3 text-xs text-stone-300 leading-relaxed">
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-3.5 space-y-2">
              <h3 className="font-black text-emerald-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                How to Test with 2 Real Accounts on Separate Devices:
              </h3>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px]">
                <li>
                  <strong>Device 1 (Host):</strong> Open this app URL, select <strong>"2 Players"</strong> in the Lobby, and tap <strong>PLAY NOW</strong>. A new multiplayer room is created with Seat 0.
                </li>
                <li>
                  <strong>Device 2 or Second Browser Tab (Opponent):</strong> Open the same app URL in an Incognito window or second phone.
                </li>
                <li>
                  Tap <strong>PLAY NOW</strong> with 2 Players. The real-time matchmaking engine automatically pairs the two devices into the same room!
                </li>
                <li>
                  Watch cards deal simultaneously on both screens. Player 1's moves, card draws, and discards reflect instantly on Player 2's screen via Realtime!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-stone-950 p-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span>Master Rummy Multiplayer v2.5.0</span>
          <button
            onClick={() => {
              sounds.playCardClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
