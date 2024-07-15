const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/*.ts"]
  },
  {
    ignores: [
      "node_modules/",
      "docs/",
      "coverage/",
      "dist/",
      "build/",
      "lib",
      "eslint.config.js",
      "jest.config.js",
      "babel.config.js",
      "karma.conf.js",
      "webpack.config.js"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-var-requires": "off"
    }
  }
);
