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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("legacy-boot")) {
            return "game-legacy";
          }
        },
      },
    },
  },
});
