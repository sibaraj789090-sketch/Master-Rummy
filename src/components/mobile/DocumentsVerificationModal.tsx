import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Calendar,
  User,
  CreditCard,
  Clock,
  XCircle,
  Info,
  Lock,
} from 'lucide-react';
import { sounds } from '../../utils/sound';

interface DocumentsVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
}

export const DocumentsVerificationModal: React.FC<DocumentsVerificationModalProps> = ({
  isOpen,
  onClose,
  onOpenSupport,
}) => {
  const { currentUser, submitKycDocument, adminApproveKycDoc } = useRummy();

  const [activeDocTab, setActiveDocTab] = useState<'AADHAAR' | 'PAN'>('AADHAAR');

  // Aadhaar states
  const existingAadhaar = currentUser.kycDetails?.aadhaar;
  const [aadhaarNumber, setAadhaarNumber] = useState(
    existingAadhaar?.documentNumber || '8492 3847 1920'
  );
  const [aadhaarName, setAadhaarName] = useState(
    existingAadhaar?.holderName || currentUser.username || 'Player 35150'
  );
  const [aadhaarFrontImg, setAadhaarFrontImg] = useState<string>(
    existingAadhaar?.frontImage ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [aadhaarBackImg, setAadhaarBackImg] = useState<string>(
    existingAadhaar?.backImage ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );

  // PAN states
  const existingPan = currentUser.kycDetails?.pan;
  const [panNumber, setPanNumber] = useState(
    existingPan?.documentNumber || 'ABCDE1234F'
  );
  const [panName, setPanName] = useState(
    existingPan?.holderName || currentUser.username || 'Player 35150'
  );
  const [panDob, setPanDob] = useState(
    existingPan?.dob || currentUser.dob || '2001-05-14'
  );
  const [panFrontImg, setPanFrontImg] = useState<string>(
    existingPan?.frontImage ||
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  );

  // 18+ declaration checkbox
  const [is18PlusAgreed, setIs18PlusAgreed] = useState<boolean>(true);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Age calculation helper
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(panDob);
  const isEligible18Plus = calculatedAge >= 18;

  // Format Aadhaar with spaces XXXX XXXX XXXX
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarNumber(formatted);
  };

  // Format PAN uppercase
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setPanNumber(raw);
  };

  // Handle local image file upload
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'aadhaarFront' | 'aadhaarBack' | 'pan') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (target === 'aadhaarFront') setAadhaarFrontImg(reader.result);
          if (target === 'aadhaarBack') setAadhaarBackImg(reader.result);
          if (target === 'pan') setPanFrontImg(reader.result);
          sounds.playCardClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Aadhaar
  const handleSubmitAadhaar = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanNumber = aadhaarNumber.replace(/\s+/g, '');
    if (cleanNumber.length !== 12) {
      setFeedback({ type: 'error', message: 'Aadhaar Card number must be exactly 12 digits' });
      return;
    }
    if (!aadhaarName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your Full Legal Name as per Aadhaar' });
      return;
    }
    if (!aadhaarFrontImg) {
      setFeedback({ type: 'error', message: 'Please upload Front Photo of your Aadhaar Card' });
      return;
    }
    if (!is18PlusAgreed) {
      setFeedback({ type: 'error', message: 'You must confirm that you are 18+ years of age' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitKycDocument({
        type: 'AADHAAR',
        documentNumber: aadhaarNumber,
        holderName: aadhaarName,
        frontImage: aadhaarFrontImg,
        backImage: aadhaarBackImg,
      });
      setIsSubmitting(false);
      setFeedback({ type: 'success', message: res.message });
      sounds.playWinFanfare();
    }, 600);
  };

  // Submit PAN Card
  const handleSubmitPan = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      setFeedback({
        type: 'error',
        message: 'Invalid PAN format. Standard format is 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)',
      });
      return;
    }
    if (!panName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter Full Name as printed on PAN Card' });
      return;
    }
    if (calculatedAge < 18) {
      setFeedback({
        type: 'error',
        message: `Strictly 18+ Only! According to Date of Birth (${panDob}), you are ${calculatedAge} years old. Minimum 18 years required.`,
      });
      return;
    }
    if (!panFrontImg) {
      setFeedback({ type: 'error', message: 'Please upload Front Photo of your PAN Card' });
      return;
    }
    if (!is18PlusAgreed) {
      setFeedback({ type: 'error', message: 'You must confirm you are 18+ years of age' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitKycDocument({
        type: 'PAN',
        documentNumber: panNumber,
        holderName: panName,
        dob: panDob,
        frontImage: panFrontImg,
      });
      setIsSubmitting(false);
      setFeedback({ type: 'success', message: res.message });
      sounds.playWinFanfare();
    }, 600);
  };

  // Instant Instant AI OCR Approval demo
  const handleInstantDemoApproval = (type: 'AADHAAR' | 'PAN' | 'ALL') => {
    sounds.playCoinSound();
    adminApproveKycDoc(currentUser.id, type);
    setFeedback({
      type: 'success',
      message: `Verified instantly! ${type === 'ALL' ? 'Full KYC & 18+ Approved' : `${type} Approved`}.`,
    });
  };

  const aadhaarStatus = currentUser.kycDetails?.aadhaar?.status || (currentUser.isKycVerified ? 'VERIFIED' : 'PENDING');
  const panStatus = currentUser.kycDetails?.pan?.status || (currentUser.isKycVerified ? 'VERIFIED' : 'PENDING');
  const isOverallVerified = currentUser.isKycVerified || currentUser.kycDetails?.overallStatus === 'VERIFIED';

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col select-none overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <div className="bg-[#59040c] text-white px-3 py-3 flex items-center justify-between shadow-md shrink-0">
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
          <div className="flex items-center justify-center gap-1.5">
            <span className="bg-red-700 text-white font-black text-[10px] px-1.5 py-0.5 rounded-sm">
              18+ ONLY
            </span>
            <h1 className="text-sm font-black tracking-wide uppercase">DOCUMENTS VERIFICATION</h1>
          </div>
          <p className="text-[10px] text-amber-300 font-medium">Aadhaar Card & PAN Card Compliance</p>
        </div>

        <div className="w-7">
          {/* spacer */}
        </div>
      </div>

      {/* 18+ Mandatory Disclaimer Banner */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 text-white p-3 border-b border-amber-500/30 flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs text-amber-300 uppercase tracking-wider">
              Legal Compliance & 18+ Age Policy
            </span>
            <span className="text-[9px] bg-red-600 font-extrabold px-1.5 py-0.2 rounded text-white">
              Mandatory
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
            Indian regulations require age verification (18+) & Tax KYC before processing instant bank or UPI cash withdrawals.
          </p>
        </div>
      </div>

      {/* KYC Progress Overview Cards */}
      <div className="p-3 bg-white border-b border-slate-200">
        <div className="grid grid-cols-2 gap-2">
          {/* Aadhaar card status */}
          <div
            onClick={() => setActiveDocTab('AADHAAR')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              activeDocTab === 'AADHAAR'
                ? 'border-red-600 bg-red-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-800">Aadhaar Card</span>
              {aadhaarStatus === 'VERIFIED' ? (
                <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : aadhaarStatus === 'PENDING' ? (
                <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600">
                  <Clock className="w-3 h-3" /> In Review
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-slate-400">Not Uploaded</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Identity & Age Proof</p>
          </div>

          {/* PAN card status */}
          <div
            onClick={() => setActiveDocTab('PAN')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              activeDocTab === 'PAN'
                ? 'border-red-600 bg-red-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-800">PAN Card</span>
              {panStatus === 'VERIFIED' ? (
                <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : panStatus === 'PENDING' ? (
                <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600">
                  <Clock className="w-3 h-3" /> In Review
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-slate-400">Not Uploaded</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">TDS & Withdrawal Tax Proof</p>
          </div>
        </div>

        {/* Global overall status badge */}
        <div className="mt-2.5 p-2 rounded-lg bg-stone-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">
              Account Status: {isOverallVerified ? 'Fully Verified & Withdrawal Ready' : 'Documents Verification Active'}
            </span>
          </div>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
              isOverallVerified
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-stone-950'
            }`}
          >
            {isOverallVerified ? 'KYC PASS' : 'ACTION REQUIRED'}
          </span>
        </div>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveDocTab('AADHAAR');
            setFeedback(null);
          }}
          className={`flex-1 py-3 text-xs font-black text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeDocTab === 'AADHAAR'
              ? 'border-red-600 text-red-600 bg-red-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>AADHAAR CARD (UIDAI)</span>
        </button>

        <button
          onClick={() => {
            sounds.playCardClick();
            setActiveDocTab('PAN');
            setFeedback(null);
          }}
          className={`flex-1 py-3 text-xs font-black text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            activeDocTab === 'PAN'
              ? 'border-red-600 text-red-600 bg-red-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PAN CARD (INCOME TAX)</span>
        </button>
      </div>

      {/* Notification feedback message */}
      {feedback && (
        <div className="p-3">
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* TAB 1: AADHAAR CARD VERIFICATION */}
      {activeDocTab === 'AADHAAR' && (
        <div className="p-3 space-y-4 flex-1">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Aadhaar Card Details
                </span>
              </div>
              <span className="text-[10px] text-slate-400">12-Digit UID</span>
            </div>

            <form onSubmit={handleSubmitAadhaar} className="space-y-3">
              {/* Aadhaar Number Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  12-Digit Aadhaar Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    maxLength={14}
                    placeholder="8492 3847 1920"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-widest text-slate-800 focus:outline-hidden transition-colors"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Full Name on Aadhaar */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Full Legal Name (as on Aadhaar Card) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aadhaarName}
                    onChange={(e) => setAadhaarName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Upload Aadhaar Front & Back */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Upload Aadhaar Images (Front & Back) *
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Front side upload */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Front Photo</span>
                    {aadhaarFrontImg ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-300 h-28 bg-stone-900 group">
                        <img
                          src={aadhaarFrontImg}
                          alt="Aadhaar Front"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setAadhaarFrontImg('')}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl bg-slate-50 cursor-pointer p-2 text-center transition-colors">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600">Upload Front</span>
                        <span className="text-[8px] text-slate-400">JPG, PNG (Max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFile(e, 'aadhaarFront')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Back side upload */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Back Photo (Address)</span>
                    {aadhaarBackImg ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-300 h-28 bg-stone-900 group">
                        <img
                          src={aadhaarBackImg}
                          alt="Aadhaar Back"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setAadhaarBackImg('')}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl bg-slate-50 cursor-pointer p-2 text-center transition-colors">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600">Upload Back</span>
                        <span className="text-[8px] text-slate-400">Address side</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFile(e, 'aadhaarBack')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Sample Document quick load helper */}
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playCardClick();
                      setAadhaarFrontImg('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80');
                      setAadhaarBackImg('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80');
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Insert Test Aadhaar Samples</span>
                  </button>
                  <span className="text-[9px] text-slate-400">Encrypted 256-bit</span>
                </div>
              </div>

              {/* 18+ Mandatory Confirmation Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is18PlusAgreed}
                    onChange={(e) => setIs18PlusAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4 shrink-0"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold leading-tight">
                    <strong className="text-red-700">18+ Declaration:</strong> I certify that I am at least 18 years old and legally permitted to participate in skill-based online rummy under Indian laws.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>SUBMITTING AADHAAR...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>SUBMIT AADHAAR FOR VERIFICATION</span>
                  </>
                )}
              </button>

              {/* Demo Auto-Approval button for immediate testing */}
              <button
                type="button"
                onClick={() => handleInstantDemoApproval('AADHAAR')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Auto-Verify Aadhaar (Demo Mode)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PAN CARD VERIFICATION */}
      {activeDocTab === 'PAN' && (
        <div className="p-3 space-y-4 flex-1">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  PAN Card Details (TDS Compliance)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">10-Character Alphanumeric</span>
            </div>

            <form onSubmit={handleSubmitPan} className="space-y-3">
              {/* PAN Number Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  10-Character PAN Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={panNumber}
                    onChange={handlePanChange}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-widest text-slate-800 uppercase focus:outline-hidden transition-colors"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
                </span>
              </div>

              {/* Full Name on PAN */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Full Name (as printed on PAN Card) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={panName}
                    onChange={(e) => setPanName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Date of Birth with 18+ Calculation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    Date of Birth (as on PAN Card) *
                  </label>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                      isEligible18Plus
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    Age: {calculatedAge} years ({isEligible18Plus ? '18+ Verified' : 'Under 18 Ineligible'})
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={panDob}
                    onChange={(e) => setPanDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden transition-colors"
                  />
                </div>
                {!isEligible18Plus && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">
                    ⚠️ You must be at least 18 years old to submit documents.
                  </p>
                )}
              </div>

              {/* Upload PAN Card Front Image */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Upload PAN Card Front Photo *
                </label>

                {panFrontImg ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-stone-900 group">
                    <img
                      src={panFrontImg}
                      alt="PAN Card Front"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPanFrontImg('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl bg-slate-50 cursor-pointer p-3 text-center transition-colors">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Upload PAN Card Front</span>
                    <span className="text-[9px] text-slate-400">Clear picture showing PAN & Name</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, 'pan')}
                    />
                  </label>
                )}

                {/* Sample Document quick load helper */}
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playCardClick();
                      setPanFrontImg('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Insert Test PAN Sample</span>
                  </button>
                  <span className="text-[9px] text-slate-400">Income Tax Compliant</span>
                </div>
              </div>

              {/* 18+ Mandatory Confirmation Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is18PlusAgreed}
                    onChange={(e) => setIs18PlusAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4 shrink-0"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold leading-tight">
                    <strong className="text-red-700">18+ Declaration:</strong> I confirm that I am 18+ years of age, and the PAN details provided belong solely to me for TDS tax deductions.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isEligible18Plus}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-800 hover:to-rose-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>SUBMITTING PAN...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>SUBMIT PAN CARD FOR VERIFICATION</span>
                  </>
                )}
              </button>

              {/* Demo Auto-Approval button for immediate testing */}
              <button
                type="button"
                onClick={() => handleInstantDemoApproval('PAN')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Auto-Verify PAN (Demo Mode)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security & Regulatory Footnote */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 text-center space-y-1 shrink-0">
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-red-600" />
            Strictly 18+ Only
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Income Tax TDS Section 194B
          </span>
        </div>
        <p className="text-[9px] text-slate-400">
          Your personal data is protected under Indian Privacy Regulations and used solely for identity & tax reporting.
        </p>
      </div>
    </div>
  );
};
