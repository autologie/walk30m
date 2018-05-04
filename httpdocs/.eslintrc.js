module.exports = {
  extends: ["airbnb", "prettier"],
  plugins: ["import", "react", "jsx-a11y"],
  globals: {
    window: true,
    google: true
  },
  rules: {
    "no-alert": "off",
    "class-methods-use-this": "off",
    "prefer-const": "off", // TODO
    "func-names": "off",
    "one-var": "off",
    "prefer-destructuring": "off",
    camelcase: "off",
    "no-plusplus": "off",
    "no-underscore-dangle": "off",
    "no-restricted-properties": "off",
    "global-require": "off",
    "no-console": "off",
    "no-param-reassign": "off", // TODO
    "no-nested-ternary": "off",
    "no-cond-assign": "off" // TODO
  }
};
