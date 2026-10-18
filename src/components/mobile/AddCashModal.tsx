import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { ChevronLeft, Headphones, Gift, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface AddCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport: () => void;
}

export const AddCashModal: React.FC<AddCashModalProps> = ({ isOpen, onClose, onOpenSupport }) => {
  const { addCash, coupons } = useRummy();

  const presets = [
    { amount: 100, bonus: 160, popular: true },
    { amount: 300, bonus: 480, popular: false },
    { amount: 500, bonus: 800, popular: false },
    { amount: 1000, bonus: 1600, popular: false },
    { amount: 3000, bonus: 4800, popular: false },
    { amount: 5000, bonus: 5000, popular: false },
  ];

  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [couponCode, setCouponCode] = useState<string>('EXTRA004');
  const [showOtherCoupons, setShowOtherCoupons] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARDS' | 'NETBANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<{ amount: number; bonus: number } | null>(null);

  if (!isOpen) return null;

  const currentPreset = presets.find((p) => p.amount === selectedAmount) || {
    amount: selectedAmount,
    bonus: Math.round(selectedAmount * 1.6),
  };

  const youPay = selectedAmount;
  const bonus = currentPreset.bonus;
  const youGet = youPay + bonus;

  const handlePay = () => {
    sounds.playCoinSound();
    setIsProcessing(true);
    setTimeout(() => {
      const result = addCash(selectedAmount, couponCode);
      setIsProcessing(false);
      setSuccessNotice({ amount: selectedAmount, bonus: result.bonusAdded });
      sounds.playWinFanfare();
      setTimeout(() => {
        setSuccessNotice(null);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col select-none overflow-y-auto no-scrollbar">
      {/* Top Header (Maroon/Crimson from Screenshot 12) */}
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

        <h1 className="text-base font-black tracking-wide uppercase">ADD CASH</h1>

        <button
          onClick={() => {
            sounds.playCardClick();
            onOpenSupport();
          }}
          className="p-1 hover:bg-black/20 rounded-full"
        >
          <Headphones className="w-5 h-5 text-amber-300" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
        <div className="space-y-4">
          {/* Denominations 2-Column Grid (From Screenshot 12) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {presets.map((item) => {
              const isSelected = selectedAmount === item.amount;
              return (
                <button
                  key={item.amount}
                  onClick={() => {
                    sounds.playCardClick();
                    setSelectedAmount(item.amount);
                  }}
                  className={`relative p-3 rounded-2xl flex flex-col justify-center items-center transition-all ${
                    isSelected
                      ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-md ring-1 ring-emerald-500'
                      : 'border border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* MOST POPULAR Badge */}
                  {item.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs whitespace-nowrap">
                      <span>❤️</span>
                      <span>MOST POPULAR</span>
                    </div>
                  )}

                  {/* Cash Amount */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-[10px]">
                      ₹
                    </span>
                    <span className="text-lg font-black text-slate-900">₹{item.amount}</span>
                  </div>

                  {/* Bonus Amount */}
                  <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-slate-600">
                    <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-black flex items-center justify-center text-[9px]">
                      B
                    </span>
                    <span className="text-blue-700 font-extrabold">₹{item.bonus}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coupon Code Section (From Screenshot 12) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-900">
                  '{couponCode}' applied!
                </span>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setShowOtherCoupons(!showOtherCoupons);
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                others
              </button>
            </div>

            {/* Other Available Coupons Dropdown */}
            {showOtherCoupons && (
              <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    onClick={() => {
                      sounds.playCardClick();
                      setCouponCode(c.code);
                      setShowOtherCoupons(false);
                    }}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex justify-between items-center ${
                      couponCode === c.code
                        ? 'border-emerald-500 bg-emerald-50 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{c.code}</p>
                      <p className="text-[10px] text-slate-500">{c.description}</p>
                    </div>
                    {couponCode === c.code && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Breakdown (From Screenshot 12) */}
          <div className="bg-slate-100 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold">
              <div>
                <span className="text-slate-500 text-[10px]">You Pay</span>
                <p className="text-base font-black text-slate-900">₹{youPay}</p>
              </div>
              <span className="text-slate-400 font-bold text-base">+</span>
              <div>
                <span className="text-blue-600 text-[10px]">Bonus</span>
                <p className="text-base font-black text-blue-600">₹{bonus}</p>
              </div>
              <span className="text-slate-400 font-bold text-base">=</span>
              <div>
                <span className="text-emerald-600 text-[10px]">You Get</span>
                <p className="text-lg font-black text-emerald-600">₹{youGet}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">
              Select Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setPaymentMethod('UPI');
                }}
                className={`py-2 px-1 rounded-lg border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                UPI (GPay / PhonePe)
              </button>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setPaymentMethod('CARDS');
                }}
                className={`py-2 px-1 rounded-lg border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'CARDS'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Debit / Credit Card
              </button>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  setPaymentMethod('NETBANKING');
                }}
                className={`py-2 px-1 rounded-lg border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Net Banking
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          {successNotice ? (
            <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>Added ₹{successNotice.amount} Cash + ₹{successNotice.bonus} Bonus!</span>
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white font-black text-lg tracking-wider rounded-xl shadow-lg active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-white" />
              <span>{isProcessing ? 'PROCESSING PAYMENT...' : `ADD ₹${selectedAmount}`}</span>
            </button>
          )}

          {/* 100% safe and secure (From Screenshot 12) */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mt-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% safe and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
