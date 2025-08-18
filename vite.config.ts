import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";

// https://vite.dev/config/

const buildProxy = (addr: string): Record<string, string | ProxyOptions> => {
  return {
    "/api/v1": {
      target: `http://${addr}:39201`,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/v1/, ""),
    },
    "/apicdn/v1": {
      target: `http://${addr}:8787`,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/apicdn\/v1/, ""),
    },
    "/cdn": {
      target: `http://${addr}:8787`,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/cdn/, ""),
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "NEXT_PUBLIC_");

  const emulatorAddr = env["NEXT_PUBLIC_JS_ENV_EMULATOR_ADDR"];

  return {
    plugins: [react(), visualizer()],

    define: Object.fromEntries(
      Object.entries(env).map(([key, val]) => [
        `process.env.${key}`,
        JSON.stringify(val),
      ]),
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: 8080,
      proxy: buildProxy(emulatorAddr),
      host: "0.0.0.0",
    },
  };
});
