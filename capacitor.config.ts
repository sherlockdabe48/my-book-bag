import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.mybookbag",
  appName: "MyBookBag",
  webDir: "dist",
  // Allow localhost during local dev (npx cap run ios with live-reload)
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#2f2f2f",
    },
  },
}

export default config
