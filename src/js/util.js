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

export function accountIconLoading(truefalse) {
  if (truefalse) {
    $("#top #menu .account .icon").html(
      '<i class="fas fa-fw fa-spin fa-circle-notch"></i>'
    );
    $("#top #menu .account").css("opacity", 1);
  } else {
    $("#top #menu .account .icon").html('<i class="fas fa-fw fa-user"></i>');
    $("#top #menu .account").css("opacity", 1);
  }
}

export function showEditTags(action, id, name) {
  if (action === "add") {
    $("#tagsWrapper #tagsEdit").attr("action", "add");
    $("#tagsWrapper #tagsEdit .title").html("Add new tag");
    $("#tagsWrapper #tagsEdit .button").html(`<i class="fas fa-plus"></i>`);
    $("#tagsWrapper #tagsEdit input").val("");
    $("#tagsWrapper #tagsEdit input").removeClass("hidden");
  } else if (action === "edit") {
    $("#tagsWrapper #tagsEdit").attr("action", "edit");
    $("#tagsWrapper #tagsEdit").attr("tagid", id);
    $("#tagsWrapper #tagsEdit .title").html("Edit tag name");
    $("#tagsWrapper #tagsEdit .button").html(`<i class="fas fa-pen"></i>`);
    $("#tagsWrapper #tagsEdit input").val(name);
    $("#tagsWrapper #tagsEdit input").removeClass("hidden");
  } else if (action === "remove") {
    $("#tagsWrapper #tagsEdit").attr("action", "remove");
    $("#tagsWrapper #tagsEdit").attr("tagid", id);
    $("#tagsWrapper #tagsEdit .title").html("Remove tag " + name);
    $("#tagsWrapper #tagsEdit .button").html(`<i class="fas fa-check"></i>`);
    $("#tagsWrapper #tagsEdit input").addClass("hidden");
  }

  if ($("#tagsWrapper").hasClass("hidden")) {
    $("#tagsWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 100, (e) => {
        $("#tagsWrapper #tagsEdit input").focus();
      });
  }
}

export function hideEditTags() {
  if (!$("#tagsWrapper").hasClass("hidden")) {
    $("#tagsWrapper #tagsEdit").attr("action", "");
    $("#tagsWrapper #tagsEdit").attr("tagid", "");
    $("#tagsWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        100,
        (e) => {
          $("#tagsWrapper").addClass("hidden");
        }
      );
  }
}

export function swapElements(
  el1,
  el2,
  totalDuration,
  callback = function () {
    return;
  }
) {
  if (
    (el1.hasClass("hidden") && !el2.hasClass("hidden")) ||
    (!el1.hasClass("hidden") && el2.hasClass("hidden"))
  ) {
    //one of them is hidden and the other is visible
    if (el1.hasClass("hidden")) {
      callback();
      return false;
    }
    $(el1)
      .removeClass("hidden")
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        totalDuration / 2,
        () => {
          $(el1).addClass("hidden");
          $(el2)
            .removeClass("hidden")
            .css("opacity", 0)
            .animate(
              {
                opacity: 1,
              },
              totalDuration / 2,
              () => {
                callback();
              }
            );
        }
      );
  } else if (el1.hasClass("hidden") && el2.hasClass("hidden")) {
    //both are hidden, only fade in the second
    $(el2)
      .removeClass("hidden")
      .css("opacity", 0)
      .animate(
        {
          opacity: 1,
        },
        totalDuration,
        () => {
          callback();
        }
      );
  } else {
    callback();
  }
}

export function updateAccountLoginButton() {
  if (firebase.auth().currentUser != null) {
    swapElements(
      $("#menu .icon-button.login"),
      $("#menu .icon-button.account"),
      250
    );
    // $("#menu .icon-button.account").removeClass('hidden');
    // $("#menu .icon-button.login").addClass('hidden');
  } else {
    swapElements(
      $("#menu .icon-button.account"),
      $("#menu .icon-button.login"),
      250
    );
    // $("#menu .icon-button.login").removeClass('hidden');
    // $("#menu .icon-button.account").addClass('hidden');
  }
}
