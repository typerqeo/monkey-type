import { resultHistoryChart } from "./account-charts";
import * as FirebaseFunctions from "./firebase-functions";
import { layouts } from "./layouts";
import * as Util from "./util";
import * as TypingTest from "./typing-test";

export const defaultConfig = {
  theme: "serika_dark",
  customTheme: false,
  customThemeColors: [
    "#323437",
    "#e2b714",
    "#e2b714",
    "#646669",
    "#d1d0c5",
    "#ca4754",
    "#7e2a33",
    "#ca4754",
    "#7e2a33",
  ],
  favThemes: [],
  showKeyTips: true,
  showLiveWpm: false,
  showTimerProgress: true,
  smoothCaret: true,
  quickTab: false,
  punctuation: false,
  numbers: false,
  words: 50,
  time: 30,
  mode: "time",
  quoteLength: 1,
  language: "english",
  fontSize: 15,
  freedomMode: false,
  resultFilters: null,
  difficulty: "normal",
  blindMode: false,
  quickEnd: false,
  // readAheadMode: false,
  caretStyle: "default",
  paceCaretStyle: "default",
  flipTestColors: false,
  capsLockBackspace: false,
  layout: "default",
  savedLayout: "default",
  confidenceMode: "off",
  indicateTypos: false,
  timerStyle: "text",
  colorfulMode: false,
  randomTheme: "off",
  timerColor: "black",
  timerOpacity: "0.25",
  stopOnError: "off",
  showAllLines: false,
  keymapMode: "off",
  keymapStyle: "staggered",
  keymapLayout: "qwerty",
  fontFamily: "Roboto_Mono",
  smoothLineScroll: false,
  alwaysShowDecimalPlaces: false,
  alwaysShowWordsHistory: false,
  singleListCommandLine: "manual",
  playSoundOnError: false,
  playSoundOnClick: "off",
  startGraphsAtZero: true,
  swapEscAndTab: false,
  showOutOfFocusWarning: true,
  paceCaret: "off",
  paceCaretCustomSpeed: 100,
  pageWidth: "100",
  chartAccuracy: true,
  chartStyle: "line",
  minWpm: "off",
  minWpmCustomSpeed: 100,
  highlightMode: "letter",
  alwaysShowCPM: false,
  enableAds: "off",
};

export let UserConfig = {
  cookieConfig: null,
  config: { ...defaultConfig },
  dbConfigLoaded: false,
  configChangedBeforeDb: false,
};

//cookies
export async function saveConfigToCookie(noDbCheck = false) {
  if (!UserConfig.dbConfigLoaded && !noDbCheck) {
    // console.log('config changed before db loaded!');
    UserConfig.configChangedBeforeDb = true;
  }
  // showNotification('saving to cookie',1000);
  let d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  $.cookie("config", null);
  $.cookie("config", JSON.stringify(UserConfig.config), {
    expires: d,
    path: "/",
  });
  TypingTest.Globals.restartCount = 0;
  if (!noDbCheck) saveConfigToDB();
}

async function saveConfigToDB() {
  if (firebase.auth().currentUser !== null) {
    // showNotification('saving to db',1000);
    Util.accountIconLoading(true);
    FirebaseFunctions.saveConfig({
      uid: firebase.auth().currentUser.uid,
      obj: UserConfig.config,
    }).then((d) => {
      // console.log(d.data);
      Util.accountIconLoading(false);
      if (d.data.returnCode === 1) {
        // showNotification('config saved to db',1000);
      } else {
        Util.showNotification(
          `Error saving config to DB! ${d.data.message}`,
          4000
        );
      }
    });
  }
}

export function resetConfig() {
  UserConfig.config = {
    ...defaultConfig,
  };
  applyConfig();
  saveConfigToCookie();
}

export function saveActiveTagsToCookie() {
  let tags = [];

  try {
    UserConfig.dbSnapshot.tags.forEach((tag) => {
      if (tag.active === true) {
        tags.push(tag.id);
      }
    });
    let d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    $.cookie("activeTags", null);
    $.cookie("activeTags", JSON.stringify(tags), {
      expires: d,
      path: "/",
    });
  } catch (e) {}
}

export function loadConfigFromCookie() {
  let newConfig = $.cookie("config");
  if (newConfig !== undefined) {
    newConfig = JSON.parse(newConfig);
    applyConfig(newConfig);
    UserConfig.cookieConfig = newConfig;
    saveConfigToCookie(true);
  }
}

export function applyConfig(configObj) {
  if (configObj && configObj != null && configObj != "null") {
    setTheme(configObj.theme, true);
    setCustomTheme(configObj.customTheme, true);
    setCustomThemeColors(configObj.customThemeColors, true);
    setQuickTabMode(configObj.quickTab, true);
    setKeyTips(configObj.showKeyTips, true);
    changeTimeConfig(configObj.time, true);
    changeQuoteLength(configObj.quoteLength, true);
    changeWordCount(configObj.words, true);
    changeLanguage(configObj.language, true);
    setCapsLockBackspace(configObj.capsLockBackspace, true);
    changeSavedLayout(configObj.savedLayout, true);
    changeFontSize(configObj.fontSize, true);
    setFreedomMode(configObj.freedomMode, true);
    setCaretStyle(configObj.caretStyle, true);
    setPaceCaretStyle(configObj.paceCaretStyle, true);
    setDifficulty(configObj.difficulty, true);
    setBlindMode(configObj.blindMode, true);
    setQuickEnd(configObj.quickEnd, true);
    // setReadAheadMode(configObj.readAheadMode, true);
    setFlipTestColors(configObj.flipTestColors, true);
    setColorfulMode(configObj.colorfulMode, true);
    setConfidenceMode(configObj.confidenceMode, true);
    setIndicateTypos(configObj.indicateTypos, true);
    setTimerStyle(configObj.timerStyle, true);
    setTimerColor(configObj.timerColor, true);
    setTimerOpacity(configObj.timerOpacity, true);
    changeKeymapMode(configObj.keymapMode, true);
    changeKeymapStyle(configObj.keymapStyle, true);
    changeKeymapLayout(configObj.keymapLayout, true);
    setFontFamily(configObj.fontFamily, true);
    setSmoothCaret(configObj.smoothCaret, true);
    setSmoothLineScroll(configObj.smoothLineScroll, true);
    setShowLiveWpm(configObj.showLiveWpm, true);
    setShowTimerProgress(configObj.showTimerProgress, true);
    setAlwaysShowDecimalPlaces(configObj.alwaysShowDecimalPlaces, true);
    setAlwaysShowWordsHistory(configObj.alwaysShowWordsHistory, true);
    setSingleListCommandLine(configObj.singleListCommandLine, true);
    setPlaySoundOnError(configObj.playSoundOnError, true);
    setPlaySoundOnClick(configObj.playSoundOnClick, true);
    setStopOnError(configObj.stopOnError, true);
    setFavThemes(configObj.favThemes, true);
    setRandomTheme(configObj.randomTheme, true);
    setShowAllLines(configObj.showAllLines, true);
    setSwapEscAndTab(configObj.swapEscAndTab, true);
    setShowOutOfFocusWarning(configObj.showOutOfFocusWarning, true);
    setPaceCaret(configObj.paceCaret, true);
    setPaceCaretCustomSpeed(configObj.paceCaretCustomSpeed, true);
    setPageWidth(configObj.pageWidth, true);
    setChartAccuracy(configObj.chartAccuracy, true);
    setChartStyle(configObj.chartStyle, true);
    setMinWpm(configObj.minWpm, true);
    setMinWpmCustomSpeed(configObj.minWpmCustomSpeed, true);
    setNumbers(configObj.numbers, true);
    setPunctuation(configObj.punctuation, true);
    setHighlightMode(configObj.highlightMode, true);
    setAlwaysShowCPM(configObj.alwaysShowCPM, true);
    changeMode(configObj.mode, true);
    UserConfig.config.startGraphsAtZero = configObj.startGraphsAtZero;
    // if (
    //   configObj.resultFilters !== null &&
    //   configObj.resultFilters !== undefined
    // ) {
    //   accountFilters = configObj.resultFilters;
    // }
    // config = configObj;

    try {
      setEnableAds(configObj.enableAds, true);
      if (configObj.enableAds === "on") {
        $("#ad1").removeClass("hidden");
        $("#ad1")
          .html(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <!-- Horizontal Ad -->
        <ins class="adsbygoogle"
             style="display:inline-block;width:850px;height:90px"
             data-ad-client="ca-pub-7261919841327810"
             data-ad-slot="2225821478"></ins>`);
        (adsbygoogle = window.adsbygoogle || []).push({});
      } else if (configObj.enableAds === "max") {
        $("#ad1").removeClass("hidden");
        $("#ad2").removeClass("hidden");
        $("#ad3").removeClass("hidden");
        $("#ad1").html(`<script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      ></script>
      <!-- Horizontal Ad -->
      <ins
        class="adsbygoogle"
        style="display: inline-block; width: 1000px; height: 90px"
        data-ad-client="ca-pub-7261919841327810"
        data-ad-slot="2225821478"
      ></ins>`);
        $("#ad2")
          .html(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <!-- Vertical 1 -->
        <ins class="adsbygoogle"
             style="display:inline-block;width:160px;height:600px"
             data-ad-client="ca-pub-7261919841327810"
             data-ad-slot="6376286644"></ins>`);
        $("#ad3")
          .html(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <!-- Vertical 2 -->
        <ins class="adsbygoogle"
             style="display:inline-block;width:160px;height:600px"
             data-ad-client="ca-pub-7261919841327810"
             data-ad-slot="1159796595"></ins>`);
        (adsbygoogle = window.adsbygoogle || []).push({});
        (adsbygoogle = window.adsbygoogle || []).push({});
        (adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        $("#ad1").remove();
        $("#ad2").remove();
        $("#ad3").remove();
      }
    } catch (e) {
      console.log("error initialising ads " + e.message);
      $("#ad1").remove();
      $("#ad2").remove();
      $("#ad3").remove();
    }
  }
  Object.keys(defaultConfig).forEach((configKey) => {
    if (UserConfig.config[configKey] == undefined) {
      UserConfig.config[configKey] = defaultConfig[configKey];
    }
  });
  updateTestModesNotice();
}

function loadActiveTagsFromCookie() {
  let newTags = $.cookie("activeTags");
  if (newTags !== undefined) {
    newTags = JSON.parse(newTags);
    newTags.forEach((ntag) => {
      toggleTag(ntag, true);
    });
    saveActiveTagsToCookie();
  }
}

export function setPlaySoundOnError(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  UserConfig.config.playSoundOnError = val;
  if (!nosave) saveConfigToCookie();
}

export function setPlaySoundOnClick(val, nosave) {
  if (val == undefined) {
    val = "off";
  }
  UserConfig.config.playSoundOnClick = val;
  if (clickSounds === null && UserConfig.config.playSoundOnClick !== "off")
    initClickSounds();
  if (!nosave) saveConfigToCookie();
}

export function togglePlaySoundOnError() {
  UserConfig.config.playSoundOnError = !UserConfig.config.playSoundOnError;
  if (UserConfig.config.playSoundOnError == undefined) {
    UserConfig.config.playSoundOnError = false;
  }
}

//difficulty
export function setDifficulty(diff, nosave) {
  if (
    (diff !== "normal" && diff !== "expert" && diff !== "master") ||
    diff == undefined
  ) {
    diff = "normal";
  }
  UserConfig.config.difficulty = diff;
  if (!nosave) restartTest(false, nosave);
  updateTestModesNotice();
  if (!nosave) saveConfigToCookie();
}

//set fav themes
function setFavThemes(themes, nosave) {
  UserConfig.config.favThemes = themes;
  if (!nosave) {
    refreshThemeButtons();
    saveConfigToCookie();
  }
}

//blind mode
export function toggleBlindMode() {
  let blind = !UserConfig.config.blindMode;
  if (blind == undefined) {
    blind = false;
  }
  UserConfig.config.blindMode = blind;
  updateTestModesNotice();
  saveConfigToCookie();
}

export function setBlindMode(blind, nosave) {
  if (blind == undefined) {
    blind = false;
  }
  UserConfig.config.blindMode = blind;
  updateTestModesNotice();
  if (!nosave) saveConfigToCookie();
}

function updateChartAccuracy() {
  resultHistoryChart.data.datasets[1].hidden = !UserConfig.config.chartAccuracy;
  resultHistoryChart.options.scales.yAxes[1].display =
    UserConfig.config.chartAccuracy;
  resultHistoryChart.update();
}

function updateChartStyle() {
  if (UserConfig.config.chartStyle == "scatter") {
    resultHistoryChart.data.datasets[0].showLine = false;
    resultHistoryChart.data.datasets[1].showLine = false;
  } else {
    resultHistoryChart.data.datasets[0].showLine = true;
    resultHistoryChart.data.datasets[1].showLine = true;
  }
  resultHistoryChart.update();
}

export function toggleChartAccuracy() {
  if (UserConfig.config.chartAccuracy) {
    UserConfig.config.chartAccuracy = false;
  } else {
    UserConfig.config.chartAccuracy = true;
  }
  updateChartAccuracy();
  saveConfigToCookie();
}

function setChartAccuracy(chartAccuracy, nosave) {
  if (chartAccuracy == undefined) {
    chartAccuracy = true;
  }
  UserConfig.config.chartAccuracy = chartAccuracy;
  updateChartAccuracy();
  if (!nosave) saveConfigToCookie();
}

export function toggleChartStyle() {
  if (UserConfig.config.chartStyle == "scatter") {
    UserConfig.config.chartStyle = "line";
  } else {
    UserConfig.config.chartStyle = "scatter";
  }
  updateChartStyle();
  saveConfigToCookie();
}

function setChartStyle(chartStyle, nosave) {
  if (chartStyle == undefined) {
    chartStyle = "line";
  }
  UserConfig.config.chartStyle = chartStyle;
  updateChartStyle();
  if (!nosave) saveConfigToCookie();
}

//read ahead mode
// function toggleReadAheadMode() {
//   config.readAheadMode = !config.readAheadMode;
//   applyReadAheadMode(config.readAheadMode);
//   updateTestModesNotice();
//   saveConfigToCookie();
// }

// function setReadAheadMode(readAhead, nosave) {
//   if (readAhead == undefined) {
//     readAhead = false;
//   }
//   config.readAheadMode = readAhead;
//   applyReadAheadMode(readAhead);
//   updateTestModesNotice();
//   if (!nosave) saveConfigToCookie();
// }

//stoponerror
// function toggleStopOnError() {
//   soe = !config.stopOnError;
//   if (soe == undefined) {
//     soe = false;
//   }
//   config.stopOnError = soe;
//   updateTestModesNotice();
//   saveConfigToCookie();
// }

export function setStopOnError(soe, nosave) {
  if (soe == undefined || soe === true || soe === false) {
    soe = "off";
  }
  UserConfig.config.stopOnError = soe;
  if (UserConfig.config.stopOnError !== "off") {
    UserConfig.config.confidenceMode = "off";
  }
  updateTestModesNotice();
  if (!nosave) saveConfigToCookie();
}

//alwaysshowdecimal
export function toggleAlwaysShowDecimalPlaces() {
  UserConfig.config.alwaysShowDecimalPlaces = !UserConfig.config
    .alwaysShowDecimalPlaces;
  saveConfigToCookie();
}

export function setAlwaysShowDecimalPlaces(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  UserConfig.config.alwaysShowDecimalPlaces = val;
  if (!nosave) saveConfigToCookie();
}

export function toggleAlwaysShowCPM() {
  UserConfig.config.alwaysShowCPM = !UserConfig.config.alwaysShowCPM;
  saveConfigToCookie();
}

export function setAlwaysShowCPM(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  UserConfig.config.alwaysShowCPM = val;
  if (!nosave) saveConfigToCookie();
}

//show out of focus warning
export function toggleShowOutOfFocusWarning() {
  UserConfig.config.showOutOfFocusWarning = !UserConfig.config
    .showOutOfFocusWarning;
  if (!UserConfig.config.showOutOfFocusWarning) {
    $("#words").css("transition", "none").removeClass("blurred");
    $(".outOfFocusWarning").addClass("hidden");
    clearTimeouts(outOfFocusTimeouts);
  }
  saveConfigToCookie();
}

export function setShowOutOfFocusWarning(val, nosave) {
  if (val == undefined) {
    val = true;
  }
  UserConfig.config.showOutOfFocusWarning = val;
  if (!UserConfig.config.showOutOfFocusWarning) {
    $("#words").css("transition", "none").removeClass("blurred");
    $(".outOfFocusWarning").addClass("hidden");
    clearTimeouts(outOfFocusTimeouts);
  }
  if (!nosave) saveConfigToCookie();
}

//swap esc and tab
export function toggleSwapEscAndTab() {
  UserConfig.config.swapEscAndTab = !UserConfig.config.swapEscAndTab;
  saveConfigToCookie();
  updateKeytips();
}

export function setSwapEscAndTab(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  UserConfig.config.swapEscAndTab = val;
  updateKeytips();
  if (!nosave) saveConfigToCookie();
}

//pace caret
export function setPaceCaret(val, nosave) {
  if (val == undefined) {
    val = "off";
  }
  UserConfig.config.paceCaret = val;
  updateTestModesNotice();
  initPaceCaret(nosave);
  if (!nosave) saveConfigToCookie();
}

export function setPaceCaretCustomSpeed(val, nosave) {
  if (val == undefined || Number.isNaN(parseInt(val))) {
    val = 100;
  }
  UserConfig.config.paceCaretCustomSpeed = val;
  if (!nosave) saveConfigToCookie();
}

//min wpm
export function setMinWpm(minwpm, nosave) {
  if (minwpm == undefined) {
    minwpm = "off";
  }
  UserConfig.config.minWpm = minwpm;
  updateTestModesNotice();
  if (!nosave) saveConfigToCookie();
}

export function setMinWpmCustomSpeed(val, nosave) {
  if (val == undefined || Number.isNaN(parseInt(val))) {
    val = 100;
  }
  UserConfig.config.minWpmCustomSpeed = val;
  if (!nosave) saveConfigToCookie();
}

//always show words history
export function setAlwaysShowWordsHistory(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  UserConfig.config.alwaysShowWordsHistory = val;
  if (!nosave) saveConfigToCookie();
}

//single list command line
export function setSingleListCommandLine(option, nosave) {
  if (!option) option = "manual";
  UserConfig.config.singleListCommandLine = option;
  if (!nosave) saveConfigToCookie();
}

//show all lines
export function toggleShowAllLines() {
  let sal = !UserConfig.config.showAllLines;
  if (sal == undefined) {
    sal = false;
  }
  UserConfig.config.showAllLines = sal;
  restartTest();
  saveConfigToCookie();
}

export function setShowAllLines(sal, nosave) {
  if (sal == undefined) {
    sal = false;
  }
  UserConfig.config.showAllLines = sal;
  if (!nosave) {
    saveConfigToCookie();
    restartTest();
  }
}

//quickend
export function toggleQuickEnd() {
  let qe = !UserConfig.config.quickEnd;
  if (qe == undefined) {
    qe = false;
  }
  UserConfig.config.quickEnd = qe;
  saveConfigToCookie();
}

export function setQuickEnd(qe, nosave) {
  if (qe == undefined) {
    qe = false;
  }
  UserConfig.config.quickEnd = qe;
  if (!nosave) saveConfigToCookie();
}

export function setEnableAds(val, nosave) {
  if (val == undefined || val === true || val === false) {
    val = "off";
  }
  UserConfig.config.enableAds = val;
  if (!nosave) saveConfigToCookie();
}

//flip colors
export function setFlipTestColors(flip, nosave) {
  if (flip == undefined) {
    flip = false;
  }
  UserConfig.config.flipTestColors = flip;
  flipTestColors(flip);
  if (!nosave) saveConfigToCookie();
}

export function toggleFlipTestColors() {
  UserConfig.config.flipTestColors = !UserConfig.config.flipTestColors;
  flipTestColors(UserConfig.config.flipTestColors);
  saveConfigToCookie();
}

//extra color
export function setColorfulMode(extra, nosave) {
  if (extra == undefined) {
    extra = false;
  }
  UserConfig.config.colorfulMode = extra;
  applyColorfulMode(extra);
  if (!nosave) saveConfigToCookie();
}

export function toggleColorfulMode() {
  UserConfig.config.colorfulMode = !UserConfig.config.colorfulMode;
  applyColorfulMode(UserConfig.config.colorfulMode);
  saveConfigToCookie();
}

export function setPageWidth(val, nosave) {
  if (val == null || val == undefined) {
    val = "100";
  }
  UserConfig.config.pageWidth = val;
  $("#centerContent").removeClass("wide125");
  $("#centerContent").removeClass("wide150");
  $("#centerContent").removeClass("wide200");
  $("#centerContent").removeClass("widemax");

  if (val !== "100") {
    $("#centerContent").addClass("wide" + val);
  }
  if (!nosave) saveConfigToCookie();
}

export function setCaretStyle(caretStyle, nosave) {
  if (caretStyle == null || caretStyle == undefined) {
    caretStyle = "default";
  }
  UserConfig.config.caretStyle = caretStyle;
  $("#caret").removeClass("off");
  $("#caret").removeClass("default");
  $("#caret").removeClass("underline");
  $("#caret").removeClass("outline");
  $("#caret").removeClass("block");

  if (caretStyle == "off") {
    $("#caret").addClass("off");
  } else if (caretStyle == "default") {
    $("#caret").addClass("default");
  } else if (caretStyle == "block") {
    $("#caret").addClass("block");
  } else if (caretStyle == "outline") {
    $("#caret").addClass("outline");
  } else if (caretStyle == "underline") {
    $("#caret").addClass("underline");
  }
  if (!nosave) saveConfigToCookie();
}

export function setPaceCaretStyle(caretStyle, nosave) {
  if (caretStyle == null || caretStyle == undefined) {
    caretStyle = "default";
  }
  UserConfig.config.paceCaretStyle = caretStyle;
  $("#paceCaret").removeClass("off");
  $("#paceCaret").removeClass("default");
  $("#paceCaret").removeClass("underline");
  $("#paceCaret").removeClass("outline");
  $("#paceCaret").removeClass("block");

  if (caretStyle == "off") {
    $("#paceCaret").addClass("off");
  } else if (caretStyle == "default") {
    $("#paceCaret").addClass("default");
  } else if (caretStyle == "block") {
    $("#paceCaret").addClass("block");
  } else if (caretStyle == "outline") {
    $("#paceCaret").addClass("outline");
  } else if (caretStyle == "underline") {
    $("#paceCaret").addClass("underline");
  }
  if (!nosave) saveConfigToCookie();
}

export function setShowTimerProgress(timer, nosave) {
  if (timer == null || timer == undefined) {
    timer = false;
  }
  UserConfig.config.showTimerProgress = timer;
  if (!nosave) saveConfigToCookie();
}

export function toggleShowTimerProgress() {
  UserConfig.config.showTimerProgress = !UserConfig.config.showTimerProgress;
  saveConfigToCookie();
}

export function setShowLiveWpm(live, nosave) {
  if (live == null || live == undefined) {
    live = false;
  }
  UserConfig.config.showLiveWpm = live;
  // if (config.keymapMode !== "off") {
  //   config.keymapMode = "off";
  // }
  if (!nosave) saveConfigToCookie();
}

export function toggleShowLiveWpm() {
  UserConfig.config.showLiveWpm = !UserConfig.config.showLiveWpm;
  // if (config.keymapMode !== "off") {
  //   config.keymapMode = "off";
  // }
  saveConfigToCookie();
}

export function setHighlightMode(mode, nosave) {
  if (mode == null || mode == undefined) {
    mode = "letter";
  }
  UserConfig.config.highlightMode = mode;
  if (!nosave) saveConfigToCookie();
}

export function setTimerStyle(style, nosave) {
  if (style == null || style == undefined) {
    style = "bar";
  }
  UserConfig.config.timerStyle = style;
  if (!nosave) saveConfigToCookie();
}

export function setTimerColor(color, nosave) {
  if (color == null || color == undefined) {
    color = "black";
  }
  UserConfig.config.timerColor = color;
  changeTimerColor(color);
  if (!nosave) saveConfigToCookie();
}
export function setTimerOpacity(opacity, nosave) {
  if (opacity == null || opacity == undefined) {
    opacity = 0.25;
  }
  UserConfig.config.timerOpacity = opacity;
  if (!nosave) saveConfigToCookie();
}

//key tips
export function setKeyTips(keyTips, nosave) {
  UserConfig.config.showKeyTips = keyTips;
  if (UserConfig.config.showKeyTips) {
    $("#bottom .keyTips").removeClass("hidden");
  } else {
    $("#bottom .keyTips").addClass("hidden");
  }
  if (!nosave) saveConfigToCookie();
}

export function toggleKeyTips() {
  UserConfig.config.showKeyTips = !UserConfig.config.showKeyTips;
  if (UserConfig.config.showKeyTips) {
    $("#bottom .keyTips").removeClass("hidden");
  } else {
    $("#bottom .keyTips").addClass("hidden");
  }
  saveConfigToCookie();
}

//mode
export function changeTimeConfig(time, nosave) {
  if (time !== null && !isNaN(time) && time >= 0) {
  } else {
    time = 15;
  }
  time = parseInt(time);
  changeMode("time", nosave);
  UserConfig.config.time = time;
  $("#top .config .time .text-button").removeClass("active");
  if (![15, 30, 60, 120].includes(time)) {
    time = "custom";
  }
  $("#top .config .time .text-button[timeConfig='" + time + "']").addClass(
    "active"
  );
  if (!nosave) saveConfigToCookie();
}

//quote length
export function changeQuoteLength(len, nosave) {
  if (len !== null && !isNaN(len) && len >= -1 && len <= 3) {
  } else {
    len = 1;
  }
  len = parseInt(len);
  if (!nosave) changeMode("quote", nosave);
  UserConfig.config.quoteLength = len;
  $("#top .config .quoteLength .text-button").removeClass("active");
  $(
    "#top .config .quoteLength .text-button[quoteLength='" + len + "']"
  ).addClass("active");
  if (!nosave) saveConfigToCookie();
}

export function changeWordCount(wordCount, nosave) {
  if (wordCount !== null && !isNaN(wordCount) && wordCount >= 0) {
  } else {
    wordCount = 10;
  }
  wordCount = parseInt(wordCount);
  changeMode("words", nosave);
  UserConfig.config.words = wordCount;
  $("#top .config .wordCount .text-button").removeClass("active");
  if (![10, 25, 50, 100, 200].includes(wordCount)) {
    wordCount = "custom";
  }
  $(
    "#top .config .wordCount .text-button[wordCount='" + wordCount + "']"
  ).addClass("active");
  if (!nosave) saveConfigToCookie();
}

//caret
export function setSmoothCaret(mode, nosave) {
  UserConfig.config.smoothCaret = mode;
  if (!nosave) saveConfigToCookie();
}

export function toggleSmoothCaret() {
  UserConfig.config.smoothCaret = !UserConfig.config.smoothCaret;
  saveConfigToCookie();
}

//startgraphsatzero
export function setStartGraphsAtZero(mode, nosave) {
  UserConfig.config.startGraphsAtZero = mode;
  if (!nosave) saveConfigToCookie();
}

// function toggleSmoothCaret() {
//   config.smoothCaret = !config.smoothCaret;
//   saveConfigToCookie();
// }

//linescroll
export function setSmoothLineScroll(mode, nosave) {
  UserConfig.config.smoothLineScroll = mode;
  if (!nosave) saveConfigToCookie();
}

export function toggleSmoothLineScroll() {
  UserConfig.config.smoothLineScroll = !UserConfig.config.smoothLineScroll;
  saveConfigToCookie();
}

//quick tab
export function setQuickTabMode(mode, nosave) {
  UserConfig.config.quickTab = mode;
  if (!UserConfig.config.quickTab) {
    // $(".pageTest").append('<div id="restartTestButton" class="" tabindex="0"><i class="fas fa-redo-alt"></i></div>');
    $("#restartTestButton").removeClass("hidden");
    $("#restartTestButton").css("opacity", 1);
    $("#bottom .keyTips")
      .html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
      <key>esc</key> - command line`);
  } else {
    // $("#restartTestButton").remove();
    $("#restartTestButton").addClass("hidden");
    $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
      <key>esc</key> - command line`);
  }
  if (!nosave) saveConfigToCookie();
}

export function toggleQuickTabMode() {
  UserConfig.config.quickTab = !UserConfig.config.quickTab;
  if (!UserConfig.config.quickTab) {
    // $(".pageTest").append('<div id="restartTestButton" class="" tabindex="0"><i class="fas fa-redo-alt"></i></div>');
    $("#restartTestButton").removeClass("hidden");
    $("#restartTestButton").css("opacity", 1);
    $("#bottom .keyTips")
      .html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
      <key>esc</key> - command line`);
  } else {
    // $("#restartTestButton").remove();
    $("#restartTestButton").addClass("hidden");
    $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
      <key>esc</key> - command line`);
  }
  saveConfigToCookie();
}

//numbers
function setNumbers(numb, nosave) {
  UserConfig.config.numbers = numb;
  if (!UserConfig.config.numbers) {
    $("#top .config .numbersMode .text-button").removeClass("active");
  } else {
    $("#top .config .numbersMode .text-button").addClass("active");
  }
  if (!nosave) saveConfigToCookie();
}

export function toggleNumbers() {
  if (UserConfig.config.numbers) {
    $("#top .config .numbersMode .text-button").removeClass("active");
  } else {
    $("#top .config .numbersMode .text-button").addClass("active");
  }
  UserConfig.config.numbers = !UserConfig.config.numbers;
  saveConfigToCookie();
}

//punctuation
function setPunctuation(punc, nosave) {
  UserConfig.config.punctuation = punc;
  if (!UserConfig.config.punctuation) {
    $("#top .config .punctuationMode .text-button").removeClass("active");
  } else {
    $("#top .config .punctuationMode .text-button").addClass("active");
  }
  if (!nosave) saveConfigToCookie();
}

export function togglePunctuation() {
  if (UserConfig.config.punctuation) {
    $("#top .config .punctuationMode .text-button").removeClass("active");
  } else {
    $("#top .config .punctuationMode .text-button").addClass("active");
  }
  UserConfig.config.punctuation = !UserConfig.config.punctuation;
  saveConfigToCookie();
}

export function previewFontFamily(font) {
  if (font == undefined) {
    font = "Roboto_Mono";
  }
  document.documentElement.style.setProperty("--font", font.replace(/_/g, " "));
  // if (!nosave) saveConfigToCookie();
}

//font family
export function setFontFamily(font, nosave) {
  if (font == undefined) {
    font = "Roboto_Mono";
  }
  UserConfig.config.fontFamily = font;
  document.documentElement.style.setProperty("--font", font.replace(/_/g, " "));
  if (!nosave) saveConfigToCookie();
}

//freedom
export function setFreedomMode(freedom, nosave) {
  if (freedom == null) {
    freedom = false;
  }
  UserConfig.config.freedomMode = freedom;
  if (
    UserConfig.config.freedomMode &&
    UserConfig.config.confidenceMode !== "off"
  ) {
    UserConfig.config.confidenceMode = "off";
  }
  if (!nosave) saveConfigToCookie();
}

export function toggleFreedomMode() {
  UserConfig.config.freedomMode = !UserConfig.config.freedomMode;
  if (
    UserConfig.config.freedomMode &&
    UserConfig.config.confidenceMode !== "off"
  ) {
    UserConfig.config.confidenceMode = false;
  }
  saveConfigToCookie();
}

export function setConfidenceMode(cm, nosave) {
  if (cm == undefined) {
    cm = "off";
  }
  UserConfig.config.confidenceMode = cm;
  if (UserConfig.config.confidenceMode !== "off") {
    UserConfig.config.freedomMode = false;
    UserConfig.config.stopOnError = "off";
  }

  updateTestModesNotice();
  if (!nosave) saveConfigToCookie();
}

export function toggleIndicateTypos() {
  let it = !UserConfig.config.indicateTypos;
  if (it == undefined) {
    it = false;
  }
  UserConfig.config.indicateTypos = it;
  saveConfigToCookie();
}

export function setIndicateTypos(it, nosave) {
  if (it == undefined) {
    it = false;
  }
  UserConfig.config.indicateTypos = it;
  if (!nosave) saveConfigToCookie();
}

export function previewTheme(name, setIsPreviewingVar = true) {
  if (
    (testActive || resultVisible) &&
    (UserConfig.config.theme === "nausea" ||
      UserConfig.config.theme === "round_round_baby")
  )
    return;
  if (resultVisible && (name === "nausea" || name === "round_round_baby"))
    return;
  isPreviewingTheme = setIsPreviewingVar;
  $("#currentTheme").attr("href", `themes/${name}.css`);
  setTimeout(() => {
    refreshThemeColorObject();
  }, 500);
}

export function setTheme(name, nosave) {
  if (
    (testActive || resultVisible) &&
    (UserConfig.config.theme === "nausea" ||
      UserConfig.config.theme === "round_round_baby")
  ) {
    return;
  }
  if (resultVisible && (name === "nausea" || name === "round_round_baby"))
    return;
  UserConfig.config.theme = name;
  $(".keymap-key").attr("style", "");
  $("#currentTheme").attr("href", `themes/${name}.css`);
  $(".current-theme").text(name.replace("_", " "));
  setTimeout(() => {
    updateFavicon(32, 14);
  }, 500);
  try {
    firebase.analytics().logEvent("changedTheme", {
      theme: name,
    });
  } catch (e) {
    console.log("Analytics unavailable");
  }
  setCustomTheme(false, true);
  applyCustomThemeColors();
  setTimeout(() => {
    $(".keymap-key").attr("style", "");
    refreshThemeColorObject();
    $("#metaThemeColor").attr("content", themeColors.main);
  }, 500);
  if (!nosave) saveConfigToCookie();
}

let randomTheme = null;
export function randomiseTheme() {
  var randomList = themesList.map((t) => {
    return t.name;
  });
  if (
    UserConfig.config.randomTheme === "fav" &&
    UserConfig.config.favThemes.length > 0
  )
    randomList = UserConfig.config.favThemes;
  randomTheme = randomList[Math.floor(Math.random() * randomList.length)];
  setTheme(randomTheme, true);
}

export function setRandomTheme(val, nosave) {
  if (val === undefined || val === true || val === false) {
    val = "off";
  }
  if (val === "off") {
    randomTheme = null;
  }
  UserConfig.config.randomTheme = val;
  if (!nosave) saveConfigToCookie();
}

// function toggleRandomTheme() {
//   config.randomTheme = !config.randomTheme;
//   saveConfigToCookie();
// }

export function setCustomTheme(boolean, nosave) {
  if (boolean !== undefined) UserConfig.config.customTheme = boolean;
  // setCustomThemeColors(config.customThemeColors, nosave);
  if (!nosave) saveConfigToCookie();
}

export function setCustomThemeColors(colors, nosave) {
  if (colors !== undefined) {
    UserConfig.config.customThemeColors = colors;
    applyCustomThemeColors();
  }
  if (!nosave) saveConfigToCookie();
}

export function applyCustomThemeColors() {
  const array = UserConfig.config.customThemeColors;

  if (UserConfig.config.customTheme === true) {
    $(".current-theme").text("custom");
    previewTheme("serika_dark");
    colorVars.forEach((e, index) => {
      document.documentElement.style.setProperty(e, array[index]);
    });
  } else {
    $(".current-theme").text(UserConfig.config.theme.replace("_", " "));
    previewTheme(UserConfig.config.theme);
    colorVars.forEach((e) => {
      document.documentElement.style.setProperty(e, "");
    });
  }
  setTimeout(() => {
    refreshThemeColorObject();
    updateFavicon(32, 14);
    $(".keymap-key").attr("style", "");
  }, 500);
}

export function togglePresetCustomTheme() {
  if (UserConfig.config.customTheme) {
    setCustomTheme(false);
    applyCustomThemeColors();
    // $('[tabContent="custom"]').removeClass("reveal");
    // $('[tabContent="preset"]').addClass("reveal");
    swapElements(
      $('.pageSettings [tabContent="custom"]'),
      $('.pageSettings [tabContent="preset"]'),
      250
    );
  } else {
    setCustomTheme(true);
    applyCustomThemeColors();
    swapElements(
      $('.pageSettings [tabContent="preset"]'),
      $('.pageSettings [tabContent="custom"]'),
      250
    );
    // $('[tabContent="preset"]').removeClass("reveal");
    // $('[tabContent="custom"]').addClass("reveal");
  }
  $(".keymap-key").attr("style", "");
}

function updateFavicon(size, curveSize) {
  let maincolor, bgcolor;

  bgcolor = getComputedStyle(document.body)
    .getPropertyValue("--bg-color")
    .replace(" ", "");
  maincolor = getComputedStyle(document.body)
    .getPropertyValue("--main-color")
    .replace(" ", "");

  if (bgcolor == maincolor) {
    bgcolor = "#111";
    maincolor = "#eee";
  }

  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(0, curveSize);
  //top left
  ctx.quadraticCurveTo(0, 0, curveSize, 0);
  ctx.lineTo(size - curveSize, 0);
  //top right
  ctx.quadraticCurveTo(size, 0, size, curveSize);
  ctx.lineTo(size, size - curveSize);
  ctx.quadraticCurveTo(size, size, size - curveSize, size);
  ctx.lineTo(curveSize, size);
  ctx.quadraticCurveTo(0, size, 0, size - curveSize);
  ctx.fillStyle = bgcolor;
  ctx.fill();
  ctx.font = "900 " + (size / 2) * 1.2 + "px Roboto Mono";
  ctx.textAlign = "center";
  ctx.fillStyle = maincolor;
  ctx.fillText("mt", size / 2 + size / 32, (size / 3) * 2.1);
  // document.body.appendChild(canvas);
  $("#favicon").attr("href", canvas.toDataURL("image/png"));
}

export function changeLanguage(language, nosave) {
  if (language == null || language == undefined) {
    language = "english";
  }
  UserConfig.config.language = language;
  try {
    firebase.analytics().logEvent("changedLanguage", {
      language: language,
    });
  } catch (e) {
    console.log("Analytics unavailable");
  }
  if (!nosave) saveConfigToCookie();
}

export function setCapsLockBackspace(capsLockBackspace, nosave) {
  if (capsLockBackspace === null || capsLockBackspace === undefined) {
    capsLockBackspace = false;
  }
  UserConfig.config.capsLockBackspace = capsLockBackspace;
  if (!nosave) saveConfigToCookie();
}

export function toggleCapsLockBackspace() {
  setCapsLockBackspace(!UserConfig.config.capsLockBackspace, false);
}

export function changeLayout(layout, nosave) {
  if (layout == null || layout == undefined) {
    layout = "qwerty";
  }
  UserConfig.config.layout = layout;
  updateTestModesNotice();
  if (!nosave) saveConfigToCookie();
}

export function changeSavedLayout(layout, nosave) {
  if (layout == null || layout == undefined) {
    layout = "qwerty";
  }
  UserConfig.config.savedLayout = layout;
  changeLayout(layout, nosave);
}

export function changeKeymapMode(mode, nosave) {
  if (mode == null || mode == undefined) {
    mode = "off";
  }
  if (mode === "react") {
    $(".active-key").removeClass("active-key");
  }
  if (mode === "next") {
    $(".keymap-key").attr("style", "");
  }
  UserConfig.config.keymapMode = mode;
  if (!nosave) restartTest(false, nosave);
  if (!nosave) saveConfigToCookie();
}

export function changeKeymapStyle(style, nosave) {
  $(".keymap").removeClass("matrix");
  $(".keymap").removeClass("split");
  $(".keymap").removeClass("split_matrix");

  if (style == null || style == undefined) {
    style = "staggered";
  }

  if (style === "matrix") {
    $(".keymap").addClass("matrix");
  } else if (style === "split") {
    $(".keymap").addClass("split");
  } else if (style === "split_matrix") {
    $(".keymap").addClass("split_matrix");
  }
  // if (style === "staggered") {
  //   $(".keymap .keymap-split-spacer").addClass("hidden");
  //   $(".keymap .r1, .r2, .r3, .r4").removeClass("matrix");
  //   $(".keymap .r5").removeClass("matrixSpace");
  //   $(".keymap #KeyLeftBracket").removeClass("hide-key");
  //   $(".keymap #KeyRightBracket").removeClass("hide-key");
  //   $(".keymap #KeyQuote").removeClass("hide-key");
  // }
  // if (style === "split") {
  //   $(".keymap .keymap-split-spacer").removeClass("hidden");
  //   $(".keymap .r1, .keymap .r2, .keymap .r3, .keymap .r4").removeClass(
  //     "matrix"
  //   );
  //   $(".keymap .r5").removeClass("splitSpace");
  //   $(".keymap #KeyLeftBracket").removeClass("hide-key");
  //   $(".keymap #KeyRightBracket").removeClass("hide-key");
  //   $(".keymap #KeyQuote").removeClass("hide-key");
  // }
  // if (style === "matrix") {
  //   $(".keymap .keymap-split-spacer").addClass("hidden");
  //   $(".keymap .r1, .keymap .r2, .keymap .r3, .keymap .r4").addClass("matrix");
  //   $(".keymap .r5").addClass("matrixSpace");
  //   $(".keymap #KeyLeftBracket").addClass("hide-key");
  //   $(".keymap #KeyRightBracket").addClass("hide-key");
  //   $(".keymap #KeyQuote").addClass("hide-key");
  // }
  UserConfig.config.keymapStyle = style;
  if (!nosave) saveConfigToCookie();
}

// function toggleISOKeymap() {
//   val = !config.isoKeymap;
//   if (val == undefined) {
//     val = false;
//   }
//   config.isoKeymap = val;
//   updateKeymapBottomRow();
//   saveConfigToCookie();
// }

// function setISOKeymap(val, nosave) {
//   if (val == undefined) {
//     val = false;
//   }
//   config.isoKeymap = val;
//   updateKeymapBottomRow();
//   if (!nosave) saveConfigToCookie();
// }

function keymapShowIsoKey(tf) {
  if (tf) {
    $(".keymap .r4 .keymap-key.first").removeClass("hidden-key");
  } else {
    $(".keymap .r4 .keymap-key.first").addClass("hidden-key");
  }
}

export function changeKeymapLayout(layout, nosave) {
  if (layout == null || layout == undefined) {
    layout = "qwerty";
  }
  UserConfig.config.keymapLayout = layout;
  if (!nosave) saveConfigToCookie();
  // layouts[layout].forEach((x) => {
  //   console.log(x);
  // });
  try {
    if (layouts[layout].keymapShowTopRow) {
      $(".keymap .r1").removeClass("hidden");
    } else {
      $(".keymap .r1").addClass("hidden");
    }

    $($(".keymap .r5 .keymap-key .letter")[0]).text(layout.replace(/_/g, " "));

    keymapShowIsoKey(layouts[layout].iso);

    var toReplace = layouts[layout].keys.slice(1, 48);
    // var _ = toReplace.splice(12, 1);
    var count = 0;

    $(".keymap .letter")
      .map(function () {
        // if (
        //   !this.parentElement.classList.contains("hidden-key") &&
        //   !this.classList.contains("hidden-key")
        // ) {

        if (count < toReplace.length) {
          var key = toReplace[count].charAt(0);
          this.innerHTML = key;

          switch (key) {
            case "\\":
            case "|":
              this.parentElement.id = "KeyBackslash";
              break;
            case "}":
            case "]":
              this.parentElement.id = "KeyRightBracket";
              break;
            case "{":
            case "[":
              this.parentElement.id = "KeyLeftBracket";
              break;
            case '"':
            case "'":
              this.parentElement.id = "KeyQuote";
              break;
            case ":":
            case ";":
              this.parentElement.id = "KeySemicolon";
              break;
            case "<":
            case ",":
              this.parentElement.id = "KeyComma";
              break;
            case ">":
            case ".":
              this.parentElement.id = "KeyPeriod";
              break;
            case "?":
            case "/":
              this.parentElement.id = "KeySlash";
              break;
            case "":
              this.parentElement.id = "KeySpace";
              break;
            default:
              this.parentElement.id = `Key${key.toUpperCase()}`;
          }
        }
        count++;
        // }
      })
      .get();
  } catch (e) {
    console.log(
      "something went wrong when changing layout, resettings: " + e.message
    );
    changeKeymapLayout("qwerty", true);
  }
  // console.log(all.join());
}

export function changeFontSize(fontSize, nosave) {
  if (fontSize == null || fontSize == undefined) {
    fontSize = 1;
  }
  // $("#words").stop(true, true).animate({ opacity: 0 }, 125, e => {
  UserConfig.config.fontSize = fontSize;
  $("#words").removeClass("size125");
  $("#caret, #paceCaret").removeClass("size125");
  $("#words").removeClass("size15");
  $("#caret, #paceCaret").removeClass("size15");
  $("#words").removeClass("size2");
  $("#caret, #paceCaret").removeClass("size2");
  $("#words").removeClass("size3");
  $("#caret, #paceCaret").removeClass("size3");

  $("#miniTimerAndLiveWpm").removeClass("size125");
  $("#miniTimerAndLiveWpm").removeClass("size15");
  $("#miniTimerAndLiveWpm").removeClass("size2");
  $("#miniTimerAndLiveWpm").removeClass("size3");

  if (fontSize == 125) {
    $("#words").addClass("size125");
    $("#caret, #paceCaret").addClass("size125");
    $("#miniTimerAndLiveWpm").addClass("size125");
  } else if (fontSize == 15) {
    $("#words").addClass("size15");
    $("#caret, #paceCaret").addClass("size15");
    $("#miniTimerAndLiveWpm").addClass("size15");
  } else if (fontSize == 2) {
    $("#words").addClass("size2");
    $("#caret, #paceCaret").addClass("size2");
    $("#miniTimerAndLiveWpm").addClass("size2");
  } else if (fontSize == 3) {
    $("#words").addClass("size3");
    $("#caret, #paceCaret").addClass("size3");
    $("#miniTimerAndLiveWpm").addClass("size3");
  }
  if (!nosave) saveConfigToCookie();
  // restartTest();
  // });
}
