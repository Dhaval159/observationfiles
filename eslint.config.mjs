import nextConfig from "eslint-config-next";
import nextTypescriptConfig from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**", "playwright-report/**"],
  },
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  prettierConfig,
];

export default config;
