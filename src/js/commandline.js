import * as ClickSound from "./click-sound";
import { UserData } from "./db";
import { layouts } from "./layouts";
import * as Misc from "./misc";
import * as Util from "./util";
import * as Settings from "./settings";
import * as TypingTest from "./typing-test";
import * as Config from "./userconfig";
const defaultConfig = Config.defaultConfig;
const UserConfig = Config.UserConfig;

function addChildCommands(
  unifiedCommands,
  commandItem,
  parentCommandDisplay = ""
) {
  let commandItemDisplay = commandItem.display.replace(/\s?\.\.\.$/g, "");
  if (parentCommandDisplay)
    commandItemDisplay = parentCommandDisplay + " > " + commandItemDisplay;
  if (commandItem.subgroup) {
    try {
      commandItem.exec();
      const currentCommandsIndex = currentCommands.length - 1;
      currentCommands[currentCommandsIndex].list.forEach((cmd) =>
        addChildCommands(unifiedCommands, cmd, commandItemDisplay)
      );
      currentCommands.pop();
    } catch (e) {}
  } else {
    let tempCommandItem = { ...commandItem };
    if (parentCommandDisplay) tempCommandItem.display = commandItemDisplay;
    unifiedCommands.push(tempCommandItem);
  }
}

function generateSingleListOfCommands() {
  const allCommands = [];
  const oldShowCommandLine = showCommandLine;
  showCommandLine = () => {};
  commands.list.forEach((c) => addChildCommands(allCommands, c));
  showCommandLine = oldShowCommandLine;
  return {
    title: "All Commands",
    list: allCommands,
  };
}

function isSingleListCommandLineActive() {
  return $("#commandLine").hasClass("allCommands");
}

function useSingleListCommandLine(show = true) {
  let allCommands = generateSingleListOfCommands();
  if (UserConfig.config.singleListCommandLine == "manual")
    currentCommands.push(allCommands);
  else if (UserConfig.config.singleListCommandLine == "on")
    currentCommands = [allCommands];

  if (UserConfig.config.singleListCommandLine != "off")
    $("#commandLine").addClass("allCommands");
  if (show) showCommandLine();
}

function restoreOldCommandLine(show = true) {
  if (isSingleListCommandLineActive()) {
    $("#commandLine").removeClass("allCommands");
    currentCommands = currentCommands.filter((l) => l.title != "All Commands");
    if (currentCommands.length < 1) currentCommands = [commands];
  }
  if (show) showCommandLine();
}

let commands = {
  title: "",
  list: [
    {
      id: "togglePunctuation",
      display: "Toggle punctuation",
      exec: () => {
        Config.togglePunctuation();
        restartTest();
      },
    },
    {
      id: "changeMode",
      display: "Change mode...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsMode);
        showCommandLine();
      },
    },
    {
      id: "changeTimeConfig",
      display: "Change time config...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsTimeConfig);
        showCommandLine();
      },
    },
    {
      id: "changeWordCount",
      display: "Change word count...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsWordCount);
        showCommandLine();
      },
    },
    {
      id: "changeQuoteLength",
      display: "Change quote length...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsQuoteLengthConfig);
        showCommandLine();
      },
    },
    {
      visible: false,
      id: "changeTags",
      display: "Change tags...",
      subgroup: true,
      exec: () => {
        updateCommandsTagsList();
        currentCommands.push(commandsTags);
        showCommandLine();
      },
    },
    {
      id: "changeConfidenceMode",
      display: "Change confidence mode...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsConfidenceMode);
        showCommandLine();
      },
    },
    {
      id: "changeStopOnError",
      display: "Change stop on error...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsStopOnError);
        showCommandLine();
      },
    },
    {
      id: "changeSoundOnClick",
      display: "Change sound on click...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsSoundOnClick);
        showCommandLine();
      },
    },
    {
      id: "toggleNumbers",
      display: "Toggle numbers",
      exec: () => {
        Config.toggleNumbers();
        restartTest();
      },
    },
    {
      id: "toggleSmoothCaret",
      display: "Toggle smooth caret",
      exec: () => {
        Config.toggleSmoothCaret();
      },
    },
    {
      id: "toggleQuickTab",
      display: "Toggle quick tab mode",
      exec: () => {
        Config.toggleQuickTabMode();
      },
    },
    {
      id: "toggleShowLiveWpm",
      display: "Toggle live wpm display",
      exec: () => {
        Config.toggleShowLiveWpm();
        Config.saveConfigToCookie();
      },
    },
    {
      id: "toggleTimerBar",
      display: "Toggle timer display",
      exec: () => {
        Config.toggleShowTimerProgress();
        Config.saveConfigToCookie();
      },
    },
    {
      id: "toggleKeyTips",
      display: "Toggle keybind tips",
      exec: () => {
        Config.toggleKeyTips();
      },
    },
    {
      id: "toggleFreedom",
      display: "Toggle freedom mode",
      exec: () => {
        Config.toggleFreedomMode();
      },
    },
    {
      id: "toggleBlindMode",
      display: "Toggle blind mode",
      exec: () => {
        Config.toggleBlindMode();
      },
    },
    {
      id: "toggleIndicateTypos",
      display: "Toggle indicate typos",
      exec: () => {
        Config.toggleIndicateTypos();
      },
    },
    // {
    //   id: "toggleReadAheadMode",
    //   display: "Toggle read ahead mode",
    //   exec: () => {
    //     toggleReadAheadMode();
    //   },
    // },
    {
      id: "toggleQuickEnd",
      display: "Toggle quick end",
      exec: () => {
        Config.toggleQuickEnd();
      },
    },
    {
      id: "singleListCommandLine",
      display: "Single list command line...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsSingleListCommandLine);
        showCommandLine();
      },
    },
    {
      id: "changePaceCaret",
      display: "Change min wpm mode...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsMinWpm);
        showCommandLine();
      },
    },
    {
      id: "togglePlaySoundOnError",
      display: "Toggle play sound on error",
      exec: () => {
        Config.togglePlaySoundOnError();
      },
    },
    {
      id: "toggleFlipTestColors",
      display: "Toggle flip test colors",
      exec: () => {
        Config.toggleFlipTestColors();
      },
    },
    {
      id: "toggleSmoothLineScroll",
      display: "Toggle smooth line scroll",
      exec: () => {
        Config.toggleSmoothLineScroll();
      },
    },
    {
      id: "toggleAlwaysShowDecimalPlaces",
      display: "Toggle always show decimal places",
      exec: () => {
        Config.toggleAlwaysShowDecimalPlaces();
      },
    },
    {
      id: "toggleAlwaysShowCPM",
      display: "Toggle always show CPM",
      exec: () => {
        Config.toggleAlwaysShowCPM();
      },
    },
    {
      id: "toggleSwapEscAndTab",
      display: "Toggle swap esc and tab",
      exec: () => {
        Config.toggleSwapEscAndTab();
      },
    },
    {
      id: "toggleShowAllLines",
      display: "Toggle show all lines",
      exec: () => {
        Config.toggleShowAllLines();
      },
    },
    {
      id: "toggleColorfulMode",
      display: "Toggle colorful mode",
      exec: () => {
        Config.toggleColorfulMode();
      },
    },
    {
      id: "toggleShowOutOfFocusWarning",
      display: "Toggle out of focus warning",
      exec: () => {
        Config.toggleShowOutOfFocusWarning();
      },
    },
    {
      id: "togglePresetCustomTheme",
      display: "Toggle preset/custom theme",
      exec: () => {
        Config.togglePresetCustomTheme();
      },
    },
    {
      id: "changeDifficulty",
      display: "Change difficulty...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsDifficulty);
        showCommandLine();
      },
    },
    {
      id: "changeCaretStyle",
      display: "Change caret style...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsCaretStyle);
        showCommandLine();
      },
    },
    {
      id: "changePaceCaret",
      display: "Change pace caret mode...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsPaceCaret);
        showCommandLine();
      },
    },
    {
      id: "changePaceCaretStyle",
      display: "Change pace caret style...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsPaceCaretStyle);
        showCommandLine();
      },
    },
    {
      id: "changeTimerStyle",
      display: "Change timer/progress style...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsTimerStyle);
        showCommandLine();
      },
    },
    {
      id: "changeTimerColor",
      display: "Change timer/progress color...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsTimerColor);
        showCommandLine();
      },
    },
    {
      id: "changeTimerOpacity",
      display: "Change timer/progress opacity...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsTimerOpacity);
        showCommandLine();
      },
    },
    {
      id: "changeHighlightMode",
      display: "Change highlight mode...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsHighlightMode);
        showCommandLine();
      },
    },
    {
      id: "changeTheme",
      display: "Change theme...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsThemes);
        showCommandLine();
      },
    },
    {
      id: "changeRandomTheme",
      display: "Change random theme...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsRandomTheme);
        showCommandLine();
      },
    },
    {
      id: "changeLanguage",
      display: "Change language...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsLanguages);
        showCommandLine();
      },
    },
    {
      id: "changeFunbox",
      display: "Change funbox...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsFunbox);
        showCommandLine();
      },
    },
    {
      id: "toggleCapsLockBackspace",
      display: "Toggle caps lock backspace",
      exec: () => {
        Config.toggleCapsLockBackspace();
      },
    },
    {
      id: "changeLayout",
      display: "Change layout...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsLayouts);
        showCommandLine();
      },
    },
    {
      id: "toggleKeymap",
      display: "Change keymap mode...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsKeymapMode);
        showCommandLine();
      },
    },
    {
      id: "changeKeymapStyle",
      display: "Change keymap style...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsKeymapStyle);
        showCommandLine();
      },
    },
    {
      id: "changeKeymapLayout",
      display: "Change keymap layout...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsKeymapLayouts);
        showCommandLine();
      },
    },
    {
      id: "changeFontSize",
      display: "Change font size...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsFontSize);
        showCommandLine();
      },
    },
    {
      id: "changeFontFamily",
      display: "Change font family...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsFonts);
        showCommandLine();
      },
    },
    {
      id: "changePageWidth",
      display: "Change page width...",
      subgroup: true,
      exec: () => {
        currentCommands.push(commandsPageWidth);
        showCommandLine();
      },
    },
    {
      id: "randomiseTheme",
      display: "Next random theme",
      exec: () => Config.randomiseTheme(),
    },
    {
      id: "viewTypingPage",
      display: "View Typing Page",
      exec: () => $("#top #menu .icon-button.view-start").click(),
    },
    {
      id: "viewLeaderboards",
      display: "View Leaderboards Page",
      exec: () => $("#top #menu .icon-button.view-leaderboards").click(),
    },
    {
      id: "viewAbout",
      display: "View About Page",
      exec: () => $("#top #menu .icon-button.view-about").click(),
    },
    {
      id: "viewSettings",
      display: "View Settings Page",
      exec: () => $("#top #menu .icon-button.view-settings").click(),
    },
    {
      id: "viewAccount",
      display: "View Account Page",
      exec: () =>
        $("#top #menu .icon-button.view-account").hasClass("hidden")
          ? $("#top #menu .icon-button.view-login").click()
          : $("#top #menu .icon-button.view-account").click(),
    },
    {
      id: "toggleFullscreen",
      display: "Toggle Fullscreen",
      exec: () => {
        Misc.toggleFullscreen();
      },
    },
    {
      id: "bailOut",
      display: "Bail out...",
      subgroup: true,
      visible: false,
      exec: () => {
        currentCommands.push({
          title: "Are you sure...",
          list: [
            {
              id: "bailOutNo",
              display: "Nevermind",
              exec: () => {
                hideCommandLine();
              },
            },
            {
              id: "bailOutForSure",
              display: "Yes, I am sure",
              exec: () => {
                if (
                  (UserConfig.config.mode === "custom" &&
                    TypingTest.Globals.customTextIsRandom &&
                    TypingTest.Globals.customTextWordCount >= 5000) ||
                  (UserConfig.config.mode === "custom" &&
                    !TypingTest.Globals.customTextIsRandom &&
                    TypingTest.Globals.customText.length >= 5000) ||
                  (UserConfig.config.mode === "words" &&
                    UserConfig.config.words >= 5000) ||
                  UserConfig.config.words === 0 ||
                  (UserConfig.config.mode === "time" &&
                    (UserConfig.config.time >= 3600 ||
                      UserConfig.config.time === 0))
                ) {
                  TypingTest.Globals.bailout = true;
                  showResult();
                } else {
                  Util.showNotification(
                    "You can only bailout out of test longer than 3600 seconds / 5000 words.",
                    5000
                  );
                }
              },
            },
          ],
        });
        showCommandLine();
      },
    },
    {
      id: "joinDiscord",
      display: "Join the Discord server",
      exec: () => {
        window.open("https://discord.gg/monkeytype");
      },
    },
  ],
};

let commandsPageWidth = {
  title: "Change page width...",
  list: [
    {
      id: "setPageWidth100",
      display: "100",
      exec: () => {
        Config.setPageWidth("100");
      },
    },
    {
      id: "setPageWidth125",
      display: "125",
      exec: () => {
        Config.setPageWidth("125");
      },
    },
    {
      id: "setPageWidth150",
      display: "150",
      exec: () => {
        Config.setPageWidth("150");
      },
    },
    {
      id: "setPageWidth200",
      display: "200",
      exec: () => {
        Config.setPageWidth("200");
      },
    },
    {
      id: "setPageWidthMax",
      display: "max",
      exec: () => {
        Config.setPageWidth("max");
      },
    },
  ],
};

let commandsKeymapMode = {
  title: "Change keymap mode...",
  list: [
    {
      id: "setKeymapModeOff",
      display: "off",
      exec: () => {
        Config.changeKeymapMode("off");
      },
    },
    {
      id: "setKeymapModeNext",
      display: "next",
      exec: () => {
        Config.changeKeymapMode("next");
      },
    },
    {
      id: "setKeymapModeReact",
      display: "react",
      exec: () => {
        Config.changeKeymapMode("react");
      },
    },
  ],
};

let commandsSoundOnClick = {
  title: "Change sound on click...",
  list: [
    {
      id: "setSoundOnClickOff",
      display: "off",
      exec: () => {
        Config.setPlaySoundOnClick("off");
      },
    },
    {
      id: "setSoundOnClick1",
      display: "1",
      exec: () => {
        Config.setPlaySoundOnClick("1");
        ClickSound.playClickSound(UserConfig.config);
      },
    },
    {
      id: "setSoundOnClick2",
      display: "2",
      exec: () => {
        Config.setPlaySoundOnClick("2");
        ClickSound.playClickSound(UserConfig.config);
      },
    },
    {
      id: "setSoundOnClick3",
      display: "3",
      exec: () => {
        Config.setPlaySoundOnClick("3");
        ClickSound.playClickSound(UserConfig.config);
      },
    },
    {
      id: "setSoundOnClick4",
      display: "4",
      exec: () => {
        Config.setPlaySoundOnClick("4");
        ClickSound.playClickSound(UserConfig.config);
      },
    },
  ],
};

let commandsRandomTheme = {
  title: "Change random theme...",
  list: [
    {
      id: "setRandomOff",
      display: "off",
      exec: () => {
        Config.setRandomTheme("off");
      },
    },
    {
      id: "setRandomOn",
      display: "on",
      exec: () => {
        Config.setRandomTheme("on");
      },
    },
    {
      id: "setRandomFav",
      display: "fav",
      exec: () => {
        Config.setRandomTheme("fav");
      },
    },
  ],
};

let commandsDifficulty = {
  title: "Change difficulty...",
  list: [
    {
      id: "setDifficultyNormal",
      display: "Normal",
      exec: () => {
        Config.setDifficulty("normal");
      },
    },
    {
      id: "setDifficultyExpert",
      display: "Expert",
      exec: () => {
        Config.setDifficulty("expert");
      },
    },
    {
      id: "setDifficultyMaster",
      display: "Master",
      exec: () => {
        Config.setDifficulty("master");
      },
    },
  ],
};

let commandsCaretStyle = {
  title: "Change caret style...",
  list: [
    {
      id: "setCaretStyleOff",
      display: "off",
      exec: () => {
        Config.setCaretStyle("off");
      },
    },
    {
      id: "setCaretStyleDefault",
      display: "line",
      exec: () => {
        Config.setCaretStyle("default");
      },
    },
    {
      id: "setCaretStyleBlock",
      display: "block",
      exec: () => {
        Config.setCaretStyle("block");
      },
    },
    {
      id: "setCaretStyleOutline",
      display: "outline-block",
      exec: () => {
        Config.setCaretStyle("outline");
      },
    },
    {
      id: "setCaretStyleUnderline",
      display: "underline",
      exec: () => {
        Config.setCaretStyle("underline");
      },
    },
  ],
};

let commandsPaceCaretStyle = {
  title: "Change pace caret style...",
  list: [
    {
      id: "setPaceCaretStyleOff",
      display: "off",
      exec: () => {
        Config.setPaceCaretStyle("off");
      },
    },
    {
      id: "setPaceCaretStyleDefault",
      display: "line",
      exec: () => {
        Config.setPaceCaretStyle("default");
      },
    },
    {
      id: "setPaceCaretStyleBlock",
      display: "block",
      exec: () => {
        Config.setPaceCaretStyle("block");
      },
    },
    {
      id: "setPaceCaretStyleOutline",
      display: "outline-block",
      exec: () => {
        Config.setPaceCaretStyle("outline");
      },
    },
    {
      id: "setPaceCaretStyleUnderline",
      display: "underline",
      exec: () => {
        Config.setPaceCaretStyle("underline");
      },
    },
  ],
};

let commandsPaceCaret = {
  title: "Change pace caret mode...",
  list: [
    {
      id: "setPaceCaretOff",
      display: "off",
      exec: () => {
        Config.setPaceCaret("off");
      },
    },
    {
      id: "setPaceCaretPb",
      display: "pb",
      exec: () => {
        Config.setPaceCaret("pb");
      },
    },
    {
      id: "setPaceCaretCustom",
      display: "custom...",
      input: true,
      exec: (input) => {
        Config.setPaceCaretCustomSpeed(input);
        Config.setPaceCaret("custom");
      },
    },
    // {
    //   id: "setPaceCaretCustomSpeed",
    //   display: "Set custom speed...",
    //   input: true,
    //   exec: (input) => {
    //     console.log(input);
    //   },
    // },
  ],
};

let commandsMinWpm = {
  title: "Change min wpm mode...",
  list: [
    {
      id: "setMinWpmOff",
      display: "off",
      exec: () => {
        Config.setMinWpm("off");
      },
    },
    {
      id: "setMinWpmCustom",
      display: "custom...",
      input: true,
      exec: (input) => {
        Config.setMinWpmCustomSpeed(input);
        Config.setMinWpm("custom");
      },
    },
    // {
    //   id: "setPaceCaretCustomSpeed",
    //   display: "Set custom speed...",
    //   input: true,
    //   exec: (input) => {
    //     console.log(input);
    //   },
    // },
  ],
};

let commandsKeymapStyle = {
  title: "Change keymap style...",
  list: [
    {
      id: "setKeymapStyleStaggered",
      display: "staggered",
      exec: () => {
        Config.changeKeymapStyle("staggered");
      },
    },
    {
      id: "setKeymapStyleMatrix",
      display: "matrix",
      exec: () => {
        Config.changeKeymapStyle("matrix");
      },
    },
    {
      id: "setKeymapStyleSplit",
      display: "split",
      exec: () => {
        Config.changeKeymapStyle("split");
      },
    },
    {
      id: "setKeymapStyleSplitMatrix",
      display: "split matrix",
      exec: () => {
        Config.changeKeymapStyle("split_matrix");
      },
    },
  ],
};

let commandsHighlightMode = {
  title: "Change highlight mode...",
  list: [
    {
      id: "setHighlightModeLetter",
      display: "letter",
      exec: () => {
        Config.setHighlightMode("letter");
      },
    },
    {
      id: "setHighlightModeWord",
      display: "word",
      exec: () => {
        Config.setHighlightMode("word");
      },
    },
  ],
};

let commandsAlwaysShowCPM = {
  title: "Toggle always show cpm...",
  list: [
    {
      id: "setAlwaysShowCPMTrue",
      display: true,
      exec: () => {
        Config.setAlwaysShowCPM(true);
      },
    },
    {
      id: "setAlwaysShowCPMFalse",
      display: false,
      exec: () => {
        Config.setHighlightMode(false);
      },
    },
  ],
};

let commandsTimerStyle = {
  title: "Change timer/progress style...",
  list: [
    {
      id: "setTimerStyleBar",
      display: "bar",
      exec: () => {
        Config.setTimerStyle("bar");
      },
    },
    {
      id: "setTimerStyleText",
      display: "text",
      exec: () => {
        Config.setTimerStyle("text");
      },
    },
    {
      id: "setTimerStyleMini",
      display: "mini",
      exec: () => {
        Config.setTimerStyle("mini");
      },
    },
  ],
};

let commandsTimerColor = {
  title: "Change timer/progress color...",
  list: [
    {
      id: "setTimerColorBlack",
      display: "black",
      exec: () => {
        Config.setTimerColor("bar");
      },
    },
    {
      id: "setTimerColorSub",
      display: "sub",
      exec: () => {
        Config.setTimerColor("sub");
      },
    },
    {
      id: "setTimerColorText",
      display: "text",
      exec: () => {
        Config.setTimerColor("text");
      },
    },
    {
      id: "setTimerColorMain",
      display: "main",
      exec: () => {
        Config.setTimerColor("main");
      },
    },
  ],
};

let commandsSingleListCommandLine = {
  title: "Single list command line...",
  list: [
    {
      id: "singleListCommandLineManual",
      display: "manual",
      exec: () => {
        Config.setSingleListCommandLine("manual");
      },
    },
    {
      id: "singleListCommandLineOn",
      display: "on",
      exec: () => {
        Config.setSingleListCommandLine("on");
      },
    },
  ],
};

let commandsTimerOpacity = {
  title: "Change timer opacity...",
  list: [
    {
      id: "setTimerOpacity.25",
      display: ".25",
      exec: () => {
        Config.setTimerOpacity(0.25);
      },
    },
    {
      id: "setTimerOpacity.5",
      display: ".5",
      exec: () => {
        Config.setTimerOpacity(0.5);
      },
    },
    {
      id: "setTimerOpacity.75",
      display: ".75",
      exec: () => {
        Config.setTimerOpacity(0.75);
      },
    },
    {
      id: "setTimerOpacity1",
      display: "1",
      exec: () => {
        Config.setTimerOpacity(1);
      },
    },
  ],
};

let commandsWordCount = {
  title: "Change word count...",
  list: [
    {
      id: "changeWordCount10",
      display: "10",
      exec: () => {
        Config.changeWordCount("10");
        restartTest();
      },
    },
    {
      id: "changeWordCount25",
      display: "25",
      exec: () => {
        Config.changeWordCount("25");
        restartTest();
      },
    },
    {
      id: "changeWordCount50",
      display: "50",
      exec: () => {
        Config.changeWordCount("50");
        restartTest();
      },
    },
    {
      id: "changeWordCount100",
      display: "100",
      exec: () => {
        Config.changeWordCount("100");
        restartTest();
      },
    },
    {
      id: "changeWordCount200",
      display: "200",
      exec: () => {
        Config.changeWordCount("200");
        restartTest();
      },
    },
    {
      id: "changeWordCountCustom",
      display: "custom...",
      input: true,
      exec: (input) => {
        Config.changeWordCount(input);
        restartTest();
      },
    },
  ],
};

let commandsQuoteLengthConfig = {
  title: "Change quote length...",
  list: [
    {
      id: "changeQuoteLengthAll",
      display: "all",
      exec: () => {
        Config.changeQuoteLength(-1);
        restartTest();
      },
    },
    {
      id: "changeQuoteLengthShort",
      display: "short",
      exec: () => {
        Config.changeQuoteLength(0);
        restartTest();
      },
    },
    {
      id: "changeQuoteLengthMedium",
      display: "medium",
      exec: () => {
        Config.changeQuoteLength(1);
        restartTest();
      },
    },
    {
      id: "changeQuoteLengthLong",
      display: "long",
      exec: () => {
        Config.changeQuoteLength(2);
        restartTest();
      },
    },
    {
      id: "changeQuoteLengthThicc",
      display: "thicc",
      exec: () => {
        Config.changeQuoteLength(3);
        restartTest();
      },
    },
  ],
};

let commandsMode = {
  title: "Change mode...",
  list: [
    {
      id: "changeModeTime",
      display: "time",
      exec: () => {
        changeMode("time");
        restartTest();
      },
    },
    {
      id: "changeModeWords",
      display: "words",
      exec: () => {
        changeMode("words");
        restartTest();
      },
    },
    {
      id: "changeModeQuote",
      display: "quote",
      exec: () => {
        changeMode("quote");
        restartTest();
      },
    },
    {
      id: "changeModeCustom",
      display: "custom",
      exec: () => {
        changeMode("custom");
        restartTest();
      },
    },
  ],
};
let commandsTimeConfig = {
  title: "Change time config...",
  list: [
    {
      id: "changeTimeConfig15",
      display: "15",
      exec: () => {
        Config.changeTimeConfig("15");
        restartTest();
      },
    },
    {
      id: "changeTimeConfig30",
      display: "30",
      exec: () => {
        Config.changeTimeConfig("30");
        restartTest();
      },
    },
    {
      id: "changeTimeConfig60",
      display: "60",
      exec: () => {
        Config.changeTimeConfig("60");
        restartTest();
      },
    },
    {
      id: "changeTimeConfig120",
      display: "120",
      exec: () => {
        Config.changeTimeConfig("120");
        restartTest();
      },
    },
    {
      id: "changeTimeConfigCustom",
      display: "custom...",
      input: true,
      exec: (input) => {
        Config.changeTimeConfig(input);
        restartTest();
      },
    },
  ],
};

let commandsConfidenceMode = {
  title: "Change confidence mode...",
  list: [
    {
      id: "changeConfidenceModeOff",
      display: "off",
      exec: () => {
        Config.setConfidenceMode("off");
      },
    },
    {
      id: "changeConfidenceModeOn",
      display: "on",
      exec: () => {
        Config.setConfidenceMode("on");
      },
    },
    {
      id: "changeConfidenceModeMax",
      display: "max",
      exec: () => {
        Config.setConfidenceMode("max");
      },
    },
  ],
};

let commandsStopOnError = {
  title: "Change stop on error...",
  list: [
    {
      id: "changeStopOnErrorOff",
      display: "off",
      exec: () => {
        Config.setStopOnError("off");
      },
    },
    {
      id: "changeStopOnErrorLetter",
      display: "letter",
      exec: () => {
        Config.setStopOnError("letter");
      },
    },
    {
      id: "changeStopOnErrorWord",
      display: "word",
      exec: () => {
        Config.setStopOnError("word");
      },
    },
  ],
};

let commandsFontSize = {
  title: "Change font size...",
  list: [
    {
      id: "changeFontSize1",
      display: "1x",
      exec: () => {
        Config.changeFontSize(1);
        restartTest();
      },
    },
    {
      id: "changeFontSize125",
      display: "1.25x",
      exec: () => {
        Config.changeFontSize(125);
        restartTest();
      },
    },
    {
      id: "changeFontSize15",
      display: "1.5x",
      exec: () => {
        Config.changeFontSize(15);
        restartTest();
      },
    },
    {
      id: "changeFontSize2",
      display: "2x",
      exec: () => {
        Config.changeFontSize(2);
        restartTest();
      },
    },
    {
      id: "changeFontSize3",
      display: "3x",
      exec: () => {
        Config.changeFontSize(3);
        restartTest();
      },
    },
  ],
};

let commandsTags = {
  title: "Change tags...",
  list: [],
};

function updateCommandsTagsList() {
  if (UserData.dbSnapshot.tags.length > 0) {
    commandsTags.list = [];

    commandsTags.list.push({
      id: "clearTags",
      display: "Clear tags",
      exec: () => {
        UserData.dbSnapshot.tags.forEach((tag) => {
          tag.active = false;
        });
        updateTestModesNotice();
        Config.saveActiveTagsToCookie();
      },
    });

    UserData.dbSnapshot.tags.forEach((tag) => {
      let dis = tag.name;

      if (tag.active === true) {
        dis = '<i class="fas fa-check-square"></i>' + dis;
      } else {
        dis = '<i class="fas fa-square"></i>' + dis;
      }

      commandsTags.list.push({
        id: "toggleTag" + tag.id,
        display: dis,
        sticky: true,
        exec: () => {
          Settings.toggleTag(tag.id);
          updateTestModesNotice();
          let txt = tag.name;

          if (tag.active === true) {
            txt = '<i class="fas fa-check-square"></i>' + txt;
          } else {
            txt = '<i class="fas fa-square"></i>' + txt;
          }
          if (isSingleListCommandLineActive()) {
            $(
              `#commandLine .suggestions .entry[command='toggleTag${tag.id}']`
            ).html("Change tags > " + txt);
          } else {
            $(
              `#commandLine .suggestions .entry[command='toggleTag${tag.id}']`
            ).html(txt);
          }
        },
      });
    });
    commands.list[4].visible = true;
  }
}

Misc.getThemesList().then((themes) => {
  themes.forEach((theme) => {
    commandsThemes.list.push({
      id: "changeTheme" + Misc.capitalizeFirstLetter(theme.name),
      display: theme.name.replace(/_/g, " "),
      hover: () => {
        Config.previewTheme(theme.name);
      },
      exec: () => {
        Config.setTheme(theme.name);
      },
    });
  });
});

function showFavouriteThemesAtTheTop() {
  if (UserConfig.config.favThemes.length > 0) {
    commandsThemes.list = [];
    UserConfig.config.favThemes.forEach((theme) => {
      commandsThemes.list.push({
        id: "changeTheme" + Misc.capitalizeFirstLetter(theme),
        display: theme.replace(/_/g, " "),
        hover: () => {
          Config.previewTheme(theme);
        },
        exec: () => {
          Config.setTheme(theme);
        },
      });
    });
    Misc.getThemesList().then((themes) => {
      themes.forEach((theme) => {
        if (UserConfig.config.favThemes.includes(theme.name)) return;
        commandsThemes.list.push({
          id: "changeTheme" + Misc.capitalizeFirstLetter(theme.name),
          display: theme.name.replace(/_/g, " "),
          hover: () => {
            Config.previewTheme(theme.name);
          },
          exec: () => {
            Config.setTheme(theme.name);
          },
        });
      });
    });
  }
}

let commandsFonts = {
  title: "Change font...",
  list: [],
};

Misc.getFontsList().then((fonts) => {
  fonts.forEach((font) => {
    commandsFonts.list.push({
      id: "changeFont" + font.name.replace(/ /g, "_"),
      display: font.display !== undefined ? font.display : font.name,
      hover: () => {
        Config.previewFontFamily(font.name);
      },
      exec: () => {
        Config.setFontFamily(font.name.replace(/ /g, "_"));
      },
    });
  });
});

let commandsFunbox = {
  title: "Change funbox...",
  list: [
    {
      id: "changeFunboxNone",
      display: "none",
      exec: () => {
        if (activateFunbox("none", null)) {
          restartTest();
        }
      },
    },
  ],
};

Misc.getFunboxList().then((funboxes) => {
  funboxes.forEach((funbox) => {
    commandsFunbox.list.push({
      id: "changeFunbox" + funbox.name,
      display: funbox.name.replace(/_/g, " "),
      exec: () => {
        if (activateFunbox(funbox.name, funbox.type)) {
          restartTest();
        }
      },
    });
  });
});

let commandsThemes = {
  title: "Change theme...",
  list: [],
};

let commandsLanguages = {
  title: "Change language...",
  list: [
    {
      id: "couldnotload",
      display: "Could not load the languages list :(",
    },
  ],
};

// if (getLanguageList().length > 0) {
commandsLanguages.list = [];
Misc.getLanguageList().then((languages) => {
  languages.forEach((language) => {
    // if (language === "english_10k") return;
    commandsLanguages.list.push({
      id: "changeLanguage" + Misc.capitalizeFirstLetter(language),
      display: language.replace(/_/g, " "),
      exec: () => {
        Config.changeLanguage(language);
        restartTest();
        Config.saveConfigToCookie();
      },
    });
  });
  // if (language === "english_expanded") {
  //   commandsLanguages.list.push({
  //     id: "changeLanguageEnglish10k",
  //     display: "english 10k",
  //     exec: () => {
  //       changeLanguage("english_10k");
  //       restartTest();
  //       saveConfigToCookie();
  //     },
  //   });
  // }
});
// }

let commandsLayouts = {
  title: "Change layout...",
  list: [
    {
      id: "couldnotload",
      display: "Could not load the layouts list :(",
    },
  ],
};

if (Object.keys(layouts).length > 0) {
  commandsLayouts.list = [];
  Object.keys(layouts).forEach((layout) => {
    commandsLayouts.list.push({
      id: "changeLayout" + Misc.capitalizeFirstLetter(layout),
      display: layout.replace(/_/g, " "),
      exec: () => {
        Config.changeSavedLayout(layout);
        restartTest();
        Config.saveConfigToCookie();
      },
    });
  });
}

let commandsKeymapLayouts = {
  title: "Change keymap layout...",
  list: [
    {
      id: "couldnotload",
      display: "Could not load the layouts list :(",
    },
  ],
};

if (Object.keys(layouts).length > 0) {
  commandsKeymapLayouts.list = [];
  Object.keys(layouts).forEach((layout) => {
    if (layout.toString() != "default") {
      commandsKeymapLayouts.list.push({
        id: "changeKeymapLayout" + Misc.capitalizeFirstLetter(layout),
        display: layout.replace("_", " "),
        exec: () => {
          Config.changeKeymapLayout(layout);
          restartTest();
          Config.saveConfigToCookie();
        },
      });
    }
  });
}

$("#commandLine input").keyup((e) => {
  if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13 || e.code == "Tab")
    return;
  updateSuggestedCommands();
});

$(document).ready((e) => {
  $(document).keydown((event) => {
    //escape
    if (
      (event.keyCode == 27 && !UserConfig.config.swapEscAndTab) ||
      (event["keyCode"] == 9 && UserConfig.config.swapEscAndTab)
    ) {
      event.preventDefault();
      if (!$("#leaderboardsWrapper").hasClass("hidden")) {
        //maybe add more condition for closing other dialogs in the future as well
        event.preventDefault();
        Leaderboards.hideLeaderboards();
        return;
      } else if ($("#commandLineWrapper").hasClass("hidden")) {
        if (UserConfig.config.singleListCommandLine == "on")
          useSingleListCommandLine(false);
        else currentCommands = [commands];
        showCommandLine();
      } else {
        if (currentCommands.length > 1) {
          currentCommands.pop();
          $("#commandLine").removeClass("allCommands");
          showCommandLine();
        } else {
          hideCommandLine();
        }
        Config.setFontFamily(UserConfig.config.fontFamily, true);
        if (UserConfig.config.customTheme === true) {
          Config.applyCustomThemeColors();
        } else {
          Config.setTheme(UserConfig.config.theme);
        }
      }
    }
  });
});

$("#commandInput input").keydown((e) => {
  if (e.keyCode == 13) {
    //enter
    e.preventDefault();
    let command = $("#commandInput input").attr("command");
    let value = $("#commandInput input").val();
    let list = currentCommands[currentCommands.length - 1];
    $.each(list.list, (i, obj) => {
      if (obj.id == command) {
        obj.exec(value);
        if (obj.subgroup !== null && obj.subgroup !== undefined) {
          //TODO: is this unneeded?
          const subgroup = obj.subgroup;
        }
      }
    });
    try {
      firebase.analytics().logEvent("usedCommandLine", {
        command: command,
      });
    } catch (e) {
      console.log("Analytics unavailable");
    }
    hideCommandLine();
  }
  return;
});

$("#commandLineWrapper #commandLine .suggestions").on("mouseover", (e) => {
  $("#commandLineWrapper #commandLine .suggestions .entry").removeClass(
    "active"
  );
  let hoverId = $(e.target).attr("command");
  try {
    let list = currentCommands[currentCommands.length - 1];
    $.each(list.list, (index, obj) => {
      if (obj.id == hoverId) {
        obj.hover();
      }
    });
  } catch (e) {}
});

$("#commandLineWrapper #commandLine .suggestions").click((e) => {
  $(".suggestions .entry").removeClass("activeKeyboard");
  triggerCommand($(e.target).attr("command"));
});

$("#commandLineWrapper").click((e) => {
  if ($(e.target).attr("id") === "commandLineWrapper") {
    hideCommandLine();
    Config.setFontFamily(UserConfig.config.fontFamily, true);
    if (UserConfig.config.customTheme === true) {
      Config.applyCustomThemeColors();
    } else {
      Config.setTheme(UserConfig.config.theme, true);
    }
  }
});

$(document).keydown((e) => {
  if (isPreviewingTheme) {
    Config.previewTheme(UserConfig.config.theme, false);
  }
  if (!$("#commandLineWrapper").hasClass("hidden")) {
    $("#commandLine input").focus();
    if (e.key == ">" && UserConfig.config.singleListCommandLine == "manual") {
      if (!isSingleListCommandLineActive()) {
        useSingleListCommandLine();
        return;
      } else if ($("#commandLine input").val() == ">") {
        //so that it will ignore succeeding ">" when input is already ">"
        e.preventDefault();
        return;
      }
    }
    if (
      e.keyCode == 8 &&
      $("#commandLine input").val().length == 1 &&
      UserConfig.config.singleListCommandLine == "manual" &&
      isSingleListCommandLineActive()
    )
      restoreOldCommandLine();
    if (e.keyCode == 13) {
      //enter
      e.preventDefault();
      let command = $(".suggestions .entry.activeKeyboard").attr("command");
      triggerCommand(command);
      return;
    }
    if (e.keyCode == 38 || e.keyCode == 40 || e.code == "Tab") {
      e.preventDefault();
      $("#commandLineWrapper #commandLine .suggestions .entry").unbind(
        "mouseenter mouseleave"
      );
      let entries = $(".suggestions .entry");
      let activenum = -1;
      let hoverId;
      $.each(entries, (index, obj) => {
        if ($(obj).hasClass("activeKeyboard")) activenum = index;
      });
      if (e.keyCode == 38 || (e.code == "Tab" && e.shiftKey)) {
        entries.removeClass("activeKeyboard");
        if (activenum == 0) {
          $(entries[entries.length - 1]).addClass("activeKeyboard");
          hoverId = $(entries[entries.length - 1]).attr("command");
        } else {
          $(entries[--activenum]).addClass("activeKeyboard");
          hoverId = $(entries[activenum]).attr("command");
        }
      }
      if (e.keyCode == 40 || (e.code == "Tab" && !e.shiftKey)) {
        entries.removeClass("activeKeyboard");
        if (activenum + 1 == entries.length) {
          $(entries[0]).addClass("activeKeyboard");
          hoverId = $(entries[0]).attr("command");
        } else {
          $(entries[++activenum]).addClass("activeKeyboard");
          hoverId = $(entries[activenum]).attr("command");
        }
      }
      try {
        let scroll =
          Math.abs(
            $(".suggestions").offset().top -
              $(".entry.activeKeyboard").offset().top -
              $(".suggestions").scrollTop()
          ) -
          $(".suggestions").outerHeight() / 2 +
          $($(".entry")[0]).outerHeight();
        $(".suggestions").scrollTop(scroll);
      } catch (e) {
        console.log("could not scroll suggestions: " + e.message);
      }
      // console.log(`scrolling to ${scroll}`);
      try {
        let list = currentCommands[currentCommands.length - 1];
        $.each(list.list, (index, obj) => {
          if (obj.id == hoverId) {
            obj.hover();
          }
        });
      } catch (e) {}

      return false;
    }
  }
});

let currentCommands = [commands];

export function addCurrentCommand(commandsList) {
  currentCommands.push(commandsList);
}

export function addThemeCommands() {
  currentCommands.push(commandsThemes);
}

function triggerCommand(command) {
  let subgroup = false;
  let input = false;
  let list = currentCommands[currentCommands.length - 1];
  let sticky = false;
  $.each(list.list, (i, obj) => {
    if (obj.id == command) {
      if (obj.input) {
        input = true;
        showCommandInput(obj.id, obj.display);
      } else {
        obj.exec();
        if (obj.subgroup !== null && obj.subgroup !== undefined) {
          subgroup = obj.subgroup;
        }
        if (obj.sticky === true) {
          sticky = true;
        }
      }
    }
  });
  if (!subgroup && !input && !sticky) {
    try {
      firebase.analytics().logEvent("usedCommandLine", {
        command: command,
      });
    } catch (e) {
      console.log("Analytics unavailable");
    }
    hideCommandLine();
  }
}

function hideCommandLine() {
  $("#commandLineWrapper")
    .stop(true, true)
    .css("opacity", 1)
    .animate(
      {
        opacity: 0,
      },
      100,
      () => {
        $("#commandLineWrapper").addClass("hidden");
        $("#commandLine").removeClass("allCommands");
        Util.focusWords();
      }
    );
  Util.focusWords();
}

export function showCommandLine() {
  TypingTest.setFocus(false);
  $("#commandLine").removeClass("hidden");
  $("#commandInput").addClass("hidden");
  if ($("#commandLineWrapper").hasClass("hidden")) {
    $("#commandLineWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate(
        {
          opacity: 1,
        },
        100
      );
  }
  $("#commandLine input").val("");
  updateSuggestedCommands();
  $("#commandLine input").focus();
}

function showCommandInput(command, placeholder) {
  $("#commandLineWrapper").removeClass("hidden");
  $("#commandLine").addClass("hidden");
  $("#commandInput").removeClass("hidden");
  $("#commandInput input").attr("placeholder", placeholder);
  $("#commandInput input").val("");
  $("#commandInput input").focus();
  $("#commandInput input").attr("command", "");
  $("#commandInput input").attr("command", command);
}

function updateSuggestedCommands() {
  let inputVal = $("#commandLine input")
    .val()
    .toLowerCase()
    .split(" ")
    .filter((s, i) => s || i == 0); //remove empty entries after first
  let list = currentCommands[currentCommands.length - 1];
  if (
    inputVal[0] === "" &&
    UserConfig.config.singleListCommandLine === "on" &&
    currentCommands.length === 1
  ) {
    $.each(list.list, (index, obj) => {
      obj.found = false;
    });
    displayFoundCommands();
    return;
  }
  //ignore the preceeding ">"s in the command line input
  if (inputVal[0] && inputVal[0][0] == ">")
    inputVal[0] = inputVal[0].replace(/^>+/, "");
  if (inputVal[0] == "" && inputVal.length == 1) {
    $.each(list.list, (index, obj) => {
      if (obj.visible !== false) obj.found = true;
    });
  } else {
    $.each(list.list, (index, obj) => {
      let foundcount = 0;
      $.each(inputVal, (index2, obj2) => {
        if (obj2 == "") return;
        let re = new RegExp("\\b" + obj2, "g");
        let res = obj.display.toLowerCase().match(re);
        if (res != null && res.length > 0) {
          foundcount++;
        } else {
          foundcount--;
        }
      });
      if (foundcount > 0) {
        obj.found = true;
      } else {
        obj.found = false;
      }
    });
  }
  displayFoundCommands();
}

function displayFoundCommands() {
  $("#commandLine .suggestions").empty();
  let list = currentCommands[currentCommands.length - 1];
  $.each(list.list, (index, obj) => {
    if (obj.found) {
      $("#commandLine .suggestions").append(
        '<div class="entry" command="' + obj.id + '">' + obj.display + "</div>"
      );
    }
  });
  if ($("#commandLine .suggestions .entry").length == 0) {
    $("#commandLine .separator").css({ height: 0, margin: 0 });
  } else {
    $("#commandLine .separator").css({
      height: "1px",
      "margin-bottom": ".5rem",
    });
  }
  let entries = $("#commandLine .suggestions .entry");
  if (entries.length > 0) {
    $(entries[0]).addClass("activeKeyboard");
    try {
      $.each(list.list, (index, obj) => {
        if (obj.found) {
          obj.hover();
          return false;
        }
      });
    } catch (e) {}
  }
  $("#commandLine .listTitle").remove();
  // if(currentCommands.title != ''){
  //   $("#commandLine .suggestions").before("<div class='listTitle'>"+currentCommands.title+"</div>");
  // }
}
