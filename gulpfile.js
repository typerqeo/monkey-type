const { task, src, dest, series, watch } = require("gulp");
const concat = require("gulp-concat");
const del = require("del");
const vinylPaths = require("vinyl-paths");
const eslint = require("gulp-eslint");
var sass = require("gulp-sass");
sass.compiler = require("dart-sass");

//the order of files is important
const gulpSrc = [
  "./src/js/charts.js",
  "./src/js/util.js",
  "./src/js/firebase-functions.js",
  "./src/js/simple-popup.js",
  "./src/js/misc.js",
  "./src/js/words.js",
  "./src/js/layouts.js",
  "./src/js/db.js",
  "./src/js/userconfig.js",
  "./src/js/commandline.js",
  "./src/js/leaderboards.js",
  "./src/js/settings.js",
  "./src/js/account.js",
  "./src/js/script.js",
];

let eslintConfig = {
  parser: "babel-eslint",
  globals: [
    "jQuery",
    "$",
    "firebase",
    "moment",
    "html2canvas",
    "ClipboardItem",
    "Chart",
  ],
  envs: ["es6", "browser", "node"],
  rules: {
    "constructor-super": "error",
    "for-direction": "error",
    "getter-return": "error",
    "no-async-promise-executor": "error",
    "no-case-declarations": "error",
    "no-class-assign": "error",
    "no-compare-neg-zero": "error",
    "no-cond-assign": "error",
    "no-const-assign": "error",
    "no-constant-condition": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-delete-var": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-dupe-else-if": "warn",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "warn",
    "no-empty-character-class": "error",
    "no-empty-pattern": "error",
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "error",
    "no-extra-semi": "error",
    "no-fallthrough": "error",
    "no-func-assign": "error",
    "no-global-assign": "error",
    "no-import-assign": "error",
    "no-inner-declarations": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-misleading-character-class": "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-new-symbol": "error",
    "no-obj-calls": "error",
    "no-octal": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-self-assign": "error",
    "no-setter-return": "error",
    "no-shadow-restricted-names": "error",
    "no-sparse-arrays": "error",
    "no-this-before-super": "error",
    "no-undef": "error",
    "no-unexpected-multiline": "warn",
    "no-unreachable": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unused-labels": "error",
    "no-unused-vars": "warn",
    "no-use-before-define": "warn",
    "no-useless-catch": "error",
    "no-useless-escape": "error",
    "no-with": "error",
    "require-yield": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
  },
};

task("cat", function () {
  return src(gulpSrc)
    .pipe(concat("monkeytype.js"))
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(dest("./dist/js"));
});

task("sass", function () {
  return src("./src/sass/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(dest("dist/css"));
});

task("static", function () {
  return src("./public/**/*").pipe(dest("./dist/"));
});

task("clean", function () {
  return src("./dist/", { allowEmpty: true }).pipe(vinylPaths(del));
});

task("compile", series("static", "sass", "cat"));

task("watch", function () {
  watch(["./public/**/*", "./src/**/*"], series("compile"));
});

task("build", series("clean", "compile"));
