import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

import fs from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'pwa-icon.svg',
          'manifest.json',
        ],
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: false, // We supply /manifest.json directly
      }),
      {
        name: 'apk-downloader-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url.includes('MasterRummy.apk') || req.url.startsWith('/downloads/'))) {
              const apkFilePath = path.resolve(process.cwd(), 'public/downloads/MasterRummy.apk');
              if (fs.existsSync(apkFilePath)) {
                const stat = fs.statSync(apkFilePath);
                res.writeHead(200, {
                  'Content-Type': 'application/vnd.android.package-archive',
                  'Content-Length': stat.size,
                  'Content-Disposition': 'attachment; filename="MasterRummy.apk"',
                  'Accept-Ranges': 'bytes',
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': 'no-cache',
                });
                const readStream = fs.createReadStream(apkFilePath);
                readStream.pipe(res);
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      forwardConsole: false,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
