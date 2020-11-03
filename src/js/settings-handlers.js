$("#customThemeShareWrapper").click((e) => {
  if ($(e.target).attr("id") === "customThemeShareWrapper") {
    hideCustomThemeShare();
  }
});

$("#customThemeShare .button").click((e) => {
  hideCustomThemeShare();
});

$("#shareCustomThemeButton").click((e) => {
  // showCustomThemeShare();

  if (e.shiftKey) {
    showCustomThemeShare();
  } else {
    let share = [];
    $.each(
      $(".pageSettings .section.customTheme [type='color']"),
      (index, element) => {
        share.push($(element).attr("value"));
      }
    );

    let url =
      "https://monkeytype.com?" + objectToQueryString({ customTheme: share });
    navigator.clipboard.writeText(url).then(
      function () {
        showNotification("URL Copied to clipboard", 2000);
      },
      function (err) {
        showNotification(
          "Something went wrong when copying the URL: " + err,
          5000
        );
      }
    );
  }
});

$(document).on(
  "focusout",
  ".pageSettings .section.paceCaret input.customPaceCaretSpeed",
  (e) => {
    setPaceCaretCustomSpeed(
      parseInt(
        $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").val()
      )
    );
  }
);

$(document).on(
  "focusout",
  ".pageSettings .section.minWpm input.customMinWpmSpeed",
  (e) => {
    setMinWpmCustomSpeed(
      parseInt($(".pageSettings .section.minWpm input.customMinWpmSpeed").val())
    );
  }
);

$(document).on("click", ".pageSettings .section.themes .theme.button", (e) => {
  let theme = $(e.currentTarget).attr("theme");
  if (!$(e.target).hasClass("favButton")) {
    setTheme(theme);
    setActiveThemeButton();
    refreshThemeButtons();
  }
});

$(document).on(
  "click",
  ".pageSettings .section.themes .theme .favButton",
  (e) => {
    let theme = $(e.currentTarget).parents(".theme.button").attr("theme");
    toggleFavouriteTheme(theme);
  }
);

//discord
$(
  ".pageSettings .section.discordIntegration .buttons .generateCodeButton"
).click((e) => {
  showBackgroundLoader();
  generatePairingCode({ uid: firebase.auth().currentUser.uid })
    .then((ret) => {
      hideBackgroundLoader();
      if (ret.data.status === 1 || ret.data.status === 2) {
        dbSnapshot.pairingCode = ret.data.pairingCode;
        $(".pageSettings .section.discordIntegration .code .bottom").text(
          ret.data.pairingCode
        );
        $(".pageSettings .section.discordIntegration .howtocode").text(
          ret.data.pairingCode
        );
        updateDiscordSettingsSection();
      }
    })
    .catch((e) => {
      hideBackgroundLoader();
      showNotification("Something went wrong. Error: " + e.message, 4000);
    });
});

$(".pageSettings .section.discordIntegration #unlinkDiscordButton").click(
  (e) => {
    if (confirm("Are you sure?")) {
      showBackgroundLoader();
      unlinkDiscord({ uid: firebase.auth().currentUser.uid }).then((ret) => {
        hideBackgroundLoader();
        console.log(ret);
        if (ret.data.status === 1) {
          dbSnapshot.discordId = null;
          showNotification("Accounts unlinked", 2000);
          updateDiscordSettingsSection();
        } else {
          showNotification("Something went wrong: " + ret.data.message, 5000);
          updateDiscordSettingsSection();
        }
      });
    }
  }
);

//funbox
$(document).on("click", ".pageSettings .section.funbox .button", (e) => {
  let funbox = $(e.currentTarget).attr("funbox");
  let type = $(e.currentTarget).attr("type");
  activateFunbox(funbox, type);
  setActiveFunboxButton();
});

//tags
$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .active",
  (e) => {
    let target = e.currentTarget;
    let tagid = $(target).parent(".tag").attr("id");
    toggleTag(tagid);
    showActiveTags();
  }
);

$(document).on("click", ".pageSettings .section.tags .addTagButton", (e) => {
  showEditTags("add");
});

$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .editButton",
  (e) => {
    let tagid = $(e.currentTarget).parent(".tag").attr("id");
    let name = $(e.currentTarget).siblings(".title").text();
    showEditTags("edit", tagid, name);
  }
);

$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .removeButton",
  (e) => {
    let tagid = $(e.currentTarget).parent(".tag").attr("id");
    let name = $(e.currentTarget).siblings(".title").text();
    showEditTags("remove", tagid, name);
  }
);

$(".pageSettings .section.themes .tabs .button").click((e) => {
  $(".pageSettings .section.themes .tabs .button").removeClass("active");
  var $target = $(e.currentTarget);
  $target.addClass("active");
  setCustomThemeInputs();
  if ($target.attr("tab") == "preset") {
    setCustomTheme(false, true);
    applyCustomThemeColors();
    swapElements(
      $('.pageSettings .section.themes .tabContainer [tabContent="custom"]'),
      $('.pageSettings .section.themes .tabContainer [tabContent="preset"]'),
      250
    );
  } else {
    setCustomTheme(true, true);
    applyCustomThemeColors();
    swapElements(
      $('.pageSettings .section.themes .tabContainer [tabContent="preset"]'),
      $('.pageSettings .section.themes .tabContainer [tabContent="custom"]'),
      250
    );
  }
});

$(
  ".pageSettings .section.themes .tabContainer .customTheme input[type=color]"
).on("input", (e) => {
  setCustomTheme(true, true);
  let $colorVar = $(e.currentTarget).attr("id");
  let $pickedColor = $(e.currentTarget).val();

  document.documentElement.style.setProperty($colorVar, $pickedColor);
  $(".colorPicker #" + $colorVar).attr("value", $pickedColor);
  $(".colorPicker [for=" + $colorVar + "]").text($pickedColor);
});

$(".pageSettings .saveCustomThemeButton").click((e) => {
  let save = [];
  $.each(
    $(".pageSettings .section.customTheme [type='color']"),
    (index, element) => {
      save.push($(element).attr("value"));
    }
  );
  setCustomThemeColors(save);
  showNotification("Custom theme colors saved", 1000);
});

$(".pageSettings #loadCustomColorsFromPreset").click((e) => {
  previewTheme(config.theme);
  colorVars.forEach((e) => {
    document.documentElement.style.setProperty(e, "");
  });

  setTimeout(() => {
    refreshThemeColorObject();
    colorVars.forEach((colorName) => {
      let color;
      if (colorName === "--bg-color") {
        color = themeColors.bg;
      } else if (colorName === "--main-color") {
        color = themeColors.main;
      } else if (colorName === "--sub-color") {
        color = themeColors.sub;
      } else if (colorName === "--caret-color") {
        color = themeColors.caret;
      } else if (colorName === "--text-color") {
        color = themeColors.text;
      } else if (colorName === "--error-color") {
        color = themeColors.error;
      } else if (colorName === "--error-extra-color") {
        color = themeColors.errorExtra;
      } else if (colorName === "--colorful-error-color") {
        color = themeColors.colorfulError;
      } else if (colorName === "--colorful-error-extra-color") {
        color = themeColors.colorfulErrorExtra;
      }
      $(".colorPicker #" + colorName).attr("value", color);
      $(".colorPicker #" + colorName).val(color);
      $(".colorPicker [for=" + colorName + "]").text(color);
    });
  }, 250);
});

$("#resetSettingsButton").click((e) => {
  if (confirm("Press OK to confirm.")) {
    resetConfig();
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
});

$("#exportSettingsButton").click((e) => {
  let configJSON = JSON.stringify(config);
  navigator.clipboard.writeText(configJSON).then(
    function () {
      showNotification("JSON Copied to clipboard", 2000);
    },
    function (err) {
      showNotification(
        "Something went wrong when copying the settings JSON: " + err,
        5000
      );
    }
  );
});

$("#importSettingsButton").click((e) => {
  showSettingsImport();
});

$("#settingsImport .button").click((e) => {
  hideSettingsImport();
});

$("#settingsImportWrapper").click((e) => {
  if ($(e.target).attr("id") === "settingsImportWrapper") {
    hideSettingsImport();
  }
});

$(".pageSettings .sectionGroupTitle").click((e) => {
  let group = $(e.currentTarget).attr("group");
  $(`.pageSettings .settingsGroup.${group}`)
    .stop(true, true)
    .slideToggle(250)
    .toggleClass("slideup");
  if ($(`.pageSettings .settingsGroup.${group}`).hasClass("slideup")) {
    $(`.pageSettings .sectionGroupTitle[group=${group}] .fas`)
      .stop(true, true)
      .animate(
        {
          deg: -90,
        },
        {
          duration: 250,
          step: function (now) {
            $(this).css({ transform: "rotate(" + now + "deg)" });
          },
        }
      );
  } else {
    $(`.pageSettings .sectionGroupTitle[group=${group}] .fas`)
      .stop(true, true)
      .animate(
        {
          deg: 0,
        },
        {
          duration: 250,
          step: function (now) {
            $(this).css({ transform: "rotate(" + now + "deg)" });
          },
        }
      );
  }
});
