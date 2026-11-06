import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

function offlineAppShell() {
  const serviceWorker = readFileSync(new URL("./src/sw-template.js", import.meta.url), "utf8");

  return {
    name: "weather-offline-app-shell",
    apply: "build",
    generateBundle(_, bundle) {
      const assets = Object.keys(bundle).filter((file) => /\.(js|css)$/.test(file));
      const precache = [
        "/",
        "/index.html",
        "/manifest.webmanifest",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/icons/apple-touch-icon.png",
        ...assets.map((file) => `/${file}`),
      ];

      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: serviceWorker.replace("__PRECACHE_URLS__", JSON.stringify(precache)),
      });
    },
  };
}

export default defineConfig({
  plugins: [offlineAppShell()],
});
