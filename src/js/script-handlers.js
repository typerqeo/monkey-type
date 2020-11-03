$("#tagsWrapper").click((e) => {
  if ($(e.target).attr("id") === "tagsWrapper") {
    hideEditTags();
  }
});

$("#tagsWrapper #tagsEdit .button").click((e) => {
  tagsEdit();
});

$("#tagsWrapper #tagsEdit input").keypress((e) => {
  if (e.keyCode == 13) {
    tagsEdit();
  }
});

$("#customTextPopupWrapper").mousedown((e) => {
  if ($(e.target).attr("id") === "customTextPopupWrapper") {
    hideCustomTextPopup();
  }
});

$("#customTextPopup .inputs .check input").change((e) => {
  if ($("#customTextPopup .check input").prop("checked")) {
    $("#customTextPopup .inputs .wordcount").removeClass("hidden");
  } else {
    $("#customTextPopup .inputs .wordcount").addClass("hidden");
  }
});

$("#customTextPopup textarea").keypress((e) => {
  if (e.code === "Enter" && e.ctrlKey) {
    $("#customTextPopup .button").click();
  }
});

$("#customTextPopup .button").click((e) => {
  let text = $("#customTextPopup textarea").val();
  text = text.trim();
  text = text.replace(/[\n\r\t ]/gm, " ");
  text = text.replace(/ +/gm, " ");
  if ($("#customTextPopup .typographyCheck input").prop("checked")) {
    text = cleanTypographySymbols(text);
  }
  text = text.split(" ");
  // if (text.length >= 10000) {
  //   showNotification("Custom text cannot be longer than 10000 words.", 4000);
  //   changeMode("time");
  //   text = "The quick brown fox jumped over the lazy dog".split(" ");
  // } else {
  customText = text;
  customTextIsRandom = $("#customTextPopup .check input").prop("checked");
  // if (customTextIsRandom && customText.length < 3) {
  //   showNotification("Random custom text requires at least 3 words", 4000);
  //   customTextIsRandom = false;
  // }
  customTextWordCount = $("#customTextPopup .wordcount input").val();
  manualRestart = true;
  restartTest();
  // }
  hideCustomTextPopup();
});

$("#customMode2PopupWrapper").click((e) => {
  if ($(e.target).attr("id") === "customMode2PopupWrapper") {
    hideCustomMode2Popup();
  }
});

$("#customMode2Popup input").keypress((e) => {
  if (e.keyCode == 13) {
    applyMode2Popup();
  }
});

$("#customMode2Popup .button").click((e) => {
  applyMode2Popup();
});

$(document).on("click", "#top .logo", (e) => {
  changePage("test");
});

$(document).on("click", "#top .config .wordCount .text-button", (e) => {
  const wrd = $(e.currentTarget).attr("wordCount");
  if (wrd == "custom") {
    //   let newWrd = prompt("Custom word amount");
    //   if (newWrd !== null && !isNaN(newWrd) && newWrd > 0 && newWrd <= 10000) {
    //     changeWordCount(newWrd);
    //     if (newWrd > 2000) {
    //       showNotification(
    //         "Very long tests can cause performance issues or crash the website on some machines!",
    //         5000
    //       );
    //     }
    //   } else {
    //     showNotification(
    //       "Custom word amount can only be set between 1 and 10000",
    //       3000
    //     );
    //   }
    showCustomMode2Popup("words");
  } else {
    changeWordCount(wrd);
    manualRestart = true;
    restartTest();
  }
});

$(document).on("click", "#top .config .time .text-button", (e) => {
  let mode = $(e.currentTarget).attr("timeConfig");
  if (mode == "custom") {
    //   let newTime = prompt("Custom time in seconds");
    //   if (newTime !== null && !isNaN(newTime) && newTime > 0 && newTime <= 3600) {
    //     changeTimeConfig(newTime);
    //     if (newTime >= 1800) {
    //       showNotification(
    //         "Very long tests can cause performance issues or crash the website on some machines!",
    //         5000
    //       );
    //     }
    //   } else {
    //     showNotification("Custom time can only be set between 1 and 3600", 3000);
    //   }
    showCustomMode2Popup("time");
  } else {
    changeTimeConfig(mode);
    manualRestart = true;

    restartTest();
  }
});

$(document).on("click", "#top .config .quoteLength .text-button", (e) => {
  let len = $(e.currentTarget).attr("quoteLength");
  changeQuoteLength(len);
  manualRestart = true;
  restartTest();
});

$(document).on("click", "#top .config .customText .text-button", (e) => {
  // changeCustomText();
  // restartTest();
  showCustomTextPopup();
});

$(document).on("click", "#top .config .punctuationMode .text-button", (e) => {
  togglePunctuation();
  manualRestart = true;

  restartTest();
});

$(document).on("click", "#top .config .numbersMode .text-button", (e) => {
  toggleNumbers();
  manualRestart = true;

  restartTest();
});

$("#wordsWrapper").on("click", (e) => {
  focusWords();
});

$(document).on("click", "#top .config .mode .text-button", (e) => {
  if ($(e.currentTarget).hasClass("active")) return;
  const mode = $(e.currentTarget).attr("mode");
  changeMode(mode);
  manualRestart = true;
  restartTest();
});

$(document).on("click", "#top #menu .icon-button", (e) => {
  if ($(e.currentTarget).hasClass("discord")) return;
  if ($(e.currentTarget).hasClass("leaderboards")) {
    showLeaderboards();
  } else {
    const href = $(e.currentTarget).attr("href");
    manualRestart = true;
    changePage(href.replace("/", ""));
  }
});

$(window).on("popstate", (e) => {
  let state = e.originalEvent.state;
  if (state == "" || state == "/") {
    // show test
    changePage("test");
  } else if (state == "about") {
    // show about
    changePage("about");
  } else if (state == "account" || state == "login") {
    if (firebase.auth().currentUser) {
      changePage("account");
    } else {
      changePage("login");
    }
  }
});

$(document).on("keypress", "#restartTestButton", (event) => {
  if (event.keyCode == 13) {
    if (
      (config.mode === "words" && config.words < 1000) ||
      (config.mode === "time" && config.time < 3600) ||
      config.mode === "quote" ||
      (config.mode === "custom" &&
        customTextIsRandom &&
        customTextWordCount < 1000) ||
      (config.mode === "custom" &&
        !customTextIsRandom &&
        customText.length < 1000)
    ) {
      if (testActive) {
        let testNow = Date.now();
        let testSeconds = roundTo2((testNow - testStart) / 1000);
        incompleteTestSeconds += testSeconds;
        restartCount++;
      }
      restartTest();
    } else {
      showNotification("Quick restart disabled for long tests", 2000);
    }
  }
});

$(document.body).on("click", "#restartTestButton", (event) => {
  manualRestart = true;
  restartTest();
});

$(document).on("keypress", "#practiseMissedWordsButton", (event) => {
  if (event.keyCode == 13) {
    if (Object.keys(missedWords).length > 0) {
      initPractiseMissedWords();
    } else {
      showNotification("You haven't missed any words.", 2000);
    }
  }
});

$(document.body).on("click", "#practiseMissedWordsButton", (event) => {
  if (Object.keys(missedWords).length > 0) {
    initPractiseMissedWords();
  } else {
    showNotification("You haven't missed any words.", 2000);
  }
});

$(document).on("keypress", "#nextTestButton", (event) => {
  if (event.keyCode == 13) {
    restartTest();
  }
});

$(document.body).on("click", "#nextTestButton", (event) => {
  manualRestart = true;
  restartTest();
});

$(document).on("keypress", "#showWordHistoryButton", (event) => {
  if (event.keyCode == 13) {
    toggleResultWordsDisplay();
  }
});

$(document.body).on("click", "#showWordHistoryButton", (event) => {
  toggleResultWordsDisplay();
});

$(document.body).on("click", "#restartTestButtonWithSameWordset", (event) => {
  manualRestart = true;

  restartTest(true);
});

$(document).on("keypress", "#restartTestButtonWithSameWordset", (event) => {
  if (event.keyCode == 13) {
    restartTest(true);
  }
});

$(document.body).on("click", "#copyResultToClipboardButton", (event) => {
  copyResultToClipboard();
});

$(document.body).on("click", ".version", (event) => {
  $("#versionHistoryWrapper")
    .css("opacity", 0)
    .removeClass("hidden")
    .animate({ opacity: 1 }, 125);
});

$(document.body).on("click", "#versionHistoryWrapper", (event) => {
  $("#versionHistoryWrapper")
    .css("opacity", 1)
    .animate({ opacity: 0 }, 125, () => {
      $("#versionHistoryWrapper").addClass("hidden");
    });
});

$("#wordsInput").keypress((event) => {
  event.preventDefault();
});

//TODO: this shouldn't be here
let outOfFocusTimeouts = [];

$("#wordsInput").on("focus", (event) => {
  if (!resultVisible && config.showOutOfFocusWarning) {
    $("#words").css("transition", "none").removeClass("blurred");
    $(".outOfFocusWarning").addClass("hidden");
    clearTimeouts(outOfFocusTimeouts);
  }
  showCaret();
});

$("#wordsInput").on("focusout", (event) => {
  if (!resultVisible && config.showOutOfFocusWarning) {
    outOfFocusTimeouts.push(
      setTimeout(() => {
        $("#words").css("transition", "0.25s").addClass("blurred");
        $(".outOfFocusWarning").removeClass("hidden");
      }, 1000)
    );
  }
  hideCaret();
});

$(window).resize(() => {
  updateCaretPosition();
});

$(document).mousemove(function (event) {
  if (
    $("#top").hasClass("focus") &&
    (event.originalEvent.movementX > 0 || event.originalEvent.movementY > 0)
  ) {
    setFocus(false);
  }
});

$(document).on("click", "#testModesNotice .text-button", (event) => {
  let commands = eval($(event.currentTarget).attr("commands"));
  if (commands !== undefined) {
    currentCommands.push(commands);
    showCommandLine();
  }
});

//keypresses for the test, using different method to be more responsive
$(document).keydown(function (event) {
  if (!$("#wordsInput").is(":focus")) return;
  if (
    [
      "Tab",
      " ",
      "ContextMenu",
      "Escape",
      "Shift",
      "Control",
      "Meta",
      "Alt",
      "AltGraph",
      "CapsLock",
      "Backspace",
      "Enter",
      "PageUp",
      "PageDown",
      "Home",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "OS",
      "Insert",
      "Home",
      "Undefined",
      "Control",
      "Fn",
      "FnLock",
      "Hyper",
      "NumLock",
      "ScrollLock",
      "Symbol",
      "SymbolLock",
      "Super",
      "Unidentified",
      undefined,
    ].includes(event.key)
  )
    return;
  if (event.key.length > 1) return;
  if (/F\d+/.test(event.key)) return;
  if (/Numpad/.test(event.key)) return;
  if (/Volume/.test(event.key)) return;
  if (event.ctrlKey) return;
  event = emulateLayout(event);

  //start the test
  if (currentInput == "" && inputHistory.length == 0 && !testActive) {
    startTest();
  } else {
    if (!testActive) return;
  }

  if (event.key === "Dead") {
    playClickSound();
    $(
      document.querySelector("#words .word.active").querySelectorAll("letter")[
        currentInput.length
      ]
    ).toggleClass("dead");
    return;
  }

  let thisCharCorrect;

  let nextCharInWord = wordsList[currentWordIndex].substring(
    currentInput.length,
    currentInput.length + 1
  );

  if (
    config.language === "russian" &&
    (event["key"].toLowerCase() == "e" || event["key"].toLowerCase() == "ё")
  ) {
    if (
      nextCharInWord.toLowerCase() == "e" ||
      nextCharInWord.toLowerCase() == "ё"
    ) {
      thisCharCorrect = true;
    } else {
      thisCharCorrect = false;
    }
  } else {
    if (nextCharInWord == event["key"]) {
      thisCharCorrect = true;
    } else {
      thisCharCorrect = false;
    }
  }

  if (!thisCharCorrect) {
    accuracyStats.incorrect++;
    currentError.count++;
    currentError.words.push(currentWordIndex);
    thisCharCorrect = false;
    if (!Object.keys(missedWords).includes(wordsList[currentWordIndex])) {
      // missedWords.push(wordsList[currentWordIndex]);
      missedWords[wordsList[currentWordIndex]] = 1;
    } else {
      missedWords[wordsList[currentWordIndex]]++;
    }
  } else {
    accuracyStats.correct++;
    thisCharCorrect = true;
  }
  if (thisCharCorrect) {
    playClickSound();
  } else {
    if (!config.playSoundOnError || config.blindMode) {
      playClickSound();
    } else {
      playErrorSound();
    }
  }
  if (currentCorrected === "") {
    currentCorrected = currentInput + event["key"];
  } else {
    let cil = currentInput.length;
    if (cil >= currentCorrected.length) {
      currentCorrected += event["key"];
    } else if (!thisCharCorrect) {
      currentCorrected =
        currentCorrected.substring(0, cil) +
        event["key"] +
        currentCorrected.substring(cil + 1);
    }
  }
  currentKeypress.count++;
  currentKeypress.words.push(currentWordIndex);

  if (config.stopOnError == "letter" && !thisCharCorrect) {
    if (config.difficulty == "master") {
      //failed due to master diff when pressing a key
      inputHistory.push(currentInput);
      correctedHistory.push(currentCorrected);
      lastSecondNotRound = true;
      showResult(true);
      let testNow = Date.now();
      let testSeconds = roundTo2((testNow - testStart) / 1000);
      incompleteTestSeconds += testSeconds;
      restartCount++;
      return;
    } else {
      return;
    }
  }

  if (currentInput.length === 1 && currentWordIndex === 0) {
    activeWordTop = document.querySelector("#words .active").offsetTop;
  }

  if (currentInput.length < wordsList[currentWordIndex].length + 20)
    currentInput += event["key"];
  setFocus(true);
  stopCaretAnimation();
  activeWordTopBeforeJump = activeWordTop;
  compareInput(!config.blindMode);

  // let newActiveTop = $("#words .word.active").position().top;

  // console.time("offcheck1");
  let newActiveTop = document.querySelector("#words .word.active").offsetTop;
  if (activeWordTopBeforeJump < newActiveTop && !lineTransition) {
    activeWordJumped = true;
  } else {
    activeWordJumped = false;
  }

  if (activeWordJumped && currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
    compareInput(!config.blindMode);
    activeWordJumped = false;
  }

  // console.timeEnd("offcheck2");

  if (config.keymapMode === "react") {
    flashPressedKeymapKey(event.key, thisCharCorrect);
  } else if (config.keymapMode === "next") {
    updateHighlightedKeymapKey();
  }
  updateCaretPosition();
});

$(document).keydown((event) => {
  keypressStats.duration.current = performance.now();
  // if ($(".pageTest").hasClass("active")) {
  try {
    if (
      !config.capsLockBackspace &&
      event.originalEvent.getModifierState("CapsLock")
    ) {
      showCapsWarning();
    } else {
      hideCapsWarning();
    }
  } catch (e) {}
  // }
});

$(document).keyup((event) => {
  if (resultVisible) return;
  let now = performance.now();
  let diff = Math.abs(keypressStats.duration.current - now);
  if (keypressStats.duration.current !== -1) {
    keypressStats.duration.array.push(diff);
  }
  keypressStats.duration.current = now;
});

window.addEventListener("beforeunload", (event) => {
  // Cancel the event as stated by the standard.
  if (
    (config.mode === "words" && config.words < 1000) ||
    (config.mode === "time" && config.time < 3600) ||
    config.mode === "quote" ||
    (config.mode === "custom" &&
      customTextIsRandom &&
      customTextWordCount < 1000) ||
    (config.mode === "custom" &&
      !customTextIsRandom &&
      customText.length < 1000)
  ) {
  } else {
    if (testActive) {
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = "";
    }
  }
});

//handle keyboard events
$(document).keydown((event) => {
  if (!resultVisible) {
    let now = performance.now();
    let diff = Math.abs(keypressStats.spacing.current - now);
    if (keypressStats.spacing.current !== -1) {
      keypressStats.spacing.array.push(diff);
    }
    keypressStats.spacing.current = now;
  }

  //tab
  if (
    (event.key == "Tab" && !config.swapEscAndTab) ||
    (event.key == "Escape" && config.swapEscAndTab)
  ) {
    if (
      !event.ctrlKey &&
      config.quickTab &&
      !$(".pageLogin").hasClass("active") &&
      !resultCalculating &&
      $("#commandLineWrapper").hasClass("hidden") &&
      $("#simplePopupWrapper").hasClass("hidden")
    ) {
      event.preventDefault();
      if ($(".pageTest").hasClass("active")) {
        if (
          (config.mode === "words" && config.words < 1000) ||
          (config.mode === "time" && config.time < 3600) ||
          config.mode === "quote" ||
          (config.mode === "custom" &&
            customTextIsRandom &&
            customTextWordCount < 1000) ||
          (config.mode === "custom" &&
            !customTextIsRandom &&
            customText.length < 1000)
        ) {
          if (testActive) {
            let testNow = Date.now();
            let testSeconds = roundTo2((testNow - testStart) / 1000);
            incompleteTestSeconds += testSeconds;
            restartCount++;
          }
          restartTest();
        } else {
          showNotification("Quick restart disabled for long tests", 2000);
        }
      } else {
        changePage("test");
      }
    }
  }

  //only for the typing test
  if ($("#wordsInput").is(":focus")) {
    const isBackspace =
      event.key === "Backspace" ||
      (config.capsLockBackspace && event.key === "CapsLock");
    if (isBackspace) {
      event.preventDefault();
      if (!testActive) return;
      if (
        currentInput == "" &&
        inputHistory.length > 0 &&
        currentWordElementIndex > 0
      ) {
        if (
          (inputHistory[currentWordIndex - 1] ==
            wordsList[currentWordIndex - 1] &&
            !config.freedomMode) ||
          $($(".word")[currentWordIndex - 1]).hasClass("hidden")
        ) {
          return;
        } else {
          if (config.confidenceMode === "on" || config.confidenceMode === "max")
            return;
          if (event["ctrlKey"] || event["altKey"]) {
            currentInput = "";
            inputHistory.pop();
            correctedHistory.pop();
          } else {
            currentInput = inputHistory.pop();
            currentCorrected = correctedHistory.pop();
          }
          currentWordIndex--;
          currentWordElementIndex--;
          updateActiveElement();
          compareInput(!config.blindMode);
        }
      } else {
        if (config.confidenceMode === "max") return;
        if (event["ctrlKey"] || event["altKey"]) {
          currentInput = "";
        } else {
          currentInput = currentInput.substring(0, currentInput.length - 1);
        }
        compareInput(!config.blindMode);
      }
      playClickSound();
      if (config.keymapMode === "react") {
        flashPressedKeymapKey(event.code, true);
      } else if (config.keymapMode === "next") {
        updateHighlightedKeymapKey();
      }
      updateCaretPosition();
    }
    //space
    if (event.key === " ") {
      if (!testActive) return;
      if (currentInput == "") return;
      event.preventDefault();
      let currentWord = wordsList[currentWordIndex];
      // if (config.mode == "time") {
      if (!config.showAllLines || config.mode == "time") {
        // let currentTop = Math.floor($($("#words .word")[currentWordIndex]).position().top);
        // let nextTop = Math.floor($($("#words .word")[currentWordIndex + 1]).position().top);
        if (config.stopOnError != "off") {
          if (currentWord !== currentInput) return;
        }

        let currentTop = Math.floor(
          document.querySelectorAll("#words .word")[currentWordElementIndex]
            .offsetTop
        );
        let nextTop;
        try {
          nextTop = Math.floor(
            document.querySelectorAll("#words .word")[
              currentWordElementIndex + 1
            ].offsetTop
          );
        } catch (e) {
          nextTop = 0;
        }

        if ((nextTop > currentTop || activeWordJumped) && !lineTransition) {
          //last word of the line
          if (currentTestLine > 0) {
            let hideBound = currentTop;
            if (activeWordJumped) {
              hideBound = activeWordTopBeforeJump;
            }
            activeWordJumped = false;

            let toHide = [];
            let wordElements = $("#words .word");
            for (let i = 0; i < currentWordElementIndex + 1; i++) {
              if ($(wordElements[i]).hasClass("hidden")) continue;
              // let forWordTop = Math.floor($(wordElements[i]).position().top);
              let forWordTop = Math.floor(wordElements[i].offsetTop);
              if (forWordTop < hideBound - 10) {
                // $($("#words .word")[i]).addClass("hidden");
                toHide.push($($("#words .word")[i]));
              }
            }
            const wordHeight = $(document.querySelector(".word")).outerHeight(
              true
            );
            if (config.smoothLineScroll && toHide.length > 0) {
              lineTransition = true;
              $("#words").prepend(
                `<div class="smoothScroller" style="position: fixed;height:${wordHeight}px;width:100%"></div>`
              );
              $("#words .smoothScroller").animate(
                {
                  height: 0,
                },
                125,
                () => {
                  $("#words .smoothScroller").remove();
                }
              );
              $("#paceCaret").animate(
                {
                  top:
                    document.querySelector("#paceCaret").offsetTop - wordHeight,
                },
                125
              );
              $("#words").animate(
                {
                  marginTop: `-${wordHeight}px`,
                },
                125,
                () => {
                  activeWordTop = document.querySelector("#words .active")
                    .offsetTop;

                  currentWordElementIndex -= toHide.length;
                  lineTransition = false;
                  toHide.forEach((el) => el.remove());
                  $("#words").css("marginTop", "0");
                }
              );
            } else {
              toHide.forEach((el) => el.remove());
              currentWordElementIndex -= toHide.length;
              $("#paceCaret").css({
                top:
                  document.querySelector("#paceCaret").offsetTop - wordHeight,
              });
            }
            // if (config.smoothLineScroll) {
            //   let word = $(document.querySelector(".word"));
            //   $("#words").prepend(
            //     `<div class="smoothScroller" style="height:${word.outerHeight(
            //       true
            //     )}px;width:100%"></div>`
            //   );
            //   lineTransition = true;
            //   $("#words .smoothScroller").animate(
            //     {
            //       height: 0,
            //     },
            //     100,
            //     () => {
            //       $("#words .smoothScroller").remove();
            //       lineTransition = false;
            //       $(this).remove();
            //       activeWordTop = document.querySelector("#words .active")
            //         .offsetTop;
            //     }
            //   );
            // }
            // toHide.forEach((el) => el.remove());
          }
          currentTestLine++;
        }
      } //end of line wrap
      if (activeFunBox === "layoutfluid" && config.mode !== "time") {
        const layouts = ["qwerty", "dvorak", "colemak"];
        let index = 0;
        let outof = wordsList.length;
        index = Math.floor((inputHistory.length + 1) / (outof / 3));
        if (config.layout !== layouts[index] && layouts[index] !== undefined) {
          showNotification(`--- !!! ${layouts[index]} !!! ---`, 3000);
        }
        changeLayout(layouts[index]);
        changeKeymapLayout(layouts[index]);
        updateHighlightedKeymapKey();
        settingsGroups.layout.updateButton();
      }
      if (config.blindMode) $("#words .word.active letter").addClass("correct");
      // document
      //   .querySelector("#words .word.active")
      //   .setAttribute("input", currentInput);
      if (currentWord == currentInput) {
        //correct word
        if (
          paceCaret !== null &&
          paceCaret.wordsStatus[currentWordIndex] === true &&
          !config.blindMode
        ) {
          paceCaret.wordsStatus[currentWordIndex] = undefined;
          paceCaret.correction -= currentWord.length + 1;
        }
        accuracyStats.correct++;
        inputHistory.push(currentInput);
        currentInput = "";
        currentWordIndex++;
        currentWordElementIndex++;
        updateActiveElement();
        updateCaretPosition();
        currentKeypress.count++;
        currentKeypress.words.push(currentWordIndex);
        playClickSound();
      } else {
        //incorrect word
        if (
          paceCaret !== null &&
          paceCaret.wordsStatus[currentWordIndex] === undefined &&
          !config.blindMode
        ) {
          paceCaret.wordsStatus[currentWordIndex] = true;
          paceCaret.correction += currentWord.length + 1;
        }
        if (!config.playSoundOnError || config.blindMode) {
          playClickSound();
        } else {
          playErrorSound();
        }
        accuracyStats.incorrect++;
        let cil = currentInput.length;
        if (cil < wordsList[currentWordIndex].length) {
          if (cil >= currentCorrected.length) {
            currentCorrected += "_";
          } else {
            currentCorrected =
              currentCorrected.substring(0, cil) +
              "_" +
              currentCorrected.substring(cil + 1);
          }
        }
        if (config.stopOnError != "off") {
          if (config.difficulty == "expert" || config.difficulty == "master") {
            //failed due to diff when pressing space
            inputHistory.push(currentInput);
            correctedHistory.push(currentCorrected);
            lastSecondNotRound = true;
            showResult(true);
            // if (!afkDetected) {
            let testNow = Date.now();
            let testSeconds = roundTo2((testNow - testStart) / 1000);
            incompleteTestSeconds += testSeconds;
            restartCount++;
            // }
            return;
          }
          return;
        }
        inputHistory.push(currentInput);
        highlightBadWord(currentWordElementIndex, !config.blindMode);
        currentInput = "";
        currentWordIndex++;
        currentWordElementIndex++;
        if (config.difficulty == "expert" || config.difficulty == "master") {
          correctedHistory.push(currentCorrected);
          currentCorrected = "";
          //submitted last word incorrect and failed test
          lastSecondNotRound = true;
          showResult(true);
          // if (!afkDetected) {
          let testNow = Date.now();
          let testSeconds = roundTo2((testNow - testStart) / 1000);
          incompleteTestSeconds += testSeconds;
          restartCount++;
          // }
          return;
        } else if (currentWordIndex == wordsList.length) {
          //submitted last word that is incorrect
          lastSecondNotRound = true;
          showResult();
          return;
        }
        updateActiveElement();
        updateCaretPosition();
        currentKeypress.count++;
        currentKeypress.words.push(currentWordIndex);
      }
      correctedHistory.push(currentCorrected);
      currentCorrected = "";
      if (config.keymapMode === "react") {
        flashPressedKeymapKey(event.code, true);
      } else if (config.keymapMode === "next") {
        updateHighlightedKeymapKey();
      }
      if (
        config.mode === "words" ||
        config.mode === "custom" ||
        config.mode === "quote"
      ) {
        updateTimer();
      }
      // if (config.showAllLines) {
      //   if (config.mode == "time") {
      //     addWord();
      //   }
      // } else {
      if (
        config.mode == "time" ||
        config.mode == "words" ||
        config.mode == "custom"
      ) {
        addWord();
      }
      // }
    }
  }
});

$(document).on("mouseenter", "#resultWordsHistory .words .word", (e) => {
  if (resultVisible) {
    let input = $(e.currentTarget).attr("input");
    if (input != undefined)
      $(e.currentTarget).append(`<div class="wordInputAfter">${input}</div>`);
  }
});

$(document).on("click", "#bottom .leftright .right .current-theme", (e) => {
  if (config.customTheme) {
    togglePresetCustomTheme();
  }
  currentCommands.push(commandsThemes);
  showCommandLine();
});

$(document).on("mouseleave", "#resultWordsHistory .words .word", (e) => {
  $(".wordInputAfter").remove();
});

$("#wpmChart").on("mouseleave", (e) => {
  $(".wordInputAfter").remove();
});

$(document).ready(() => {
  updateFavicon(32, 14);
  $("body").css("transition", ".25s");
  // manualRestart = true;
  // restartTest(false,true);
  if (config.quickTab) {
    $("#restartTestButton").addClass("hidden");
  }
  $("#centerContent")
    .css("opacity", "0")
    .removeClass("hidden")
    .stop(true, true)
    .animate({ opacity: 1 }, 250, () => {
      let theme = findGetParameter("customTheme");
      if (theme !== null) {
        try {
          theme = theme.split(",");
          config.customThemeColors = theme;
          showNotification("Custom theme applied", 1000);
        } catch (e) {
          showNotification(
            "Something went wrong. Reverting to default custom colors.",
            3000
          );
          config.customThemeColors = defaultConfig.customThemeColors;
        }
        setCustomTheme(true);
        setCustomThemeInputs();
        applyCustomThemeColors();
      }
      if (window.location.pathname === "/verify") {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        if (fragment.has("access_token")) {
          const accessToken = fragment.get("access_token");
          const tokenType = fragment.get("token_type");
          verifyUserWhenLoggedIn = {
            accessToken: accessToken,
            tokenType: tokenType,
          };
          history.replaceState("/", null, "/");
        }
      } else if (window.location.pathname === "/account") {
        history.replaceState("/", null, "/");
      } else if (window.location.pathname !== "/") {
        let page = window.location.pathname.replace("/", "");
        changePage(page);
      }
    });
});

$(".scrollToTopButton").click((event) => {
  window.scrollTo(0, 0);
});

$(".pageTest #copyWordsListButton").click(async (event) => {
  try {
    await navigator.clipboard.writeText(
      wordsList.slice(0, inputHistory.length).join(" ")
    );
    showNotification("Copied to clipboard", 1000);
  } catch (e) {
    showNotification("Could not copy to clipboard: " + e, 5000);
  }
});

//stop space scrolling
window.addEventListener("keydown", function (e) {
  if (e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});
