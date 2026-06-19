import globals from "globals";

export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-unused-vars": ["warn", { args: "none" }],
      "no-undef": "error",
      eqeqeq: ["warn", "smart"],
      "no-var": "off",
      "prefer-const": "off"
    }
  }
];
