import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.adelierbag",
  appName: "AdélierBag",
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
