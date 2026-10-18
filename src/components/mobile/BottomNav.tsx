import React from 'react';
import { useRummy } from '../../context/RummyContext';
import { Award, IndianRupee, Menu, Users, Spade } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu }) => {
  const { activeScreen, setActiveScreen } = useRummy();

  return (
    <div className="bg-[#121212] border-t border-stone-800 text-stone-400 py-1.5 px-2 flex items-center justify-around z-30 select-none shadow-2xl">
      {/* 1. Add Cash */}
      <button
        onClick={() => {
          sounds.playCoinSound();
          setActiveScreen('ADD_CASH');
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
          activeScreen === 'ADD_CASH' ? 'text-amber-400 font-bold' : 'hover:text-stone-200'
        }`}
      >
        <div className="relative">
          <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
            <IndianRupee className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>
        <span className="text-[10px] tracking-tight">Add Cash</span>
      </button>

      {/* 2. Challenger */}
      <button
        onClick={() => {
          sounds.playCardClick();
          setActiveScreen('CHALLENGER');
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
          activeScreen === 'CHALLENGER' ? 'text-red-500 font-bold' : 'hover:text-stone-200'
        }`}
      >
        <Award className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Challenger</span>
      </button>

      {/* 3. Lobby (Primary) */}
      <button
        onClick={() => {
          sounds.playCardClick();
          setActiveScreen('LOBBY');
        }}
        className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
      >
        {activeScreen === 'LOBBY' && (
          <div className="absolute -top-1.5 w-8 h-1 bg-red-600 rounded-full" />
        )}
        <div className="text-red-600 flex items-center justify-center">
          <Spade className="w-5 h-5 fill-current" />
        </div>
        <span
          className={`text-[10px] tracking-tight ${
            activeScreen === 'LOBBY' ? 'text-red-500 font-extrabold' : 'hover:text-stone-200'
          }`}
        >
          Lobby
        </span>
      </button>

      {/* 4. Refer & Earn */}
      <button
        onClick={() => {
          sounds.playCardClick();
          setActiveScreen('REFER_EARN');
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 relative transition-colors ${
          activeScreen === 'REFER_EARN' ? 'text-amber-400 font-bold' : 'hover:text-stone-200'
        }`}
      >
        <div className="relative">
          {/* 300000 bonus tag pill */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[7px] px-1 rounded-full shadow-xs whitespace-nowrap">
            ₹300000
          </div>
          <Users className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight">Refer & Earn</span>
      </button>

      {/* 5. Menu */}
      <button
        onClick={() => {
          sounds.playCardClick();
          onOpenMenu();
        }}
        className="flex flex-col items-center gap-0.5 py-1 px-2 hover:text-stone-200 transition-colors"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>
    </div>
  );
};
