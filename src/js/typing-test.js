export const Globals = {
  restartCount: 0,
  testActive: false,
  activeFunBox: "none",
  customText: "The quick brown fox jumps over the lazy dog".split(" "),
  customTextIsRandom: false,
  customTextWordCount: 1,
  focusState: false,
  verifyUserWhenLoggedIn: null,
  notSignedInLastResult: null,
  bailout: false,
  themeColors: {
    bg: "#323437",
    main: "#e2b714",
    caret: "#e2b714",
    sub: "#646669",
    text: "#d1d0c5",
    error: "#ca4754",
    errorExtra: "#7e2a33",
    colorfulError: "#ca4754",
    colorfulErrorExtra: "#7e2a33",
  },
};

let caretAnimating = true;

export function stopCaretAnimation() {
  if (caretAnimating === true) {
    $("#caret").css("animation-name", "none");
    $("#caret").css("opacity", "1");
    caretAnimating = false;
  }
}

export function startCaretAnimation() {
  if (caretAnimating === false) {
    $("#caret").css("animation-name", "caretFlash");
    caretAnimating = true;
  }
}

export function refreshThemeColorObject() {
  let st = getComputedStyle(document.body);

  Globals.themeColors.bg = st.getPropertyValue("--bg-color").replace(" ", "");
  Globals.themeColors.main = st
    .getPropertyValue("--main-color")
    .replace(" ", "");
  Globals.themeColors.caret = st
    .getPropertyValue("--caret-color")
    .replace(" ", "");
  Globals.themeColors.sub = st.getPropertyValue("--sub-color").replace(" ", "");
  Globals.themeColors.text = st
    .getPropertyValue("--text-color")
    .replace(" ", "");
  Globals.themeColors.error = st
    .getPropertyValue("--error-color")
    .replace(" ", "");
  Globals.themeColors.errorExtra = st
    .getPropertyValue("--error-extra-color")
    .replace(" ", "");
  Globals.themeColors.colorfulError = st
    .getPropertyValue("--colorful-error-color")
    .replace(" ", "");
  Globals.themeColors.colorfulErrorExtra = st
    .getPropertyValue("--colorful-error-extra-color")
    .replace(" ", "");
}

export function setFocus(foc) {
  if (foc && !Globals.focusState) {
    Globals.focusState = true;
    stopCaretAnimation();
    $("#top").addClass("focus");
    $("#bottom").addClass("focus");
    $("body").css("cursor", "none");
    $("#middle").addClass("focus");
  } else if (!foc && Globals.focusState) {
    Globals.focusState = false;
    if (Globals.testActive) {
      stopCaretAnimation();
    } else {
      startCaretAnimation();
    }
    $("#top").removeClass("focus");
    $("#bottom").removeClass("focus");
    $("body").css("cursor", "default");
    $("#middle").removeClass("focus");
  }
}
