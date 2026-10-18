import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { ChevronLeft, ReceiptText, ArrowDownLeft, ArrowUpRight, Trophy, Gift } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({ isOpen, onClose }) => {
  const { transactions, currentUser } = useRummy();
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'GAME'>('ALL');

  if (!isOpen) return null;

  const userTxs = transactions.filter((t) => t.userId === currentUser.id);

  const filtered = userTxs.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'DEPOSIT') return t.type === 'DEPOSIT' || t.type === 'COUPON_BONUS';
    if (filter === 'WITHDRAWAL') return t.type === 'WITHDRAWAL';
    if (filter === 'GAME') return t.type === 'GAME_ENTRY' || t.type === 'GAME_WIN';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="bg-[#610710] text-white px-3 py-3 flex items-center justify-between shadow-md shrink-0">
        <button
          onClick={() => {
            sounds.playCardClick();
            onClose();
          }}
          className="p-1 hover:bg-black/20 rounded-full flex items-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base font-black tracking-wide uppercase">TRANSACTIONS</h1>

        <div className="w-6" />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white flex border-b border-slate-200 text-xs font-bold px-2 py-1.5 gap-1 overflow-x-auto no-scrollbar">
        {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'GAME'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sounds.playCardClick();
              setFilter(tab);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              filter === tab
                ? 'bg-red-700 text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'GAME' ? 'GAMES' : tab}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar max-w-md mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-400">
            <ReceiptText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-xs text-slate-700">No transactions recorded</p>
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      t.type === 'DEPOSIT' || t.type === 'GAME_WIN' || t.type === 'COUPON_BONUS'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {t.type === 'DEPOSIT' && <ArrowDownLeft className="w-4 h-4" />}
                    {t.type === 'WITHDRAWAL' && <ArrowUpRight className="w-4 h-4" />}
                    {t.type === 'GAME_WIN' && <Trophy className="w-4 h-4" />}
                    {t.type === 'GAME_ENTRY' && <ArrowUpRight className="w-4 h-4" />}
                    {t.type === 'COUPON_BONUS' && <Gift className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{t.description}</span>
                    <span className="text-[10px] text-slate-400">{t.timestamp}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-black text-sm tabular-nums ${
                      t.type === 'DEPOSIT' || t.type === 'GAME_WIN' || t.type === 'COUPON_BONUS'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'DEPOSIT' || t.type === 'GAME_WIN' || t.type === 'COUPON_BONUS' ? '+' : '-'}₹
                    {t.amount}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Bal: ₹{t.balanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
