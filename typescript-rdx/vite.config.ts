import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "tests/**/*"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "rdx-cli": resolve(__dirname, "src/rdx-cli.ts"),
      },
      name: "RDX",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: [
        "@noble/curves",
        "@noble/hashes",
        "better-sqlite3",
        "chalk",
        "commander",
        "secrets.js-grempe",
        "zod",
        "crypto",
      ],
      output: {
        preserveModules: false,
        exports: "named",
      },
    },
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "tests/"],
    },
  },
});
