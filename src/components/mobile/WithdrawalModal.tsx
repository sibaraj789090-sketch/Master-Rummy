import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import { ChevronLeft, Headphones, Building2, ShieldCheck, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport: () => void;
  onOpenDocumentsVerification?: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onOpenSupport,
  onOpenDocumentsVerification,
}) => {
  const { currentUser, requestWithdrawal, withdrawalRequests, adminSettings } = useRummy();

  const [activeTab, setActiveTab] = useState<'REQUEST' | 'HISTORY'>('REQUEST');

  const presetAmounts = [300, 500, 1000, 2000, 3000, 5000];
  const [selectedAmount, setSelectedAmount] = useState<number>(300);

  // Bank Form Details
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('50100492837123');
  const [ifsc, setIfsc] = useState('HDFC0000123');
  const [accountHolder, setAccountHolder] = useState('Rani Siba');

  const [showBankForm, setShowBankForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const isKycApproved = currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED';

  const tds = Math.round(selectedAmount * 0.05);
  const netAmount = selectedAmount - tds;

  const handleWithdraw = () => {
    sounds.playCoinSound();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isKycApproved) {
      setErrorMessage('⚠️ 18+ Documents Verification Required! You must upload and verify your Aadhaar Card & PAN Card before withdrawing.');
      return;
    }

    if (!accountNumber || !ifsc || !accountHolder) {
      setErrorMessage('Please fill in complete bank account details');
      return;
    }

    const res = requestWithdrawal(selectedAmount, {
      accountHolder,
      accountNumber,
      ifsc,
      bankName,
    });

    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      sounds.playWinFanfare();
      setSuccessMessage('Withdrawal request submitted! Sent to Admin Panel for approval.');
      setTimeout(() => {
        setActiveTab('HISTORY');
        setSuccessMessage('');
      }, 1500);
    }
  };

  const userWithdrawals = withdrawalRequests.filter((r) => r.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col select-none overflow-y-auto no-scrollbar">
      {/* Top Header (From Screenshot 4) */}
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

        <h1 className="text-base font-black tracking-wide uppercase">WITHDRAWAL</h1>

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

      {/* Two Tabs: Withdrawal Request | Withdrawal History (From Screenshot 4) */}
      <div className="bg-white flex border-b border-slate-200 text-xs font-extrabold">
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('REQUEST');
          }}
          className={`flex-1 py-3 text-center transition-colors relative ${
            activeTab === 'REQUEST' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Withdrawal Request
        </button>
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveTab('HISTORY');
          }}
          className={`flex-1 py-3 text-center transition-colors relative ${
            activeTab === 'HISTORY' ? 'bg-[#7a0c16] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Withdrawal History
        </button>
      </div>

      {activeTab === 'REQUEST' ? (
        <div className="p-4 flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
          <div className="space-y-4">
            {/* Withdrawal Balance Card (From Screenshot 4) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Withdrawal balance (?)</span>
              <span className="text-base font-black text-slate-900 tabular-nums">
                ₹{currentUser.withdrawalBalance.toFixed(2)}
              </span>
            </div>

            {/* 18+ Documents & KYC Status Banner */}
            {!isKycApproved ? (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start justify-between gap-2.5 shadow-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-red-700 text-white font-black text-[9px] px-1 py-0.2 rounded">18+</span>
                      <span className="font-black text-xs text-amber-900">Aadhaar & PAN Verification Required</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                      Government guidelines require 18+ Aadhaar & PAN Card verification to withdraw cash.
                    </p>
                  </div>
                </div>
                {onOpenDocumentsVerification && (
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      onOpenDocumentsVerification();
                    }}
                    className="shrink-0 bg-red-700 hover:bg-red-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow-xs transition-colors"
                  >
                    Upload Now ›
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    18+ KYC Documents Verified (Aadhaar & PAN Approved)
                  </span>
                </div>
                {onOpenDocumentsVerification && (
                  <button
                    onClick={() => {
                      sounds.playCardClick();
                      onOpenDocumentsVerification();
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:underline"
                  >
                    View Docs
                  </button>
                )}
              </div>
            )}

            {/* Quick Amounts 2-Column Grid (From Screenshot 4) */}
            <div className="grid grid-cols-2 gap-2.5">
              {presetAmounts.map((amt) => {
                const isSelected = selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => {
                      sounds.playCardClick();
                      setSelectedAmount(amt);
                    }}
                    className={`py-3.5 rounded-xl text-center font-black text-base transition-all ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>

            {/* Bank Card (From Screenshot 4) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{bankName}</p>
                    <p className="text-[10px] text-slate-500">
                      A/C: •••• {accountNumber.slice(-4)} · {accountHolder}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500">Get</span>
                  <p className="text-sm font-black text-slate-900">₹{netAmount}</p>
                </div>
              </div>

              {/* Edit bank toggle */}
              <div className="mt-2 pt-2 border-t border-slate-100 text-right">
                <button
                  onClick={() => setShowBankForm(!showBankForm)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  {showBankForm ? 'Hide Bank Details' : 'Change Bank Account'}
                </button>
              </div>

              {/* Bank Details Form */}
              {showBankForm && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      placeholder="e.g. HDFC, SBI, ICICI"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      placeholder="Enter 12-16 digit Account Number"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs uppercase"
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Account Holder Name</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      placeholder="Full Name as on Bank Passbook"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Action button & Footer (From Screenshot 4) */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            {!isKycApproved ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playCardClick();
                  if (onOpenDocumentsVerification) {
                    onOpenDocumentsVerification();
                  } else {
                    setErrorMessage('⚠️ 18+ Documents Verification Required! Upload Aadhaar & PAN Card before withdrawing.');
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm tracking-wide rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>COMPLETE 18+ KYC TO UNLOCK WITHDRAWAL</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWithdraw}
                className="w-full py-3.5 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#16a34a] hover:to-[#166534] text-white font-black text-base tracking-wider rounded-xl shadow-lg active:scale-95 transition-all uppercase"
              >
                CONTINUE
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% safe, verified & secure</span>
            </div>
          </div>
        </div>
      ) : (
        /* Withdrawal History Tab */
        <div className="p-4 space-y-3 flex-1 overflow-y-auto no-scrollbar">
          {userWithdrawals.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-xs">No withdrawal history found</p>
              <p className="text-[11px] text-slate-400 mt-1">Submit a withdrawal request to view status here.</p>
            </div>
          ) : (
            userWithdrawals.map((req) => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-sm text-slate-900">₹{req.amount}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {req.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                    {req.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                    <span>{req.status}</span>
                  </span>
                </div>

                <div className="pt-2 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Bank:</span>
                    <span className="font-medium text-slate-800">
                      {req.bankAccount.bankName} (•••• {req.bankAccount.accountNumber.slice(-4)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Credited:</span>
                    <span className="font-bold text-emerald-700">₹{req.netPayable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requested:</span>
                    <span>{req.requestTime}</span>
                  </div>
                  {req.adminRemark && (
                    <div className="bg-slate-50 p-1.5 rounded text-[10px] text-slate-500 mt-1">
                      <strong>Admin note:</strong> {req.adminRemark}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
