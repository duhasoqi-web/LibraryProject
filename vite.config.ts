import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    server: {
      host: true,
      port: 5001,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api/Cms": {
          target: "http://librarytest.runasp.net",
          changeOrigin: true,
          secure: false,
        },
        "/media": {
          target: "http://librarytest.runasp.net",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/media/, ""),
        },
        "/api": {
          target: "http://mylibrary.tryasp.net",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});