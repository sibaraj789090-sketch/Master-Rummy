import React, { useState } from 'react';
import { ChevronLeft, Headphones, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Namaste! Welcome to Master Rummy 24x7 Priority Support. How can we assist you today?',
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    sounds.playCardClick();
    const userMsg = { sender: 'user' as const, text, time: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      sounds.playBell();
      let reply = 'Thank you for reaching out! Our finance & support team has logged your query.';
      const lower = text.toLowerCase();
      if (lower.includes('withdraw') || lower.includes('withdrawal')) {
        reply = 'Withdrawals are processed via instant IMPS within 5-15 minutes once approved by the Admin.';
      } else if (lower.includes('deposit') || lower.includes('add cash')) {
        reply = 'Deposits are credited instantly via UPI, Cards, or Netbanking with 160% EXTRA004 bonus!';
      } else if (lower.includes('kyc') || lower.includes('verify')) {
        reply = 'Your mobile number is verified. You can update your bank details in the Withdrawal tab for instant payouts.';
      } else if (lower.includes('rummy') || lower.includes('rule')) {
        reply = 'Indian Rummy requires 13 cards with at least 1 Pure Sequence and 1 Second Sequence (pure/impure).';
      }

      setMessages((prev) => [...prev, { sender: 'agent', text: reply, time: 'Just now' }]);
    }, 800);
  };

  const quickFaqs = [
    'How long does withdrawal take?',
    'How do I claim EXTRA004 deposit bonus?',
    'What is a Pure Sequence in Rummy?',
  ];

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

        <div className="text-center">
          <h1 className="text-sm font-black tracking-wide uppercase">24x7 HELP & SUPPORT</h1>
          <p className="text-[10px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            Live Agent Connected
          </p>
        </div>

        <div className="w-6" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 max-w-[85%] ${
              m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-red-700 text-amber-300'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div>
              <div
                className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-red-700 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 px-1 mt-0.5 block">{m.time}</span>
            </div>
          </div>
        ))}

        {/* Quick FAQ Chips */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Frequently Asked Questions:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {quickFaqs.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xs transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white border-t border-slate-200 p-2.5 shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question here..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-2 text-xs focus:outline-hidden"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-full shadow-sm active:scale-95 transition-transform"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
