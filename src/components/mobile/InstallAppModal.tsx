import React, { useState } from 'react';
import { useRummy } from '../../context/RummyContext';
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
  Info,
  ChevronDown,
  Terminal,
  FileCode2,
  Layers,
} from 'lucide-react';

import { downloadHostedApk } from '../../utils/apkDownloader';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { adminSettings } = useRummy();
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  const [copied, setCopied] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [showBuildGuide, setShowBuildGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'PWA' | 'IOS' | 'BUILD_GUIDE'>(
    'ANDROID'
  );

  if (!isOpen) return null;

  const apkUrl = adminSettings.customApkUrl || '/downloads/MasterRummy.apk';
  const apkVersion = adminSettings.apkVersion || 'v2.4.1';
  const apkSize = adminSettings.apkFileSize || '18.4 MB';

  // Real, functioning APK Download Handler
  const handleDownloadApk = (e?: React.MouseEvent) => {
    sounds.playCoinSound();
    setIsDownloadingApk(true);

    downloadHostedApk(
      apkUrl,
      'MasterRummy.apk',
      undefined,
      () => {
        setTimeout(() => setIsDownloadingApk(false), 2000);
      }
    );
  };

  // Real 1-Click PWA Install Handler
  const handlePwaInstall = async () => {
    sounds.playCoinSound();
    if (isInstallable) {
      const res = await install();
      if (res) onClose();
    } else {
      sounds.playCardClick();
    }
  };

  const handleCopyLink = () => {
    sounds.playCardClick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-amber-300 relative max-h-[92vh] flex flex-col">
        {/* Header with App Branding */}
        <div className="bg-gradient-to-r from-[#690710] via-[#850d18] to-[#4c050b] text-white p-5 text-center relative shrink-0">
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
              src="/pwa-192x192.png"
              onError={(e) => {
                // Fallback to SVG if PNG is loading
                (e.target as HTMLImageElement).src = '/pwa-icon.svg';
              }}
              alt="Master Rummy"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <h2 className="text-lg font-black text-white tracking-wide">
            MASTER RUMMY ONLINE
          </h2>
          <p className="text-xs text-amber-300 font-bold mt-0.5">
            Official Android APK & Web App Installer
          </p>

          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Safe · Virus Free · Real Money Gaming Certified</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 p-1.5 flex gap-1 text-xs font-black border-b border-slate-200 shrink-0">
          <button
            onClick={() => {
              sounds.playCardClick();
              setActiveTab('ANDROID');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'ANDROID'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              setActiveTab('PWA');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'PWA'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA 1-Click</span>
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              setActiveTab('IOS');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'IOS'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>iPhone / iOS</span>
          </button>

          <button
            onClick={() => {
              sounds.playCardClick();
              setActiveTab('BUILD_GUIDE');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'BUILD_GUIDE'
                ? 'bg-stone-800 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Android Build & Upload Guide"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Build</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* ============================================================ */}
          {/* TAB 1: ANDROID APK DIRECT DOWNLOAD */}
          {/* ============================================================ */}
          {activeTab === 'ANDROID' && (
            <div className="space-y-3.5">
              {/* PRIMARY ACTION: DIRECT APK DOWNLOAD BUTTON */}
              <a
                href={apkUrl}
                download="MasterRummy.apk"
                onClick={handleDownloadApk}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 border border-emerald-400/50 cursor-pointer text-center"
              >
                <div className="flex items-center gap-2 text-base">
                  <Download className={`w-5 h-5 ${isDownloadingApk ? 'animate-bounce text-yellow-300' : ''}`} />
                  <span>DOWNLOAD ANDROID APK ({apkVersion})</span>
                </div>
                <span className="text-[10px] text-emerald-100 font-medium">
                  {apkSize} · Direct Hosted File Download · No Store Needed
                </span>
              </a>

              {/* Direct Mirror Download Link */}
              <div className="flex items-center justify-between px-1 text-[11px] text-stone-500">
                <span>Can't download? Try direct link:</span>
                <a
                  href={apkUrl}
                  download="MasterRummy.apk"
                  onClick={handleDownloadApk}
                  className="text-emerald-700 font-bold underline hover:text-emerald-800"
                >
                  Direct APK Link ({apkSize})
                </a>
              </div>

              {/* Download Feedback State */}
              {isDownloadingApk && (
                <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-3 text-center text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Starting APK download... Check browser download notification!</span>
                </div>
              )}

              {/* Package Specs Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs space-y-1.5 font-sans">
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-stone-200">
                  <span className="font-extrabold text-stone-700">Package Verification</span>
                  <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                    HOSTED & VERIFIED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-stone-600 pt-1">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-sans">Package Name</span>
                    <strong className="text-stone-800">com.master.rummy.online611</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-sans">File Name</span>
                    <strong className="text-stone-800">MasterRummy.apk</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-sans">Target Version</span>
                    <strong className="text-stone-800">Android 8.0 to 15+ (API 34)</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-sans">Install Source</span>
                    <strong className="text-emerald-700">Direct Local & Cloud Hosted</strong>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Android Installation Guide */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs text-stone-700">
                <p className="font-black text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  Phone me APK Install karne ke 3 Aasan Steps:
                </p>
                <div className="space-y-1.5 pl-1 text-[11px]">
                  <p>
                    <strong>1. Tap Download:</strong> Upar diye gaye green button ko dabayein. <code>MasterRummy.apk</code> file download start ho jayegi.
                  </p>
                  <p>
                    <strong>2. Allow Unknown Sources:</strong> Agar phone "File might be harmful" ya "Unknown source" puche, to <strong>"Download anyway"</strong> aur <strong>"Settings &gt; Allow from this source"</strong> enable karein.
                  </p>
                  <p>
                    <strong>3. Install & Play:</strong> Download complete hone par notification bar se tap karke <strong>"Install"</strong> dabayein aur game start karein.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: PWA 1-CLICK INSTANT WEB APP */}
          {/* ============================================================ */}
          {activeTab === 'PWA' && (
            <div className="space-y-3.5">
              {/* PWA 1-Click Action */}
              {isInstallable ? (
                <button
                  onClick={handlePwaInstall}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide animate-pulse"
                >
                  <Smartphone className="w-5 h-5 text-yellow-300" />
                  <span>TAP TO INSTALL PWA (1-CLICK)</span>
                </button>
              ) : isInstalled ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Master Rummy is already installed in Standalone Mode!</span>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1 text-center">
                  <p className="font-black text-sm text-blue-950">Chrome / Edge Browser 1-Tap Install</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Browser ke top-right <strong>3 dots (⋮)</strong> dabayein aur <strong>"Install App"</strong> ya <strong>"Add to Home screen"</strong> par click karein.
                  </p>
                </div>
              )}

              {/* PWA Features Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                  <span className="font-extrabold text-stone-900 block text-xs">⚡ Zero MB Storage</span>
                  <span className="text-[10px] text-stone-500">Loads instantly without taking up internal memory</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                  <span className="font-extrabold text-stone-900 block text-xs">🔄 Auto Updates</span>
                  <span className="text-[10px] text-stone-500">Always runs the latest game tables & tournament versions</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                  <span className="font-extrabold text-stone-900 block text-xs">🎮 Fullscreen Felt</span>
                  <span className="text-[10px] text-stone-500">Opens in native standalone fullscreen landscape mode</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                  <span className="font-extrabold text-stone-900 block text-xs">🛡️ High Security</span>
                  <span className="text-[10px] text-stone-500">HTTPS encrypted, anti-cheat RNG certified</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: IPHONE / IOS GUIDE */}
          {/* ============================================================ */}
          {activeTab === 'IOS' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 text-xs text-stone-700">
              <p className="font-black text-slate-900 text-xs uppercase tracking-wider text-red-700">
                iPhone / iPad Safari Install Steps:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p className="text-[11px]">
                    Safari browser me neeche diye gaye <strong>Share button (⎋)</strong> par tap karein.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p className="text-[11px]">
                    Menu me neeche scroll karein aur <strong>"Add to Home Screen" (+)</strong> select karein.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p className="text-[11px]">
                    Top-right corner me <strong>"Add"</strong> dabayein. Official Master Rummy app aapki Home Screen par save ho jayega.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: ANDROID BUILD & HOSTING GUIDE */}
          {/* ============================================================ */}
          {activeTab === 'BUILD_GUIDE' && (
            <div className="space-y-3 text-xs">
              <div className="bg-stone-900 text-stone-200 p-3.5 rounded-2xl border border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    How to Generate & Upload Android APK
                  </span>
                  <span className="text-[9px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono">
                    Capacitor Native
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Project me <code>/android</code> directory Capacitor 8 ke sath complete configured hai. Naya release APK generate karne ke steps:
                </p>

                <div className="bg-black/70 p-2.5 rounded-xl font-mono text-[10px] space-y-1 text-emerald-400 border border-stone-800">
                  <p className="text-stone-400"># 1. Build web bundle & sync to Android project</p>
                  <p>npm run build</p>
                  <p>npx cap sync android</p>
                  <p className="text-stone-400 pt-1"># 2. Build Release APK via Gradle</p>
                  <p>cd android</p>
                  <p>./gradlew assembleRelease</p>
                  <p className="text-stone-400 pt-1"># Output APK location:</p>
                  <p className="text-amber-300">android/app/build/outputs/apk/release/app-release.apk</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-1.5 text-[11px] text-stone-700">
                <span className="font-bold text-stone-900 block">Uploading your APK file:</span>
                <p>
                  1. Apna generated APK file <code>public/downloads/MasterRummy.apk</code> par replace kar sakte hain.
                </p>
                <p>
                  2. Ya kisi cloud host (Firebase Storage, AWS S3, Google Drive, ya GitHub Releases) par upload karke <strong>Admin Panel &gt; Settings &gt; Android APK URL</strong> me direct link paste kar sakte hain.
                </p>
              </div>
            </div>
          )}

          {/* Share App Link & Copy Link */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Website Link'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playCardClick();
                if (navigator.share) {
                  navigator.share({
                    title: 'Master Rummy Online',
                    text: 'Download & Play Master Rummy - ₹1100 Bonus & Instant UPI Withdrawals!',
                    url: window.location.href,
                  });
                } else {
                  handleCopyLink();
                }
              }}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-2.5 text-center text-[10px] text-slate-500 font-medium shrink-0 flex items-center justify-between px-4">
          <span>Official Master Rummy Release</span>
          <span className="font-mono text-stone-700 font-bold">{apkVersion} · Build 611</span>
        </div>
      </div>
    </div>
  );
};
