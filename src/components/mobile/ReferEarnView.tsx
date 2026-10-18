import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { Share2, MessageCircle, Copy, Check, Sparkles, TrendingUp, Users } from 'lucide-react';
import { sounds } from '../../utils/sound';

export const ReferEarnView: React.FC = () => {
  const { currentUser } = useRummy();
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY'>('HOME');
  const [copied, setCopied] = useState(false);
  const [simulatedInvited, setSimulatedInvited] = useState(false);

  const referralCode = currentUser.referralCode || 'MR35150';
  const referralLink = `https://masterrummy.in/ref/${referralCode}`;

  const handleCopy = () => {
    sounds.playCoinSound();
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsappShare = () => {
    sounds.playCoinSound();
    setSimulatedInvited(true);
    const text = encodeURIComponent(
      `🃏 Play Master Rummy with me! Download and use code ${referralCode} to get ₹50 FREE Welcome Bonus + up to ₹1,100 Cash: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const rankingList = [
    { rank: 4, name: 'Ramsagar***', refs: '25,836', cash: '49.26L', bonus: '12.91L', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80' },
    { rank: 6, name: 'KamleshB***', refs: '20,402', cash: '33.94L', bonus: '10.2L', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
    { rank: 7, name: 'MaheshMh***', refs: '17,544', cash: '24.44L', bonus: '8.77L', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
    { rank: 8, name: 'player82***', refs: '14,176', cash: '19.81L', bonus: '7.08L', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    { rank: 9, name: 'player87***', refs: '15,734', cash: '17.00L', bonus: '7.86L', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' },
    { rank: 10, name: 'WahidAns***', refs: '20,613', cash: '14.81L', bonus: '10.3L', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80' },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-16 bg-[#f8fafc] text-slate-800 flex flex-col select-none">
      {/* 1. Refer & Earn Title Header (From Screenshots 11, 13, 15) */}
      <div className="bg-[#660710] text-white py-3 px-4 text-center font-black tracking-wide text-sm uppercase shadow-sm">
        REFER & EARN
      </div>

      {/* 2. Top Promotional Banner with Real Generated Man in Suit + Cards Graphic */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#59040c] via-[#850d18] to-[#400208] text-white">
        <div className="relative aspect-[16/9] w-full max-h-52 overflow-hidden">
          <img
            src="/src/assets/images/rummy_refer_banner_1792280693399.jpg"
            alt="Refer and Earn ₹1100"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
            <h2 className="text-xl font-black text-amber-300 tracking-tight leading-tight drop-shadow-md">
              Each Invited Friend Brings You ₹1,100
            </h2>
            <div className="mt-1 inline-flex items-center gap-1.5 bg-black/60 border border-amber-400/50 px-2 py-0.5 rounded-full w-max">
              <span className="text-[10px] font-black text-amber-300 uppercase">
                PLAYERS HAVE COLLECTIVELY EARNED ₹150 CRORE+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tabs: Home | History (From Screenshots 11, 13, 15) */}
      <div className="bg-white flex border-b border-slate-200 text-xs font-extrabold">
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('HOME');
          }}
          className={`flex-1 py-3 text-center transition-colors relative ${
            activeTab === 'HOME' ? 'text-red-700 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {activeTab === 'HOME' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          Home
        </button>
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('HISTORY');
          }}
          className={`flex-1 py-3 text-center transition-colors relative ${
            activeTab === 'HISTORY' ? 'text-red-700 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {activeTab === 'HISTORY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />}
          History
        </button>
      </div>

      {/* 4. Live Marquee Ticker (From Screenshots 11, 13, 15) */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 flex items-center gap-2 overflow-hidden text-xs">
        <span className="text-emerald-700 font-bold whitespace-nowrap">
          Aj**********er has already earned
        </span>
        <span className="text-orange-600 font-black whitespace-nowrap">₹1,01,93,820!</span>
        <span className="text-amber-500">🎉</span>
      </div>

      {activeTab === 'HOME' ? (
        <div className="p-3 space-y-4">
          {/* Quick Referral Link Sharing Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Your Unique Referral Code</span>
              <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {referralCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-lg px-2.5 py-2 font-mono"
              />
              <button
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {/* WhatsApp & Share Buttons (From Screenshot 15) */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100">
              <button
                onClick={handleWhatsappShare}
                className="py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Invite via Whatsapp</span>
              </button>

              <button
                onClick={handleCopy}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Via</span>
              </button>
            </div>
          </div>

          {/* Section: How It Works Infographic (From Screenshot 15) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span>How it works</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-4">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-1">
                  1
                </div>
                <p className="font-bold text-slate-800">Invite Friends</p>
                <p className="text-[10px] text-slate-500">Share your link</p>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-1">
                  2
                </div>
                <p className="font-bold text-slate-800">Get 50 Bonus</p>
                <p className="text-[10px] text-slate-500">You & friends</p>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-1">
                  3
                </div>
                <p className="font-bold text-slate-800">Friend Tops Up</p>
                <p className="text-[10px] text-slate-500">Get ₹1100 Cash</p>
              </div>
            </div>

            {/* Friend Topup Cash Progression Bar (From Screenshot 15) */}
            <div className="bg-slate-900 text-white p-3 rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-bold text-amber-300 pb-2 border-b border-stone-800">
                <span>Friend Tops Up</span>
                <span>You Get Cash</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center pt-2 text-[10px]">
                <div className="bg-stone-800 p-1 rounded">
                  <span className="text-stone-400">₹100</span>
                  <p className="text-emerald-400 font-black">+₹10</p>
                </div>
                <div className="bg-stone-800 p-1 rounded">
                  <span className="text-stone-400">₹1,000</span>
                  <p className="text-emerald-400 font-black">+₹80</p>
                </div>
                <div className="bg-stone-800 p-1 rounded">
                  <span className="text-stone-400">₹5,000</span>
                  <p className="text-emerald-400 font-black">+₹160</p>
                </div>
                <div className="bg-stone-800 p-1 rounded">
                  <span className="text-stone-400">₹10,000</span>
                  <p className="text-emerald-400 font-black">+₹200</p>
                </div>
                <div className="bg-stone-800 p-1 rounded border border-amber-400/40">
                  <span className="text-stone-400">₹50,000</span>
                  <p className="text-amber-300 font-black">+₹600</p>
                </div>
              </div>
              <div className="text-right text-[11px] font-black text-amber-300 mt-2">
                Total Reward: <span className="text-sm font-black text-emerald-400">₹1,100 CASH</span>
              </div>
            </div>
          </div>

          {/* Section: Top 3 Podium (From Screenshot 13) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Earnings Ranking Podium</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </h3>

            {/* Podium Display */}
            <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2 text-center">
              {/* #2 Left Podium */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-blue-400 overflow-hidden bg-slate-100 shadow-md mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="AjayMaha"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-extrabold text-[11px] text-slate-800 truncate max-w-[80px]">AjayMaha***</span>
                <div className="w-full bg-blue-100 border border-blue-300 rounded-t-lg pt-2 pb-1 mt-1 text-[10px]">
                  <span className="font-black text-blue-900">#2</span>
                  <p className="font-extrabold text-amber-700">101.93L</p>
                </div>
              </div>

              {/* #1 Center Podium (Gold - Tallest) */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-3 border-amber-400 overflow-hidden bg-slate-100 shadow-xl mb-1 ring-2 ring-amber-300">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="SufiyanZ"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-extrabold text-xs text-slate-900 truncate max-w-[90px]">SufiyanZ***</span>
                <div className="w-full bg-amber-200 border border-amber-400 rounded-t-lg pt-3 pb-1 mt-1 text-[10px] shadow-sm">
                  <span className="font-black text-amber-950 text-xs">👑 #1</span>
                  <p className="font-black text-red-700 text-xs">143.27L</p>
                </div>
              </div>

              {/* #3 Right Podium */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-700 overflow-hidden bg-slate-100 shadow-md mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                    alt="Bismilab"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-extrabold text-[11px] text-slate-800 truncate max-w-[80px]">Bismilab***</span>
                <div className="w-full bg-amber-100 border border-amber-300 rounded-t-lg pt-1.5 pb-1 mt-1 text-[10px]">
                  <span className="font-black text-amber-900">#3</span>
                  <p className="font-extrabold text-amber-700">63.19L</p>
                </div>
              </div>
            </div>

            {/* Current Player Status card (From Screenshot 13) */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-2 shadow-xs grid grid-cols-12 items-center text-xs">
              <span className="col-span-3 text-[11px] font-bold text-amber-900">Not Listed</span>
              <div className="col-span-5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-amber-400 overflow-hidden bg-stone-900 shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt="player"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-extrabold truncate text-slate-900">{currentUser.username}</span>
              </div>
              <span className="col-span-2 text-center text-slate-600 font-semibold">0</span>
              <span className="col-span-2 text-right font-extrabold text-slate-800">₹0</span>
            </div>

            {/* Ranking Table Rows (From Screenshot 11 & 13) */}
            <div className="space-y-1.5 mt-2">
              {rankingList.map((item) => (
                <div
                  key={item.rank}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 grid grid-cols-12 items-center text-xs"
                >
                  <span className="col-span-2 font-black text-slate-700 pl-1">{item.rank}</span>
                  <div className="col-span-5 flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <span className="col-span-2 text-center text-slate-600 font-semibold">{item.refs}</span>
                  <div className="col-span-3 text-right">
                    <span className="font-extrabold text-amber-700">₹{item.cash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Winner Testimonial Card (From Screenshot 15) */}
          <div className="bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-300 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-200 shrink-0 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                alt="Pradeep"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-bold text-xs text-amber-950 leading-tight">
                "I won Rs 3,00,000 on Master Rummy via Referrals, You can too!"
              </p>
              <p className="text-[10px] text-amber-800 font-semibold mt-0.5">— Pradeep Kumar, Verified Winner</p>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="p-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No Referral History Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Share your referral link on WhatsApp or social media. Once friends sign up and play, your bonus cash will
              appear here!
            </p>
            <button
              onClick={handleWhatsappShare}
              className="mt-4 px-4 py-2 bg-[#25D366] text-white font-extrabold text-xs rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Invite Friends Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
