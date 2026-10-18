import React from 'react';
import { ChevronLeft, Bell, Gift, Trophy, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Welcome to Master Rummy!',
      desc: 'Claim your 160% bonus on your first deposit with coupon EXTRA004.',
      time: '10 min ago',
      type: 'bonus',
    },
    {
      id: 2,
      title: 'Mega Challenger ₹55L Live',
      desc: 'Join cash games to climb the Challenger leaderboard and claim up to ₹1,20,000!',
      time: '1 hour ago',
      type: 'tournament',
    },
    {
      id: 3,
      title: 'Refer & Earn ₹1,100 Cash',
      desc: 'Invite friends to earn ₹50 instant bonus + cash top-up rewards.',
      time: '3 hours ago',
      type: 'referral',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col select-none overflow-hidden font-sans">
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

        <h1 className="text-base font-black tracking-wide uppercase">NOTIFICATIONS</h1>

        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar max-w-md mx-auto w-full">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              {n.type === 'bonus' && <Gift className="w-4 h-4" />}
              {n.type === 'tournament' && <Trophy className="w-4 h-4" />}
              {n.type === 'referral' && <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900">{n.title}</h4>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
