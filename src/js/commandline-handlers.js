$("#commandLine input").keyup((e) => {
  if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13 || e.code == "Tab")
    return;
  updateSuggestedCommands();
});

$(document).ready((e) => {
  $(document).keydown((event) => {
    //escape
    if (
      (event.keyCode == 27 && !config.swapEscAndTab) ||
      (event["keyCode"] == 9 && config.swapEscAndTab)
    ) {
      event.preventDefault();
      if (!$("#leaderboardsWrapper").hasClass("hidden")) {
        //maybe add more condition for closing other dialogs in the future as well
        event.preventDefault();
        hideLeaderboards();
        return;
      } else if ($("#commandLineWrapper").hasClass("hidden")) {
        if (config.singleListCommandLine == "on")
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
        setFontFamily(config.fontFamily, true);
        if (config.customTheme === true) {
          applyCustomThemeColors();
        } else {
          setTheme(config.theme);
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
          //TODO: what is this for?
          // subgroup = obj.subgroup;
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
    setFontFamily(config.fontFamily, true);
    if (config.customTheme === true) {
      applyCustomThemeColors();
    } else {
      setTheme(config.theme, true);
    }
  }
});

$(document).keydown((e) => {
  if (isPreviewingTheme) {
    previewTheme(config.theme, false);
  }
  if (!$("#commandLineWrapper").hasClass("hidden")) {
    $("#commandLine input").focus();
    if (e.key == ">" && config.singleListCommandLine == "manual") {
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
      config.singleListCommandLine == "manual" &&
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
