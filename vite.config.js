import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: resolve(process.cwd(), "index.html"),
        website: resolve(process.cwd(), "site/index.html"),
        writing: resolve(process.cwd(), "writing.html"),
        betaWorkspace: resolve(process.cwd(), "beta/index.html"),
        betaQuestionnaire: resolve(process.cwd(), "beta/questionnaire.html"),
      },
    },
  },
});
