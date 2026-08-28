import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.pagesbag",
  appName: "PagesBag",
  webDir: "dist",
  // Allow localhost during local dev (npx cap run ios with live-reload)
  server: {
    androidScheme: "https",
  },
  plugins: {
    // @capacitor/filesystem — no extra config needed for Documents directory
  },
}

export default config
