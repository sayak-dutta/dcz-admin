import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // React hooks exhaustive deps - warnings are acceptable for dynamic params
      "react-hooks/exhaustive-deps": "warn",
      // Allow unescaped entities - we use proper HTML entities where needed
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
