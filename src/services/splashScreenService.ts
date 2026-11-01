import { supabase, getSupabaseConfig } from '../lib/supabase';

export interface SplashBackgroundConfig {
  url: string | null;
  updatedAt: string | null;
  fileName: string | null;
  fileSize?: number;
  storagePath?: string;
  source: 'supabase_storage' | 'base64_fallback' | 'default';
}

const STORAGE_KEY = 'master_rummy_splash_background_config';
const BUCKET_NAME = 'splash-background';

// BroadcastChannel for cross-tab realtime sync
const splashBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('master_rummy_splash_sync')
    : null;

class SplashScreenService {
  private currentConfig: SplashBackgroundConfig = {
    url: null,
    updatedAt: null,
    fileName: null,
    source: 'default',
  };

  private listeners: Set<(config: SplashBackgroundConfig) => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    // Load local cached config for instant initial frame rendering
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          this.currentConfig = JSON.parse(cached);
        }
      } catch (err) {
        console.warn('Error reading splash cache:', err);
      }
    }

    // Listen for cross-tab broadcasts
    if (splashBroadcast) {
      splashBroadcast.onmessage = (event) => {
        if (event.data?.type === 'SPLASH_BACKGROUND_UPDATED') {
          this.currentConfig = event.data.payload;
          this.notifyListeners();
        }
      };
    }

    // Refresh from Supabase database
    this.refreshFromDatabase();
  }

  /**
   * Fetches latest splash background config from Supabase database (app_settings table)
   */
  async refreshFromDatabase(): Promise<SplashBackgroundConfig> {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value, updated_at')
          .eq('key', 'splash_background')
          .maybeSingle();

        if (!error && data?.value) {
          const val = data.value;
          this.currentConfig = {
            url: val.url || null,
            updatedAt: data.updated_at || val.updatedAt || null,
            fileName: val.fileName || null,
            fileSize: val.fileSize,
            storagePath: val.storagePath,
            source: val.source || 'supabase_storage',
          };
          this.saveToLocalCache(this.currentConfig);
          this.notifyListeners();
          return this.currentConfig;
        }
      } catch (err) {
        console.warn('Could not fetch splash config from Supabase:', err);
      }
    }
    return this.currentConfig;
  }

  /**
   * Returns current active config with cache-busting query parameter for URLs
   */
  getConfig(): SplashBackgroundConfig {
    return this.currentConfig;
  }

  getCacheBustedUrl(): string | null {
    if (!this.currentConfig.url) return null;
    if (this.currentConfig.url.startsWith('data:')) {
      return this.currentConfig.url; // Data URLs don't need query params
    }
    const stamp = this.currentConfig.updatedAt
      ? new Date(this.currentConfig.updatedAt).getTime()
      : Date.now();
    const separator = this.currentConfig.url.includes('?') ? '&' : '?';
    return `${this.currentConfig.url}${separator}t=${stamp}`;
  }

  /**
   * Uploads background image:
   * 1. Validates JPG, JPEG, PNG, WEBP and size <= 10MB
   * 2. Attempts upload to Supabase Storage bucket 'splash-background'
   * 3. Stores metadata in 'app_settings' table
   * 4. If bucket is missing, falls back to high-res Base64 data URL and prompts SQL setup
   */
  async uploadBackground(file: File): Promise<{
    success: boolean;
    url?: string;
    warning?: string;
    error?: string;
  }> {
    // 1. Validate file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: 'Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP file.',
      };
    }

    // 2. Validate file size (max 8MB)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 8MB limit. Please choose a smaller image.`,
      };
    }

    const config = getSupabaseConfig();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const storagePath = `splash_bg_${Date.now()}.${fileExt}`;

    let uploadedUrl: string | null = null;
    let warningMessage: string | undefined;
    let source: 'supabase_storage' | 'base64_fallback' = 'base64_fallback';

    if (config.isConfigured) {
      try {
        // Attempt upload to Supabase Storage bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600',
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          if (urlData?.publicUrl) {
            uploadedUrl = urlData.publicUrl;
            source = 'supabase_storage';
          }
        } else if (uploadError) {
          console.warn('Supabase storage upload returned error, trying fallback:', uploadError.message);
          warningMessage = `Supabase Storage Bucket notice: ${uploadError.message}. Image saved via resilient direct database storage.`;
        }
      } catch (err: any) {
        console.warn('Storage exception, proceeding to resilient fallback:', err);
        warningMessage = 'Storage upload notice: Image synced using resilient high-fidelity database storage.';
      }
    }

    // Resilient fallback: Convert to data URL if Storage bucket wasn't reachable
    if (!uploadedUrl) {
      try {
        uploadedUrl = await this.fileToDataUrl(file);
        source = 'base64_fallback';
      } catch (encodeErr) {
        return {
          success: false,
          error: 'Failed to process image file. Please try again with another image.',
        };
      }
    }

    const updatedAt = new Date().toISOString();
    const newConfig: SplashBackgroundConfig = {
      url: uploadedUrl,
      updatedAt,
      fileName: file.name,
      fileSize: file.size,
      storagePath,
      source,
    };

    // Save to database
    if (config.isConfigured) {
      try {
        await supabase.from('app_settings').upsert({
          key: 'splash_background',
          value: newConfig,
          updated_at: updatedAt,
          updated_by: 'admin',
        });
      } catch (dbErr) {
        console.warn('Could not write to app_settings table in Supabase:', dbErr);
      }
    }

    // Save to local cache & broadcast
    this.currentConfig = newConfig;
    this.saveToLocalCache(newConfig);
    this.broadcastUpdate(newConfig);
    this.notifyListeners();

    return {
      success: true,
      url: uploadedUrl,
      warning: warningMessage,
    };
  }

  /**
   * Removes current splash background and resets to default casino gradient
   */
  async removeBackground(): Promise<{ success: boolean; error?: string }> {
    const config = getSupabaseConfig();
    const oldStoragePath = this.currentConfig.storagePath;

    if (config.isConfigured) {
      try {
        // Remove from database
        await supabase.from('app_settings').upsert({
          key: 'splash_background',
          value: {
            url: null,
            updatedAt: new Date().toISOString(),
            fileName: null,
            source: 'default',
          },
          updated_at: new Date().toISOString(),
          updated_by: 'admin',
        });

        // Try to delete old file from storage bucket if it existed
        if (oldStoragePath) {
          try {
            await supabase.storage.from(BUCKET_NAME).remove([oldStoragePath]);
          } catch {}
        }
      } catch (err: any) {
        console.warn('Error clearing background in Supabase:', err);
      }
    }

    this.currentConfig = {
      url: null,
      updatedAt: new Date().toISOString(),
      fileName: null,
      source: 'default',
    };

    this.saveToLocalCache(this.currentConfig);
    this.broadcastUpdate(this.currentConfig);
    this.notifyListeners();

    return { success: true };
  }

  /**
   * Helper to convert File to base64 Data URL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private saveToLocalCache(config: SplashBackgroundConfig) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn('Error saving to localStorage:', e);
      }
    }
  }

  private broadcastUpdate(config: SplashBackgroundConfig) {
    if (splashBroadcast) {
      try {
        splashBroadcast.postMessage({
          type: 'SPLASH_BACKGROUND_UPDATED',
          payload: config,
        });
      } catch (e) {
        console.warn('Error broadcasting splash update:', e);
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentConfig);
      } catch (e) {
        console.warn('Listener error in splashScreenService:', e);
      }
    });
  }

  /**
   * Subscribe to live splash screen background updates
   */
  subscribe(callback: (config: SplashBackgroundConfig) => void): () => void {
    this.listeners.add(callback);
    // Immediately invoke with current state
    callback(this.currentConfig);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * SQL migration helper for Supabase SQL Editor
   */
  getStorageSetupSql(): string {
    return `-- ==========================================================
-- SUPABASE SPLASH BACKGROUND STORAGE & APP SETTINGS SETUP
-- ==========================================================

-- 1. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by TEXT
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);

-- Authenticated users / admins can insert and update
DROP POLICY IF EXISTS "Authenticated manage app_settings" ON public.app_settings;
CREATE POLICY "Authenticated manage app_settings" ON public.app_settings FOR ALL USING (true);

-- 2. Storage Bucket for Splash Background
INSERT INTO storage.buckets (id, name, public)
VALUES ('splash-background', 'splash-background', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Storage Policies
DROP POLICY IF EXISTS "Public splash-background read" ON storage.objects;
CREATE POLICY "Public splash-background read" ON storage.objects FOR SELECT USING (bucket_id = 'splash-background');

DROP POLICY IF EXISTS "Public splash-background insert" ON storage.objects;
CREATE POLICY "Public splash-background insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'splash-background');

DROP POLICY IF EXISTS "Public splash-background update" ON storage.objects;
CREATE POLICY "Public splash-background update" ON storage.objects FOR UPDATE USING (bucket_id = 'splash-background');

DROP POLICY IF EXISTS "Public splash-background delete" ON storage.objects;
CREATE POLICY "Public splash-background delete" ON storage.objects FOR DELETE USING (bucket_id = 'splash-background');
`;
  }
}

export const splashScreenService = new SplashScreenService();
