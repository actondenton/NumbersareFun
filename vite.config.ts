import { defineConfig } from "vite";

/**
 * GitHub Pages project site: set env when building, e.g.
 * `VITE_BASE_PATH=/NumbersareFun/ npm run build`
 * User/organization root site can use default `/`.
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
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
