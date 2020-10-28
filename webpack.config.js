const path = require("path");
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");

module.exports = {
  entry: {},
  output: {
    path: path.resolve(__dirname, "public", "js"),
  },
  plugins: [
    new MergeIntoSingleFilePlugin({
      files: {
        "monkeytype.js": [
          "public/js/misc.js",
          "public/js/words.js",
          "public/js/layouts.js",
          "public/js/db.js",
          "public/js/userconfig.js",
          "public/js/commandline.js",
          "public/js/leaderboards.js",
          "public/js/settings.js",
          "public/js/account.js",
          "public/js/script.js",
        ],
      },
    }),
  ],
};
