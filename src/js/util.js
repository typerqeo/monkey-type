export function focusWords() {
  if (!$("#wordsWrapper").hasClass("hidden")) {
    $("#wordsInput").focus();
  }
}

export function showBackgroundLoader() {
  $("#backgroundLoader").stop(true, true).fadeIn(125);
}

export function hideBackgroundLoader() {
  $("#backgroundLoader").stop(true, true).fadeOut(125);
}

export function showNotification(text, time) {
  let noti = $(".notification");
  noti.text(text);
  noti.css("top", `-${noti.outerHeight()}px`);
  noti.stop(true, false).animate(
    {
      top: "1rem",
    },
    250,
    "swing",
    () => {
      noti.stop(true, false).animate(
        {
          opacity: 1,
        },
        time,
        () => {
          noti.stop(true, false).animate(
            {
              top: `-${noti.outerHeight()}px`,
            },
            250,
            "swing",
            () => {
              noti.text("");
            }
          );
        }
      );
    }
  );
}
