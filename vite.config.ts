// import react from "@vitejs/plugin-react";
import preact from "@preact/preset-vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import rollupPluginLicense from "rollup-plugin-license";

// https://vite.dev/config/

const buildProxy = (addr: string): Record<string, string | ProxyOptions> => {
  const proxy = {
    "/api/v1": {
      target: `http://${addr}:39201`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/v1/, ""),
    },
    "/apicdn/v1": {
      target: `http://${addr}:8787`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/apicdn\/v1/, ""),
    },
    "/cdn": {
      target: `http://${addr}:8787`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/cdn/, ""),
    },
  };

  console.log(proxy);

  return proxy;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "NEXT_PUBLIC_");
  console.log(env);

  const emulatorAddr = env["NEXT_PUBLIC_JS_ENV_EMULATOR_ADDR"];

  return {
    plugins: [
      preact(),
      
      rollupPluginLicense({
        thirdParty: {
          includePrivate: true,
          output: "dist/third-party-licenses.txt",
        },
      }),

      visualizer(),
    ],

    define: Object.fromEntries(
      Object.entries(env).map(([key, val]) => [
        `process.env.${key}`,
        JSON.stringify(val),
      ]),
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),

        react: "preact/compat",
        "react-dom": "preact/compat",
      },
    },

    build: {
      rollupOptions: {
        treeshake: "smallest",
        output: {
          inlineDynamicImports: false,
          manualChunks: (id: string) => {
            if (id.includes("lucide")) {
              return "lucide";
            }
          },
        },
        plugins: [
         
    
        ],
      },
    },
    assetsInclude: ['**/*.wasm'],

    server: {
      port: 8080,
      proxy: buildProxy(emulatorAddr),
      host: "0.0.0.0",

      mimeTypes: {
        'application/wasm': ['wasm']
      }
    },
  };
});
