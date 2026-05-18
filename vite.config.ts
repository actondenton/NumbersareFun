import { defineConfig } from "vite";

/**
 * Use a **relative** base so the same build works on:
 * - GitHub Pages project sites (`…github.io/REPO/`)
 * - root domains and `npm run preview`
 *
 * A root-only base (`/`) breaks on project Pages because `/assets/…` resolves to the
 * site root, not under `/REPO/`, so the game JS/CSS never load (blank page, no styles).
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "./",
  /**
   * Dev: listen on all interfaces and discourage caching so Chrome/Edge/Firefox outside Cursor
   * don’t keep an older broken `legacy-boot` chunk while the embedded browser picks up fresh modules.
   */
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  build: {
    rollupOptions: {
      output: {
        /** Split heavy slices so the default play path parses less JS at once; more chunks = more HTTP round trips on slow networks. */
        manualChunks(id) {
          if (id.includes("legacy-boot")) {
            return "game-legacy";
          }
          if (id.includes("n1-black-hole-boot")) {
            return "game-n1-black-hole";
          }
          if (id.includes("n1-ascension")) {
            return "game-n1-ascension";
          }
          if (id.includes("n2-boot-wiring")) {
            return "game-n2-boot";
          }
          if (id.includes("n1-save-offline")) {
            return "game-n1-save-offline";
          }
        },
      },
    },
  },
});
