import js from "@eslint/js";
import globals from "globals";
import airbnb from "eslint-config-airbnb";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    extends: [
      js.configs.recommended,
      airbnb,
      prettier, // disables conflicting rules
    ],
    rules: {
      "react/react-in-jsx-scope": "off", 
      "prettier/prettier": "error",
    },
  },
];
