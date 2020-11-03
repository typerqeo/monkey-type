firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    if (user.emailVerified === false) {
      $(".pageAccount .content").prepend(
        `<p style="text-align:center">Your account is not verified. Click <a onClick="sendVerificationEmail()">here</a> to resend the verification email.`
      );
    }
    updateAccountLoginButton();
    accountIconLoading(true);
    getAccountDataAndInit();
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    // showNotification('Signed in', 1000);
    $(".pageLogin .preloader").addClass("hidden");
    $("#menu .icon-button.account .text").text(displayName);

    showFavouriteThemesAtTheTop();

    let text = "Account created on " + user.metadata.creationTime;

    const date1 = new Date(user.metadata.creationTime);
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    text += ` (${diffDays} days ago)`;

    $(".pageAccount .group.createdDate").text(text);

    if (verifyUserWhenLoggedIn !== null) {
      showNotification("Verifying", 1000);
      verifyUserWhenLoggedIn.uid = user.uid;
      verifyUser(verifyUserWhenLoggedIn).then((data) => {
        showNotification(data.data.message, 3000);
        if (data.data.status === 1) {
          dbSnapshot.discordId = data.data.did;
          updateDiscordSettingsSection();
        }
      });
    }
  }
});

$(".pageLogin .register input").keyup((e) => {
  if ($(".pageLogin .register .button").hasClass("disabled")) return;
  if (e.key == "Enter") {
    signUp();
  }
});

$(".pageLogin .register .button").click((e) => {
  if ($(".pageLogin .register .button").hasClass("disabled")) return;
  signUp();
});

$(".pageLogin .login input").keyup((e) => {
  if (e.key == "Enter") {
    configChangedBeforeDb = false;
    signIn();
  }
});

$(".pageLogin .login .button").click((e) => {
  configChangedBeforeDb = false;
  signIn();
});

$(".signOut").click((e) => {
  signOut();
});

$(".pageAccount .loadMoreButton").click((e) => {
  loadMoreLines();
});

$(".pageLogin #forgotPasswordButton").click((e) => {
  let email = prompt("Email address");
  if (email) {
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(function () {
        // Email sent.
        showNotification("Email sent", 2000);
      })
      .catch(function (error) {
        // An error happened.
        showNotification(error.message, 5000);
      });
  }
});

$(document).on("click", ".pageAccount .hoverChartButton", (event) => {
  console.log("updating");
  let filterid = $(event.currentTarget).attr("filteredResultsId");
  if (filterid === undefined) return;
  updateHoverChart(filterid);
  showHoverChart();
  updateHoverChartPosition(
    event.pageX - $(".pageAccount .hoverChartWrapper").outerWidth(),
    event.pageY + 30
  );
});

$(document).on("click", ".pageAccount .hoverChartBg", (event) => {
  hideHoverChart();
});

$(".pageAccount .topFilters .button.allFilters").click((e) => {
  Object.keys(config.resultFilters).forEach((group) => {
    Object.keys(config.resultFilters[group]).forEach((filter) => {
      if (group === "date") {
        config.resultFilters[group][filter] = false;
      } else {
        config.resultFilters[group][filter] = true;
      }
    });
  });
  config.resultFilters.date.all = true;
  showActiveFilters();
  saveConfigToCookie();
});

$(".pageAccount .topFilters .button.currentConfigFilter").click((e) => {
  Object.keys(config.resultFilters).forEach((group) => {
    Object.keys(config.resultFilters[group]).forEach((filter) => {
      config.resultFilters[group][filter] = false;
    });
  });

  config.resultFilters.difficulty[config.difficulty] = true;
  config.resultFilters.mode[config.mode] = true;
  if (config.mode === "time") {
    config.resultFilters.time[config.time] = true;
  } else if (config.mode === "words") {
    config.resultFilters.words[config.words] = true;
  }
  if (config.punctuation) {
    config.resultFilters.punctuation.on = true;
  } else {
    config.resultFilters.punctuation.off = true;
  }
  if (config.numbers) {
    config.resultFilters.numbers.on = true;
  } else {
    config.resultFilters.numbers.off = true;
  }
  config.resultFilters.language[config.language] = true;
  config.resultFilters.funbox[activeFunBox] = true;
  config.resultFilters.tags.none = true;
  dbSnapshot.tags.forEach((tag) => {
    if (tag.active === true) {
      config.resultFilters.tags.none = false;
      config.resultFilters.tags[tag.id] = true;
    }
  });

  config.resultFilters.date.all = true;

  showActiveFilters();
  saveConfigToCookie();
});

$(".pageAccount .topFilters .button.toggleAdvancedFilters").click((e) => {
  $(".pageAccount .filterButtons").slideToggle(250);
  $(".pageAccount .topFilters .button.toggleAdvancedFilters").toggleClass(
    "active"
  );
});

$(
  ".pageAccount .filterButtons .buttonsAndTitle .buttons, .pageAccount .group.topFilters .buttonsAndTitle.testDate .buttons"
).click(".button", (e) => {
  const filter = $(e.target).attr("filter");
  const group = $(e.target).parents(".buttons").attr("group");
  // toggleFilterButton(filter);
  if ($(e.target).hasClass("allFilters")) {
    Object.keys(config.resultFilters).forEach((group) => {
      Object.keys(config.resultFilters[group]).forEach((filter) => {
        if (group === "date") {
          config.resultFilters[group][filter] = false;
        } else {
          config.resultFilters[group][filter] = true;
        }
      });
    });
    config.resultFilters.date.all = true;
  } else if ($(e.target).hasClass("noFilters")) {
    Object.keys(config.resultFilters).forEach((group) => {
      if (group !== "date") {
        Object.keys(config.resultFilters[group]).forEach((filter) => {
          config.resultFilters[group][filter] = false;
        });
      }
    });
  } else {
    if (e.shiftKey) {
      Object.keys(config.resultFilters[group]).forEach((filter) => {
        config.resultFilters[group][filter] = false;
      });
      setFilter(group, filter, true);
    } else {
      toggleFilter(group, filter);
    }
  }
  showActiveFilters();
  saveConfigToCookie();
});

$(".pageAccount .toggleAccuracyOnChart").click((params) => {
  toggleChartAccuracy();
});

$(".pageAccount .toggleChartStyle").click((params) => {
  toggleChartStyle();
});

$(document).on("click", ".pageAccount .group.history #resultEditTags", (f) => {
  if (dbSnapshot.tags.length > 0) {
    let resultid = $(f.target).parents("span").attr("resultid");
    let tags = $(f.target).parents("span").attr("tags");
    $("#resultEditTagsPanel").attr("resultid", resultid);
    $("#resultEditTagsPanel").attr("tags", tags);
    updateActiveResultEditTagsPanelButtons(JSON.parse(tags));
    showResultEditTagsPanel();
  }
});

$(document).on("click", "#resultEditTagsPanelWrapper .button.tag", (f) => {
  $(f.target).toggleClass("active");
});

$("#resultEditTagsPanelWrapper").click((e) => {
  if ($(e.target).attr("id") === "resultEditTagsPanelWrapper") {
    hideResultEditTagsPanel();
  }
});

$("#resultEditTagsPanel .confirmButton").click((f) => {
  let resultid = $("#resultEditTagsPanel").attr("resultid");
  let oldtags = JSON.parse($("#resultEditTagsPanel").attr("tags"));

  let newtags = [];
  $.each($("#resultEditTagsPanel .buttons .button"), (index, obj) => {
    let tagid = $(obj).attr("tagid");
    if ($(obj).hasClass("active")) {
      newtags.push(tagid);
    }
  });
  showBackgroundLoader();
  hideResultEditTagsPanel();
  updateResultTags({
    uid: firebase.auth().currentUser.uid,
    tags: newtags,
    resultid: resultid,
  }).then((r) => {
    hideBackgroundLoader();
    if (r.data.resultCode === 1) {
      showNotification("Tags updated.", 3000);
      dbSnapshot.results.forEach((result) => {
        if (result.id === resultid) {
          result.tags = newtags;
        }
      });

      let tagNames = "";

      if (newtags.length > 0) {
        newtags.forEach((tag) => {
          dbSnapshot.tags.forEach((snaptag) => {
            if (tag === snaptag.id) {
              tagNames += snaptag.name + ", ";
            }
          });
        });
        tagNames = tagNames.substring(0, tagNames.length - 2);
      }

      let restags;
      if (newtags === undefined) {
        restags = "[]";
      } else {
        restags = JSON.stringify(newtags);
      }

      $(`.pageAccount #resultEditTags[resultid='${resultid}']`).attr(
        "tags",
        restags
      );
      if (newtags.length > 0) {
        $(`.pageAccount #resultEditTags[resultid='${resultid}']`).css(
          "opacity",
          1
        );
        $(`.pageAccount #resultEditTags[resultid='${resultid}']`).attr(
          "aria-label",
          tagNames
        );
      } else {
        $(`.pageAccount #resultEditTags[resultid='${resultid}']`).css(
          "opacity",
          0.25
        );
        $(`.pageAccount #resultEditTags[resultid='${resultid}']`).attr(
          "aria-label",
          "no tags"
        );
      }

      // refreshAccountPage();
    } else {
      showNotification("Error updating tags", 3000);
    }
  });
});
