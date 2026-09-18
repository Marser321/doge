import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals.map((item) => {
    if (item.plugins && item.plugins['react-hooks']) {
      return {
        ...item,
        rules: {
          ...item.rules,
          "react-hooks/set-state-in-effect": "warn",
          "react-hooks/preserve-manual-memoization": "warn",
        },
      };
    }
    return item;
  }),
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".gemini/**",
  ]),
  {
    // Legacy marketing screens are being migrated incrementally. Keep these
    // findings visible without blocking the backend/CRM release pipeline.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
