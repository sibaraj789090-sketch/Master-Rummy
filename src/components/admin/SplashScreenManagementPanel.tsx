import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Shield,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { splashScreenService, SplashBackgroundConfig } from '../../services/splashScreenService';
import { sounds } from '../../utils/sound';

export const SplashScreenManagementPanel: React.FC = () => {
  const [config, setConfig] = useState<SplashBackgroundConfig>(() => splashScreenService.getConfig());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warn'; text: string } | null>(null);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = splashScreenService.subscribe((newCfg) => {
      setConfig(newCfg);
    });
    return () => unsub();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playCardClick();

    // Validate format
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setStatusMessage({
        type: 'error',
        text: 'Unsupported format. Please select a JPG, JPEG, PNG, or WEBP image.',
      });
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 8MB. Please select a smaller file.`,
      });
      return;
    }

    setSelectedFile(file);
    setStatusMessage(null);

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    sounds.playCardClick();
    setIsUploading(true);
    setStatusMessage(null);

    const res = await splashScreenService.uploadBackground(selectedFile);

    if (res.success) {
      sounds.playWinFanfare();
      setStatusMessage({
        type: 'success',
        text: res.warning
          ? `Background updated successfully! (${res.warning})`
          : 'Background photo uploaded to Supabase Storage and applied dynamically to Splash Screen for all users!',
      });
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } else {
      sounds.playBell();
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to upload background image.',
      });
    }

    setIsUploading(false);
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove the custom splash background and revert to the default casino gradient?')) {
      return;
    }

    sounds.playCardClick();
    setIsUploading(true);
    const res = await splashScreenService.removeBackground();
    setIsUploading(false);

    if (res.success) {
      sounds.playCardDeal();
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setStatusMessage({
        type: 'success',
        text: 'Custom background removed. Splash Screen restored to default Master Rummy royal gradient.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to remove background.',
      });
    }
  };

  const handleCopySql = () => {
    sounds.playCardClick();
    const sql = splashScreenService.getStorageSetupSql();
    navigator.clipboard.writeText(sql);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 2500);
  };

  // Determine active displayed image (preview takes precedence if admin picked a new file)
  const activeDisplayUrl = previewUrl || splashScreenService.getCacheBustedUrl();

  return (
    <div className="space-y-6 text-stone-100 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-black uppercase text-amber-300">
              Admin Console · App Branding
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Sync
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide">
            Splash Screen Background Management
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Customize the full-screen opening splash photo displayed to all players when launching Master Rummy.
            Uploaded images are stored in Supabase Storage with dynamic realtime propagation without app rebuilding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowLivePreviewModal(true)}
            className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Full-Screen Test</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 shadow-lg ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : statusMessage.type === 'warn'
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
              : 'bg-red-950/70 border-red-500/50 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <span className="font-bold block mb-0.5">
              {statusMessage.type === 'success' ? 'Update Confirmed' : 'Notice'}
            </span>
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Upload Controls + Live Phone Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload, Settings & Storage Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Upload & File Selection Area */}
          <div className="bg-stone-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Upload New Background Image</h3>
                  <p className="text-[11px] text-stone-400">JPG, JPEG, PNG, or WEBP (Portrait 9:16 recommended)</p>
                </div>
              </div>

              {config.url && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                  Custom Active
                </span>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag & Drop / Click Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group ${
                selectedFile
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-stone-700 hover:border-amber-400/60 bg-stone-950/60 hover:bg-stone-950'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 group-hover:bg-amber-500/25 text-amber-400 flex items-center justify-center border border-amber-400/30 transition-transform group-hover:scale-105">
                <ImageIcon className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs sm:text-sm font-extrabold text-white block">
                  {selectedFile ? selectedFile.name : 'Choose image from gallery / desktop'}
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to choose a different photo`
                    : 'Tap to browse gallery or drag & drop photo here (Max 8 MB)'}
                </span>
              </div>

              <button
                type="button"
                className="mt-1 py-2 px-4 rounded-xl bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-200 font-black text-xs uppercase tracking-wider transition-all pointer-events-none"
              >
                {selectedFile ? 'Change Selection' : 'Browse Files'}
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                disabled={!selectedFile || isUploading}
                onClick={handleUpload}
                className={`w-full sm:flex-1 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all ${
                  !selectedFile || isUploading
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 cursor-pointer active:scale-95'
                }`}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Save & Update Background</span>
                  </>
                )}
              </button>

              {config.url && (
                <button
                  disabled={isUploading}
                  onClick={handleRemove}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Custom</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Current Background Status Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Current Splash Status & Metadata</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">Theme Source</span>
                <span className="font-extrabold text-stone-200">
                  {config.url
                    ? config.source === 'supabase_storage'
                      ? 'Supabase Storage (Public CDN)'
                      : 'High-Res Direct Synchronized DB'
                    : 'Default Master Rummy Gradient'}
                </span>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">Last Updated</span>
                <span className="font-mono text-stone-300 font-semibold">
                  {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'System Default'}
                </span>
              </div>

              {config.fileName && (
                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 col-span-1 sm:col-span-2">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">File Name</span>
                  <span className="font-mono text-amber-300 truncate block">{config.fileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Supabase Storage Setup Reference (SQL copy helper) */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-extrabold text-white">Supabase Storage Bucket & RLS Setup</h4>
              </div>
              <button
                onClick={handleCopySql}
                className="py-1 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold rounded-lg border border-stone-700 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                {isCopiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Target bucket: <code className="bg-stone-950 text-amber-300 px-1 py-0.5 rounded font-mono">splash-background</code>.
              Run this in your Supabase SQL Editor if the bucket was not auto-created during project migration.
            </p>

            <pre className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-[10px] font-mono text-stone-400 max-h-32 overflow-y-auto no-scrollbar">
              {splashScreenService.getStorageSetupSql()}
            </pre>
          </div>
        </div>

        {/* Right Column: Realistic Live Smartphone Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Live Mobile Preview</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Aspect 9:19.5 (FHD+)</span>
            </div>

            {/* Smartphone Frame */}
            <div className="relative w-full aspect-[9/19] rounded-[40px] border-[6px] border-stone-800 bg-stone-950 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-4 selection:bg-transparent">
              {/* Phone Camera Punch Hole Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-stone-800 z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
              </div>

              {/* Dynamic Background Image inside Phone */}
              {activeDisplayUrl ? (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <img
                    src={activeDisplayUrl}
                    alt="Splash Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle dark overlay so text & logo are 100% crisp */}
                  <div className="absolute inset-0 bg-black/45 backdrop-brightness-95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/65" />
                </div>
              ) : (
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'radial-gradient(circle at 50% 35%, #690a14 0%, #40040a 55%, #1f0104 100%)',
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden opacity-15">
                    <span className="absolute top-[12%] left-[10%] text-3xl text-amber-300">♠</span>
                    <span className="absolute top-[22%] right-[14%] text-4xl text-red-400">♥</span>
                    <span className="absolute bottom-[28%] left-[15%] text-4xl text-red-400">♦</span>
                    <span className="absolute bottom-[20%] right-[12%] text-3xl text-amber-300">♣</span>
                  </div>
                </div>
              )}

              {/* Phone Status Bar */}
              <div className="w-full pt-2 px-2 flex justify-between items-center text-[9px] text-white/80 font-mono z-20">
                <span>9:41</span>
                <div className="flex items-center gap-1 text-[8px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Phone Center Master Rummy Emblem */}
              <div className="flex flex-col items-center text-center z-20 my-auto">
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-0.5 shadow-2xl border border-yellow-200 flex flex-col items-center justify-center text-center">
                    <span className="text-xl">👑</span>
                    <span className="text-[7px] font-black tracking-tighter text-amber-950 uppercase">
                      MASTER
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    REAL CASH GAME
                  </span>
                  <h4 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 drop-shadow">
                    MASTER RUMMY
                  </h4>
                  <p className="text-[9px] text-amber-200/90 font-medium">
                    India's Most Trusted Rummy Platform
                  </p>
                </div>
              </div>

              {/* Phone Bottom Progress Mockup */}
              <div className="w-full space-y-2 z-20 pb-2">
                <div className="bg-black/50 backdrop-blur-md p-2.5 rounded-xl border border-amber-500/20 shadow-lg space-y-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-amber-200 font-medium truncate">Syncing Tables...</span>
                    <span className="text-amber-400 font-mono font-bold">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-amber-600/40">
                    <div className="w-full h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[7px] text-stone-400 pt-0.5">
                    <span>Core Assets</span>
                    <span>v2.4.9 (Android)</span>
                  </div>
                </div>

                <div className="text-[7px] text-amber-200/60 text-center font-medium">
                  18+ Only · Play Responsibly
                </div>
              </div>

              {/* Phone Bottom Gesture Pill */}
              <div className="w-20 h-1 bg-white/40 rounded-full mx-auto z-20" />
            </div>

            <p className="text-[10px] text-stone-400 text-center italic">
              Preview updates in real-time as you select new background files.
            </p>
          </div>
        </div>
      </div>

      {/* Full-Screen Test Modal */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
          <div className="relative w-full max-w-sm aspect-[9/19] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400 flex flex-col justify-between p-6">
            {/* Background */}
            {activeDisplayUrl ? (
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                  src={activeDisplayUrl}
                  alt="Splash Full Preview"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/45 backdrop-brightness-95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/65" />
              </div>
            ) : (
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: 'radial-gradient(circle at 50% 35%, #690a14 0%, #40040a 55%, #1f0104 100%)',
                }}
              />
            )}

            {/* Top Close */}
            <div className="flex justify-end z-20">
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="py-1 px-3 bg-black/60 hover:bg-black text-white text-xs font-bold rounded-full border border-white/20 active:scale-95"
              >
                Close Preview
              </button>
            </div>

            {/* Emblem */}
            <div className="flex flex-col items-center text-center z-20 my-auto space-y-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-1 shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center">
                <span className="text-2xl">👑</span>
                <span className="text-[9px] font-black tracking-tighter text-amber-950 uppercase mt-0.5">
                  MASTER
                </span>
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600">
                MASTER RUMMY
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">India's Most Trusted 13-Card Rummy Platform</p>
            </div>

            {/* Loading */}
            <div className="z-20 space-y-2">
              <div className="bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-amber-500/20 space-y-1.5">
                <div className="flex justify-between text-xs text-amber-200">
                  <span>Loading Core Assets...</span>
                  <span className="font-mono font-bold text-amber-400">100%</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full p-0.5 border border-amber-600/40">
                  <div className="w-full h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-stone-400">
                  <span>Certified RNG</span>
                  <span>Version 2.4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
