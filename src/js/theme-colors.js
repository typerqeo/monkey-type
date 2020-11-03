let themeColors = {
  bg: "#323437",
  main: "#e2b714",
  caret: "#e2b714",
  sub: "#646669",
  text: "#d1d0c5",
  error: "#ca4754",
  errorExtra: "#7e2a33",
  colorfulError: "#ca4754",
  colorfulErrorExtra: "#7e2a33",
};

function refreshThemeColorObject() {
  let st = getComputedStyle(document.body);

  themeColors.bg = st.getPropertyValue("--bg-color").replace(" ", "");
  themeColors.main = st.getPropertyValue("--main-color").replace(" ", "");
  themeColors.caret = st.getPropertyValue("--caret-color").replace(" ", "");
  themeColors.sub = st.getPropertyValue("--sub-color").replace(" ", "");
  themeColors.text = st.getPropertyValue("--text-color").replace(" ", "");
  themeColors.error = st.getPropertyValue("--error-color").replace(" ", "");
  themeColors.errorExtra = st
    .getPropertyValue("--error-extra-color")
    .replace(" ", "");
  themeColors.colorfulError = st
    .getPropertyValue("--colorful-error-color")
    .replace(" ", "");
  themeColors.colorfulErrorExtra = st
    .getPropertyValue("--colorful-error-extra-color")
    .replace(" ", "");
}
