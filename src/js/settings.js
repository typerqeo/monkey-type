class SettingsGroup {
  constructor(
    configName,
    toggleFunction,
    setCallback = null,
    updateCallback = null
  ) {
    this.configName = configName;
    this.configValue = config[configName];
    if (this.configValue === true || this.configValue === false) {
      this.onOff = true;
    } else {
      this.onOff = false;
    }
    this.toggleFunction = toggleFunction;
    this.setCallback = setCallback;
    this.updateCallback = updateCallback;

    this.updateButton();

    $(document).on(
      "click",
      `.pageSettings .section.${this.configName} .button`,
      (e) => {
        if (this.onOff) {
          if ($(e.currentTarget).hasClass("on")) {
            this.toggleFunction(true);
          } else {
            this.toggleFunction(false);
          }
          this.updateButton();
          if (this.setCallback !== null) this.setCallback();
        } else {
          let value = $(e.currentTarget).attr(configName);
          let params = $(e.currentTarget).attr("params");
          if (params === undefined) {
            this.toggleFunction(value);
          } else {
            this.toggleFunction(value, ...params);
          }
          this.updateButton();
          if (this.setCallback !== null) this.setCallback();
        }
      }
    );
  }

  updateButton() {
    this.configValue = config[this.configName];
    $(`.pageSettings .section.${this.configName} .button`).removeClass(
      "active"
    );
    if (this.onOff) {
      let onoffstring;
      if (this.configValue) {
        onoffstring = "on";
      } else {
        onoffstring = "off";
      }
      $(
        `.pageSettings .section.${this.configName} .buttons .button.${onoffstring}`
      ).addClass("active");
    } else {
      $(
        `.pageSettings .section.${this.configName} .button[${this.configName}='${this.configValue}']`
      ).addClass("active");
    }
    if (this.updateCallback !== null) this.updateCallback();
  }
}

let settingsGroups = {};

settingsGroups.smoothCaret = new SettingsGroup("smoothCaret", setSmoothCaret);
settingsGroups.difficulty = new SettingsGroup("difficulty", setDifficulty);
settingsGroups.quickTab = new SettingsGroup("quickTab", setQuickTabMode);
settingsGroups.showLiveWpm = new SettingsGroup(
  "showLiveWpm",
  setShowLiveWpm,
  () => {
    settingsGroups.keymapMode.updateButton();
  }
);
settingsGroups.showTimerProgress = new SettingsGroup(
  "showTimerProgress",
  setShowTimerProgress
);
settingsGroups.keymapMode = new SettingsGroup(
  "keymapMode",
  changeKeymapMode,
  () => {
    settingsGroups.showLiveWpm.updateButton();
  },
  () => {
    if (config.keymapMode === "off") {
      $(".pageSettings .section.keymapStyle").addClass("hidden");
      $(".pageSettings .section.keymapLayout").addClass("hidden");
    } else {
      $(".pageSettings .section.keymapStyle").removeClass("hidden");
      $(".pageSettings .section.keymapLayout").removeClass("hidden");
    }
  }
);
settingsGroups.keymapMatrix = new SettingsGroup(
  "keymapStyle",
  changeKeymapStyle
);
settingsGroups.keymapLayout = new SettingsGroup(
  "keymapLayout",
  changeKeymapLayout
);
settingsGroups.showKeyTips = new SettingsGroup(
  "showKeyTips",
  setKeyTips,
  null,
  () => {
    if (config.showKeyTips) {
      $(".pageSettings .tip").removeClass("hidden");
    } else {
      $(".pageSettings .tip").addClass("hidden");
    }
  }
);
settingsGroups.freedomMode = new SettingsGroup(
  "freedomMode",
  setFreedomMode,
  () => {
    settingsGroups.confidenceMode.updateButton();
  }
);
settingsGroups.confidenceMode = new SettingsGroup(
  "confidenceMode",
  setConfidenceMode,
  () => {
    settingsGroups.freedomMode.updateButton();
    settingsGroups.stopOnError.updateButton();
  }
);
settingsGroups.indicateTypos = new SettingsGroup(
  "indicateTypos",
  setIndicateTypos
);
settingsGroups.blindMode = new SettingsGroup("blindMode", setBlindMode);
settingsGroups.quickEnd = new SettingsGroup("quickEnd", setQuickEnd);
settingsGroups.enableAds = new SettingsGroup("enableAds", setEnableAds);
// settingsGroups.readAheadMode = new SettingsGroup(
//   "readAheadMode",
//   setReadAheadMode
// );
settingsGroups.alwaysShowWordsHistory = new SettingsGroup(
  "alwaysShowWordsHistory",
  setAlwaysShowWordsHistory
);
settingsGroups.singleListCommandLine = new SettingsGroup(
  "singleListCommandLine",
  setSingleListCommandLine
);
settingsGroups.flipTestColors = new SettingsGroup(
  "flipTestColors",
  setFlipTestColors
);
settingsGroups.swapEscAndTab = new SettingsGroup(
  "swapEscAndTab",
  setSwapEscAndTab
);
settingsGroups.showOutOfFocusWarning = new SettingsGroup(
  "showOutOfFocusWarning",
  setShowOutOfFocusWarning
);
settingsGroups.colorfulMode = new SettingsGroup(
  "colorfulMode",
  setColorfulMode
);
settingsGroups.startGraphsAtZero = new SettingsGroup(
  "startGraphsAtZero",
  setStartGraphsAtZero
);
settingsGroups.randomTheme = new SettingsGroup("randomTheme", setRandomTheme);
settingsGroups.stopOnError = new SettingsGroup(
  "stopOnError",
  setStopOnError,
  () => {
    settingsGroups.confidenceMode.updateButton();
  }
);
settingsGroups.playSoundOnError = new SettingsGroup(
  "playSoundOnError",
  setPlaySoundOnError
);
settingsGroups.playSoundOnClick = new SettingsGroup(
  "playSoundOnClick",
  setPlaySoundOnClick,
  () => {
    if (config.playSoundOnClick !== "off")
      // clickSounds[config.playSoundOnClick][0].sounds[0].play();
      playClickSound();
  }
);
settingsGroups.showAllLines = new SettingsGroup(
  "showAllLines",
  setShowAllLines
);
settingsGroups.paceCaret = new SettingsGroup("paceCaret", setPaceCaret, () => {
  if (config.paceCaret === "custom") {
    $(
      ".pageSettings .section.paceCaret input.customPaceCaretSpeed"
    ).removeClass("hidden");
  } else {
    $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").addClass(
      "hidden"
    );
  }
});
settingsGroups.minWpm = new SettingsGroup("minWpm", setMinWpm, () => {
  if (config.minWpm === "custom") {
    $(".pageSettings .section.minWpm input.customMinWpmSpeed").removeClass(
      "hidden"
    );
  } else {
    $(".pageSettings .section.minWpm input.customMinWpmSpeed").addClass(
      "hidden"
    );
  }
});
settingsGroups.smoothLineScroll = new SettingsGroup(
  "smoothLineScroll",
  setSmoothLineScroll
);
settingsGroups.capsLockBackspace = new SettingsGroup(
  "capsLockBackspace",
  setCapsLockBackspace
);
settingsGroups.layout = new SettingsGroup("layout", changeSavedLayout);
settingsGroups.language = new SettingsGroup("language", changeLanguage);
settingsGroups.fontSize = new SettingsGroup("fontSize", changeFontSize);
settingsGroups.pageWidth = new SettingsGroup("pageWidth", setPageWidth);
settingsGroups.caretStyle = new SettingsGroup("caretStyle", setCaretStyle);
settingsGroups.paceCaretStyle = new SettingsGroup(
  "paceCaretStyle",
  setPaceCaretStyle
);
settingsGroups.timerStyle = new SettingsGroup("timerStyle", setTimerStyle);
settingsGroups.highlighteMode = new SettingsGroup(
  "highlightMode",
  setHighlightMode
);
settingsGroups.timerOpacity = new SettingsGroup(
  "timerOpacity",
  setTimerOpacity
);
settingsGroups.timerColor = new SettingsGroup("timerColor", setTimerColor);
settingsGroups.fontFamily = new SettingsGroup("fontFamily", setFontFamily);
settingsGroups.alwaysShowDecimalPlaces = new SettingsGroup(
  "alwaysShowDecimalPlaces",
  setAlwaysShowDecimalPlaces
);
settingsGroups.alwaysShowCPM = new SettingsGroup(
  "alwaysShowCPM",
  setAlwaysShowCPM
);

fillSettingsPage();

async function fillSettingsPage() {
  refreshThemeButtons();

  let langEl = $(".pageSettings .section.language .buttons").empty();
  getLanguageList().then((languages) => {
    languages.forEach((language) => {
      langEl.append(
        `<div class="language button" language='${language}'>${language.replace(
          "_",
          " "
        )}</div>`
      );
    });
  });

  let layoutEl = $(".pageSettings .section.layout .buttons").empty();
  Object.keys(layouts).forEach((layout) => {
    layoutEl.append(
      `<div class="layout button" layout='${layout}'>${layout.replace(
        "_",
        " "
      )}</div>`
    );
  });

  let keymapEl = $(".pageSettings .section.keymapLayout .buttons").empty();
  Object.keys(layouts).forEach((layout) => {
    if (layout.toString() != "default") {
      keymapEl.append(
        `<div class="layout button" keymapLayout='${layout}'>${layout.replace(
          "_",
          " "
        )}</div>`
      );
    }
  });

  let funboxEl = $(".pageSettings .section.funbox .buttons").empty();
  funboxEl.append(`<div class="funbox button" funbox='none'>none</div>`);
  getFunboxList().then((funboxModes) => {
    funboxModes.forEach((funbox) => {
      if (funbox.name === "mirror") {
        funboxEl.append(
          `<div class="funbox button" funbox='${funbox.name}' aria-label="${
            funbox.info
          }" data-balloon-pos="up" data-balloon-length="fit" type="${
            funbox.type
          }" style="transform:scaleX(-1);">${funbox.name.replace(
            /_/g,
            " "
          )}</div>`
        );
      } else {
        funboxEl.append(
          `<div class="funbox button" funbox='${funbox.name}' aria-label="${
            funbox.info
          }" data-balloon-pos="up" data-balloon-length="fit" type="${
            funbox.type
          }">${funbox.name.replace(/_/g, " ")}</div>`
        );
      }
    });
  });

  let fontsEl = $(".pageSettings .section.fontFamily .buttons").empty();
  getFontsList().then((fonts) => {
    fonts.forEach((font) => {
      fontsEl.append(
        `<div class="button" style="font-family:${
          font.display !== undefined ? font.display : font.name
        }" fontFamily="${font.name.replace(/ /g, "_")}" tabindex="0"
        onclick="this.blur();">${
          font.display !== undefined ? font.display : font.name
        }</div>`
      );
    });
  });
}

function refreshThemeButtons() {
  let favThemesEl = $(
    ".pageSettings .section.themes .favThemes.buttons"
  ).empty();
  let themesEl = $(".pageSettings .section.themes .allThemes.buttons").empty();

  let activeThemeName = config.theme;
  if (config.randomTheme !== "off" && randomTheme !== null) {
    activeThemeName = randomTheme;
  }

  getSortedThemesList().then((themes) => {
    //first show favourites
    if (config.favThemes.length > 0) {
      favThemesEl.css({ paddingBottom: "1rem" });
      themes.forEach((theme) => {
        if (config.favThemes.includes(theme.name)) {
          let activeTheme = activeThemeName === theme.name ? "active" : "";
          favThemesEl.append(
            `<div class="theme button" theme='${theme.name}' style="color:${
              theme.textColor
            };background:${theme.bgColor}">
          <div class="activeIndicator ${activeTheme}"><i class="fas fa-circle"></i></div>
          <div class="text">${theme.name.replace(/_/g, " ")}</div>
          <div class="favButton active"><i class="fas fa-star"></i></div></div>`
          );
        }
      });
    } else {
      favThemesEl.css({ paddingBottom: "0" });
    }
    //then the rest
    themes.forEach((theme) => {
      if (!config.favThemes.includes(theme.name)) {
        let activeTheme = activeThemeName === theme.name ? "active" : "";
        themesEl.append(
          `<div class="theme button" theme='${theme.name}' style="color:${
            theme.textColor
          };background:${theme.bgColor}">
          <div class="activeIndicator ${activeTheme}"><i class="fas fa-circle"></i></div>
          <div class="text">${theme.name.replace(/_/g, " ")}</div>
          <div class="favButton"><i class="far fa-star"></i></div></div>`
        );
      }
    });
  });
}

function updateSettingsPage() {
  Object.keys(settingsGroups).forEach((group) => {
    settingsGroups[group].updateButton();
  });

  refreshTagsSettingsSection();
  setActiveFunboxButton();
  setActiveThemeButton();
  setActiveThemeTab();
  setCustomThemeInputs();
  updateDiscordSettingsSection();
  refreshThemeButtons();

  if (config.paceCaret === "custom") {
    $(
      ".pageSettings .section.paceCaret input.customPaceCaretSpeed"
    ).removeClass("hidden");
    $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").val(
      config.paceCaretCustomSpeed
    );
  } else {
    $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").addClass(
      "hidden"
    );
  }

  if (config.minWpm === "custom") {
    $(".pageSettings .section.minWpm input.customMinWpmSpeed").removeClass(
      "hidden"
    );
    $(".pageSettings .section.minWpm input.customMinWpmSpeed").val(
      config.minWpmCustomSpeed
    );
  } else {
    $(".pageSettings .section.minWpm input.customMinWpmSpeed").addClass(
      "hidden"
    );
  }
}

function showCustomThemeShare() {
  if ($("#customThemeShareWrapper").hasClass("hidden")) {
    let save = [];
    $.each(
      $(".pageSettings .section.customTheme [type='color']"),
      (index, element) => {
        save.push($(element).attr("value"));
      }
    );
    $("#customThemeShareWrapper input").val(JSON.stringify(save));
    $("#customThemeShareWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 100, (e) => {
        $("#customThemeShare input").focus();
        $("#customThemeShare input").select();
        $("#customThemeShare input").focus();
      });
  }
}

function hideCustomThemeShare() {
  if (!$("#customThemeShareWrapper").hasClass("hidden")) {
    try {
      config.customThemeColors = JSON.parse(
        $("#customThemeShareWrapper input").val()
      );
    } catch (e) {
      showNotification(
        "Something went wrong. Reverting to default custom colors.",
        3000
      );
      config.customThemeColors = defaultConfig.customThemeColors;
    }
    setCustomThemeInputs();
    applyCustomThemeColors();
    $("#customThemeShareWrapper input").val("");
    $("#customThemeShareWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        100,
        (e) => {
          $("#customThemeShareWrapper").addClass("hidden");
        }
      );
  }
}

function toggleFavouriteTheme(themename) {
  if (config.favThemes.includes(themename)) {
    //already favourite, remove
    config.favThemes = config.favThemes.filter((t) => {
      if (t !== themename) {
        return t;
      }
    });
  } else {
    //add to favourites
    config.favThemes.push(themename);
  }
  saveConfigToCookie();
  refreshThemeButtons();
  showFavouriteThemesAtTheTop();
}

function showAccountSettingsSection() {
  $(`.sectionGroupTitle[group='account']`).removeClass("hidden");
  $(`.settingsGroup.account`).removeClass("hidden");
  refreshTagsSettingsSection();
  updateDiscordSettingsSection();
}

function hideAccountSettingsSection() {
  $(`.sectionGroupTitle[group='account']`).addClass("hidden");
  $(`.settingsGroup.account`).addClass("hidden");
}

function refreshTagsSettingsSection() {
  if (firebase.auth().currentUser !== null && dbSnapshot !== null) {
    let tagsEl = $(".pageSettings .section.tags .tagsList").empty();
    dbSnapshot.tags.forEach((tag) => {
      if (tag.active === true) {
        tagsEl.append(`

              <div class="tag" id="${tag.id}">
                  <div class="active" active="true">
                      <i class="fas fa-check-square"></i>
                  </div>
                  <div class="title">${tag.name}</div>
                  <div class="editButton"><i class="fas fa-pen"></i></div>
                  <div class="removeButton"><i class="fas fa-trash"></i></div>
              </div>

            `);
      } else {
        tagsEl.append(`

              <div class="tag" id="${tag.id}">
                  <div class="active" active="false">
                      <i class="fas fa-square"></i>
                  </div>
                  <div class="title">${tag.name}</div>
                  <div class="editButton"><i class="fas fa-pen"></i></div>
                  <div class="removeButton"><i class="fas fa-trash"></i></div>
              </div>

            `);
      }
    });
    $(".pageSettings .section.tags").removeClass("hidden");
  } else {
    $(".pageSettings .section.tags").addClass("hidden");
  }
}

function setActiveFunboxButton() {
  $(`.pageSettings .section.funbox .button`).removeClass("active");
  $(`.pageSettings .section.funbox .button[funbox='${activeFunBox}']`).addClass(
    "active"
  );
}

function setActiveThemeButton() {
  $(`.pageSettings .section.themes .theme`).removeClass("active");
  $(`.pageSettings .section.themes .theme[theme=${config.theme}]`).addClass(
    "active"
  );
}

function setActiveThemeTab() {
  config.customTheme === true
    ? $(".pageSettings .section.themes .tabs .button[tab='custom']").click()
    : $(".pageSettings .section.themes .tabs .button[tab='preset']").click();
}

function setCustomThemeInputs() {
  $(
    ".pageSettings .section.themes .tabContainer .customTheme input[type=color]"
  ).each((n, index) => {
    let currentColor =
      config.customThemeColors[colorVars.indexOf($(index).attr("id"))];
    $(index).val(currentColor);
    $(index).attr("value", currentColor);
    $(index).prev().text(currentColor);
  });
}

function showActiveTags() {
  dbSnapshot.tags.forEach((tag) => {
    if (tag.active === true) {
      $(
        `.pageSettings .section.tags .tagsList .tag[id='${tag.id}'] .active`
      ).html('<i class="fas fa-check-square"></i>');
    } else {
      $(
        `.pageSettings .section.tags .tagsList .tag[id='${tag.id}'] .active`
      ).html('<i class="fas fa-square"></i>');
    }
  });
}

function toggleTag(tagid, nosave = false) {
  dbSnapshot.tags.forEach((tag) => {
    if (tag.id === tagid) {
      if (tag.active === undefined) {
        tag.active = true;
      } else {
        tag.active = !tag.active;
      }
    }
  });
  updateTestModesNotice();
  if (!nosave) saveActiveTagsToCookie();
}

function updateDiscordSettingsSection() {
  //no code and no discord
  if (firebase.auth().currentUser == null) {
    $(".pageSettings .section.discordIntegration").addClass("hidden");
  } else {
    if (dbSnapshot == null) return;
    $(".pageSettings .section.discordIntegration").removeClass("hidden");

    if (dbSnapshot.discordId == undefined) {
      //show button
      $(".pageSettings .section.discordIntegration .buttons").removeClass(
        "hidden"
      );
      $(".pageSettings .section.discordIntegration .info").addClass("hidden");
    } else {
      $(".pageSettings .section.discordIntegration .buttons").addClass(
        "hidden"
      );
      $(".pageSettings .section.discordIntegration .info").removeClass(
        "hidden"
      );
    }
  }
}

//theme tabs & custom theme
const colorVars = [
  "--bg-color",
  "--main-color",
  "--caret-color",
  "--sub-color",
  "--text-color",
  "--error-color",
  "--error-extra-color",
  "--colorful-error-color",
  "--colorful-error-extra-color",
];

function showSettingsImport() {
  if ($("#settingsImportWrapper").hasClass("hidden")) {
    $("#settingsImportWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 100, (e) => {
        $("#settingsImportWrapper input").focus();
        $("#settingsImportWrapper input").select();
        $("#settingsImportWrapper input").focus();
      });
  }
}

function hideSettingsImport() {
  if (!$("#settingsImportWrapper").hasClass("hidden")) {
    if ($("#settingsImportWrapper input").val() !== "") {
      try {
        applyConfig(JSON.parse($("#settingsImportWrapper input").val()));
      } catch (e) {
        showNotification(
          "An error occured while importing settings: " + e,
          5000
        );
      }
      saveConfigToCookie();
      updateSettingsPage();
    }
    $("#settingsImportWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate({ opacity: 0 }, 100, (e) => {
        $("#settingsImportWrapper").addClass("hidden");
      });
  }
}
