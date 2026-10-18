import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  ChevronLeft,
  Copy,
  Check,
  Edit2,
  Wallet,
  Coins,
  CreditCard,
  Phone,
  Mail,
  Send,
  Calendar,
  User,
  ShieldCheck,
  ReceiptText,
} from 'lucide-react';
import { sounds } from '../../utils/sound';

interface MyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddCash: () => void;
  onOpenWithdrawal: () => void;
  onOpenTransactions: () => void;
  onOpenDocumentsVerification?: () => void;
}

export const MyWalletModal: React.FC<MyWalletModalProps> = ({
  isOpen,
  onClose,
  onOpenAddCash,
  onOpenWithdrawal,
  onOpenTransactions,
  onOpenDocumentsVerification,
}) => {
  const { currentUser, updateCurrentUserProfile } = useRummy();

  const [copiedId, setCopiedId] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState('');

  if (!isOpen) return null;

  const totalPlayable = (currentUser.depositBalance + currentUser.withdrawalBalance).toFixed(2);

  const handleCopyId = () => {
    sounds.playCoinSound();
    navigator.clipboard?.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveField = (fieldName: 'email' | 'telegram' | 'dob' | 'gender') => {
    sounds.playCardClick();
    if (fieldName === 'gender') {
      updateCurrentUserProfile({ gender: fieldValue as 'Male' | 'Female' | 'Other' });
    } else {
      updateCurrentUserProfile({ [fieldName]: fieldValue });
    }
    setEditingField(null);
    setFieldValue('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col select-none overflow-y-auto no-scrollbar">
      {/* Top Header Profile Banner (From Screenshot 5) */}
      <div className="bg-gradient-to-b from-[#6b0b14] to-[#45050b] text-white p-4 relative shadow-md">
        <button
          onClick={() => {
            sounds.playCardClick();
            onClose();
          }}
          className="p-1 hover:bg-black/20 rounded-full inline-flex items-center text-white mb-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 overflow-hidden bg-stone-900 shadow-lg">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  const newName = prompt('Enter new player name:', currentUser.username);
                  if (newName) updateCurrentUserProfile({ username: newName });
                }}
                className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md hover:scale-110 transition-transform"
              >
                <Edit2 className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-white">{currentUser.username}</h2>
              <div className="flex items-center gap-1.5 text-xs text-amber-200 mt-0.5">
                <span>ID: {currentUser.id}</span>
                <button onClick={handleCopyId} className="p-0.5 hover:text-white">
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Wallet Balances Container (From Screenshot 5) */}
      <div className="p-4 space-y-4 max-w-md mx-auto w-full flex-1">
        <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wide">My Wallet</h3>

        {/* Playable Balance Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Playable Balance</span>
              <p className="text-xl font-black text-slate-900">₹{totalPlayable}</p>
            </div>
            <button
              onClick={() => {
                sounds.playCardClick();
                onOpenTransactions();
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
            >
              <span>View All Transactions</span>
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Deposit Balance Row */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Deposit Balance</p>
                <p className="text-sm font-black text-slate-900">₹{currentUser.depositBalance.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playCoinSound();
                onOpenAddCash();
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg uppercase shadow-xs active:scale-95 transition-all"
            >
              ADD CASH
            </button>
          </div>

          {/* Withdrawal Balance Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Withdrawal Balance</p>
                <p className="text-sm font-black text-slate-900">₹{currentUser.withdrawalBalance.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playCardClick();
                onOpenWithdrawal();
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-lg uppercase border border-slate-300 shadow-xs active:scale-95 transition-all"
            >
              WITHDRAW
            </button>
          </div>
        </div>

        {/* Bonus Balance Card (From Screenshot 5) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
            B
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Bonus</span>
            <p className="text-base font-black text-slate-900">{currentUser.bonusBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Personal Information Section (From Screenshot 5) */}
        <div>
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wide mb-2">Personal Information</h3>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs text-xs">
            {/* 18+ KYC Documents Verification Row */}
            <div className="p-3 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded">18+</span>
                    <span className="text-slate-800 font-bold">KYC Documents (Aadhaar & PAN)</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                        currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED'
                        ? 'Approved'
                        : 'Action Required'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Aadhaar: {currentUser.kycDetails?.aadhaar?.status || (currentUser.isKycVerified ? 'VERIFIED' : 'Pending')} · PAN: {currentUser.kycDetails?.pan?.status || (currentUser.isKycVerified ? 'VERIFIED' : 'Pending')}
                  </p>
                </div>
              </div>
              {onOpenDocumentsVerification && (
                <button
                  onClick={() => {
                    sounds.playCardClick();
                    onClose();
                    onOpenDocumentsVerification();
                  }}
                  className="text-[11px] font-black text-red-700 hover:underline"
                >
                  UPLOAD / VIEW ›
                </button>
              )}
            </div>

            {/* WhatsApp Number */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-[8px]">
                  WA
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">WhatsApp Number</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      OTP Verified
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5">
                    +91 {currentUser.whatsappNumber || currentUser.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">Mobile Number</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5">{currentUser.phone}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  const newPhone = prompt('Enter updated mobile number:', currentUser.phone);
                  if (newPhone) updateCurrentUserProfile({ phone: newPhone });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                CHANGE
              </button>
            </div>

            {/* Email */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-slate-600 font-medium">Email</span>
                  <p className="font-bold text-slate-900 mt-0.5">{currentUser.email || 'Not added'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  const newEmail = prompt('Enter email address:', currentUser.email);
                  if (newEmail) updateCurrentUserProfile({ email: newEmail });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                {currentUser.email ? 'EDIT' : 'ADD'}
              </button>
            </div>

            {/* Telegram Helper */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-slate-600 font-medium">Telegram Helper</span>
                  <p className="font-bold text-slate-900 mt-0.5">{currentUser.telegram || 'Not added'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  const newTg = prompt('Enter Telegram username:', currentUser.telegram);
                  if (newTg) updateCurrentUserProfile({ telegram: newTg });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                {currentUser.telegram ? 'EDIT' : 'ADD'}
              </button>
            </div>

            {/* Date of Birth */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="text-slate-600 font-medium">Date of birth</span>
                  <p className="font-bold text-slate-900 mt-0.5">{currentUser.dob || 'Not added'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  const newDob = prompt('Enter Date of Birth (YYYY-MM-DD):', currentUser.dob || '1998-05-12');
                  if (newDob) updateCurrentUserProfile({ dob: newDob });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                {currentUser.dob ? 'EDIT' : 'ADD'}
              </button>
            </div>

            {/* Gender */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-purple-500" />
                <div>
                  <span className="text-slate-600 font-medium">Gender</span>
                  <p className="font-bold text-slate-900 mt-0.5">{currentUser.gender}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCardClick();
                  const newGender = currentUser.gender === 'Male' ? 'Female' : 'Male';
                  updateCurrentUserProfile({ gender: newGender });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                EDIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
