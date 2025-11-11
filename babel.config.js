module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
        modules: "auto",
      },
    ],
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
  ],
};
