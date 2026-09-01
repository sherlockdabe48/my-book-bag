import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Write the generated SW and assets into dist/
      outDir: "dist",
      // Precache everything Vite outputs (JS, CSS, HTML)
      includeAssets: ["**/*"],
      manifest: false,  // we already have public/manifest.json
      workbox: {
        // Cache the app shell (HTML + all assets)
        globPatterns: ["**/*.{js,css,html,svg,png,ico,ttf,woff,woff2}"],
        // Network-first for API calls; cache-first for assets
        runtimeCaching: [
          {
            // Open Library API — stale-while-revalidate so browsing works offline
            urlPattern: /^https:\/\/openlibrary\.org\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "openlibrary-api",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cover images from Open Library CDN
            urlPattern: /^https:\/\/covers\.openlibrary\.org\//,
            handler: "CacheFirst",
            options: {
              cacheName: "openlibrary-covers",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts — cache-first once loaded
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  envPrefix: ["REACT_APP_", "VITE_"],
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
})
