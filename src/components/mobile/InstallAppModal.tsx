import React, { useState } from 'react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { sounds } from '../../utils/sound';
import {
  Download,
  Smartphone,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'IOS' | 'DESKTOP'>(
    isIOS ? 'IOS' : 'ANDROID'
  );

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playCoinSound();
    if (isInstallable) {
      const res = await install();
      if (res) onClose();
    }
  };

  const handleCopyLink = () => {
    sounds.playCardClick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-300 relative">
        {/* Header with App Icon */}
        <div className="bg-gradient-to-r from-[#690710] via-[#850d18] to-[#4c050b] text-white p-5 text-center relative">
          <button
            onClick={() => {
              sounds.playCardClick();
              onClose();
            }}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl mx-auto mb-2 bg-gradient-to-br from-amber-400 to-yellow-600 p-1 shadow-xl flex items-center justify-center">
            <img
              src="/pwa-icon.svg"
              alt="Master Rummy"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <h2 className="text-lg font-black text-white tracking-wide">
            MASTER RUMMY ONLINE
          </h2>
          <p className="text-xs text-amber-300 font-bold mt-0.5">
            Download & Install Official App
          </p>

          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Safe · Zero Storage · Direct Install</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4">
          {/* Quick Install Button if browser supports 1-tap install */}
          {isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide animate-pulse"
            >
              <Download className="w-5 h-5" />
              <span>TAP TO INSTALL APP (1-CLICK)</span>
            </button>
          ) : isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>App is already installed on your device!</span>
            </div>
          ) : null}

          {/* OS Selector Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-black">
            <button
              onClick={() => {
                sounds.playCardClick();
                setActiveTab('ANDROID');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'ANDROID'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                setActiveTab('IOS');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'IOS'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iPhone / iOS
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                setActiveTab('DESKTOP');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'DESKTOP'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PC / Laptop
            </button>
          </div>

          {/* Android Steps & Native APK Info */}
          {activeTab === 'ANDROID' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950">Android Package Info</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full">
                    READY
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 text-[11px] text-stone-700 font-mono">
                  <p>App ID: <strong className="text-red-700">com.master.rummy.online611</strong></p>
                  <p>Type: Native Android App + PWA APK</p>
                  <p>Target: Android 14+ (API 34)</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-700">
                <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-amber-700">
                  Phone mein Direct App Install karne ke 2 Tareeqe:
                </p>
                
                {/* Method 1: Chrome 1-Click */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    Instant Chrome Direct Install (Recommended)
                  </p>
                  <p className="text-[11px] text-slate-600 pl-5">
                    Chrome browser ke <strong>3 dots (⋮)</strong> dabayein aur <strong>"Install app"</strong> / <strong>"Add to Home screen"</strong> par click karein. Ye bina kisi file transfer ke phone ke app drawer mein official APK icon add kar dega.
                  </p>
                </div>

                {/* Method 2: Android Studio / APK Build */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    Android Project Source Code (Ready)
                  </p>
                  <p className="text-[11px] text-slate-600 pl-5">
                    Project mein <code>/android</code> folder (Capacitor Native Gradle) fully configured hai with <code>AndroidManifest.xml</code>. Android Studio mein open karke direct <code>Build &gt; Build APK</code> kar sakte hain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* iOS Steps */}
          {activeTab === 'IOS' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-700">
              <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-amber-700">
                iPhone / iPad Safari mein Install karne ka tarika:
              </p>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Safari browser ke neeche <strong>Share button (⎋)</strong> par tap karein.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  Neeche scroll karke <strong>"Add to Home Screen" (+)</strong> select karein.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  Top right mein <strong>"Add"</strong> dabayein. App aapke home screen par save ho jayega.
                </p>
              </div>
            </div>
          )}

          {/* Desktop Steps */}
          {activeTab === 'DESKTOP' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-700">
              <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-amber-700">
                Chrome / Edge PC mein Install karne ka tarika:
              </p>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Address bar ke right side mein <strong>Install Icon (⊕)</strong> par click karein.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  <strong>"Install Master Rummy"</strong> popup aane par Install dabayein.
                </p>
              </div>
            </div>
          )}

          {/* Share App Link Button */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy App Link'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                if (navigator.share) {
                  navigator.share({
                    title: 'Master Rummy Online',
                    text: 'Download & Play Master Rummy - ₹1100 Bonus & Instant Withdrawals!',
                    url: window.location.href,
                  });
                } else {
                  handleCopyLink();
                }
              }}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-[10px] text-slate-500 font-medium">
          Official Master Rummy Progressive Web App · Version 2.2.9
        </div>
      </div>
    </div>
  );
};
