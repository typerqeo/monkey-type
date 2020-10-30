const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./src/js/script.js",
  output: {
    filename: "monkeytype.js",
    path: path.resolve(__dirname, "public", "js"),
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new ESLintPlugin({
      context: "./src",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
};
