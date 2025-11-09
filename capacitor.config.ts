import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lupyd.app",
  appName: "Lupyd",
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
    // PushNotifications: {
    //   presentationOptions: [], // Empty array to prevent in-app display
    //   smallIcon: "ic_launcher_foreground",
    //   iconColor: "#000000",
    // },
    // LocalNotifications: {
    //   smallIcon: "ic_launcher_foreground",
    //   iconColor: "#000000",
    // },

    EncryptionPlugin: {},
  },
  // server: {
  //   androidScheme: "http",
  //   cleartext: true,
  // },
  android: {
    allowMixedContent: true,
  },
};

export default config;
