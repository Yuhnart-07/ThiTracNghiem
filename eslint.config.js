module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "public/admin/assets/js/account.js",
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        document: "readonly",
        fetch: "readonly",
        alert: "readonly",
        clearInterval: "readonly",
        confirm: "readonly",
        JustValidate: "readonly",
        Notyf: "readonly",
        pathAdmin: "readonly",
        setInterval: "readonly",
        sessionStorage: "readonly",
        window: "readonly",
        tinymce: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",
    },
  },
];
