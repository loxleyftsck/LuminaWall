import js from "@eslint/js";
import hooks from "eslint-plugin-react-hooks";
import ts from "typescript-eslint";
import globals from "globals";
const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ["**/*.ts", "**/*.tsx"], plugins: { "react-hooks": hooks }, rules: { "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "error" } },
  { files: ["**/*.cjs", "windows-readlink-patch.js"], rules: { "@typescript-eslint/no-require-imports": "off" } },
];
export default config;
