import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lupyd.app",
  appName: "lupyd-web",
  webDir: "dist",
  plugins: {
    App: {
      urlSchemes: ["lupyd"],
      deeplinks: [
        {
          Scheme: "Lupyd",
          host: "callback",
        },
      ],
    },
  },
  server: {
    androidScheme: "http",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
