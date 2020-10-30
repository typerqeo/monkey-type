const path = require("path");

module.exports = {
  entry: "./src/js/script.js",
  output: {
    filename: "monkeytype.js",
    path: path.resolve(__dirname, "public", "js"),
  },
  optimization: {
    minimize: false,
  },
};
