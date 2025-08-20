import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.node, // for backend
        ...globals.browser, // if needed
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      react: pluginReact,
      import: importPlugin,
    },
    extends: [
      js.configs.recommended,
      airbnb,
      prettier, // turn off rules that conflict with Prettier
    ],
    rules: {
      "prettier/prettier": "error", // enforce Prettier formatting
    },
  },
];