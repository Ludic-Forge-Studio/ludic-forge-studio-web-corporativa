import vue from "eslint-plugin-vue";
import ts from "typescript-eslint";
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...ts.configs.recommended,
  ...vue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
];
