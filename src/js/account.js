function showSignOutButton() {
  $(".signOut").removeClass("hidden").css("opacity", 1);
}

function hideSignOutButton() {
  $(".signOut").css("opacity", 0).addClass("hidden");
}

function signIn() {
  $(".pageLogin .preloader").removeClass("hidden");
  let email = $(".pageLogin .login input")[0].value;
  let password = $(".pageLogin .login input")[1].value;

  if ($(".pageLogin .login #rememberMe input").prop("checked")) {
    //remember me
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(function () {
        return firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then((e) => {
            changePage("test");
          })
          .catch(function (error) {
            showNotification(error.message, 5000);
            $(".pageLogin .preloader").addClass("hidden");
          });
      });
  } else {
    //dont remember
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(function () {
        return firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then((e) => {
            changePage("test");
          })
          .catch(function (error) {
            showNotification(error.message, 5000);
            $(".pageLogin .preloader").addClass("hidden");
          });
      });
  }
}

let dontCheckUserName = false;

function signUp() {
  $(".pageLogin .register .button").addClass("disabled");
  $(".pageLogin .preloader").removeClass("hidden");
  let nname = $(".pageLogin .register input")[0].value;
  let email = $(".pageLogin .register input")[1].value;
  let password = $(".pageLogin .register input")[2].value;
  let passwordVerify = $(".pageLogin .register input")[3].value;

  if (password != passwordVerify) {
    showNotification("Passwords do not match", 3000);
    $(".pageLogin .preloader").addClass("hidden");
    $(".pageLogin .register .button").removeClass("disabled");
    return;
  }

  const namecheck = firebase.functions().httpsCallable("checkNameAvailability");

  namecheck({ name: nname }).then((d) => {
    if (d.data === -1) {
      showNotification("Name unavailable", 3000);
      $(".pageLogin .preloader").addClass("hidden");
      $(".pageLogin .register .button").removeClass("disabled");
      return;
    } else if (d.data === -2) {
      showNotification(
        "Name cannot contain special characters or contain more than 14 characters. Can include _ . and -",
        8000
      );
      $(".pageLogin .preloader").addClass("hidden");
      $(".pageLogin .register .button").removeClass("disabled");
      return;
    } else if (d.data === 1) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((user) => {
          // Account has been created here.
          dontCheckUserName = true;
          let usr = user.user;
          usr
            .updateProfile({
              displayName: nname,
            })
            .then(async function () {
              // Update successful.
              await firebase
                .firestore()
                .collection("users")
                .doc(usr.uid)
                .set({ name: nname }, { merge: true });
              reserveName({ name: nname, uid: usr.uid });
              usr.sendEmailVerification();
              clearGlobalStats();
              showNotification("Account created", 2000);
              $("#menu .icon-button.account .text").text(nname);
              try {
                firebase.analytics().logEvent("accountCreated", usr.uid);
              } catch (e) {
                console.log("Analytics unavailable");
              }
              $(".pageLogin .preloader").addClass("hidden");
              dbSnapshot = {
                results: [],
                personalBests: {},
                tags: [],
                globalStats: {
                  time: undefined,
                  started: undefined,
                  completed: undefined,
                },
              };
              if (notSignedInLastResult !== null) {
                notSignedInLastResult.uid = usr.uid;
                testCompleted({
                  uid: usr.uid,
                  obj: notSignedInLastResult,
                });
                dbSnapshot.results.push(notSignedInLastResult);
                config.resultFilters = defaultAccountFilters;
              }
              changePage("account");
              usr.sendEmailVerification();
              $(".pageLogin .register .button").removeClass("disabled");
            })
            .catch(function (error) {
              // An error happened.
              $(".pageLogin .register .button").removeClass("disabled");
              console.error(error);
              usr
                .delete()
                .then(function () {
                  // User deleted.
                  showNotification(
                    "An error occured. Account not created.",
                    2000
                  );
                  $(".pageLogin .preloader").addClass("hidden");
                })
                .catch(function (error) {
                  // An error happened.
                  $(".pageLogin .preloader").addClass("hidden");
                  console.error(error);
                });
            });
        })
        .catch(function (error) {
          // Handle Errors here.
          $(".pageLogin .register .button").removeClass("disabled");
          var errorMessage = error.message;
          showNotification(errorMessage, 5000);
          $(".pageLogin .preloader").addClass("hidden");
        });
    }
  });
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      showNotification("Signed out", 2000);
      clearGlobalStats();
      hideAccountSettingsSection();
      updateAccountLoginButton();
      changePage("login");
      dbSnapshot = null;
    })
    .catch(function (error) {
      showNotification(error.message, 5000);
    });
}

function sendVerificationEmail() {
  let cu = firebase.auth().currentUser;
  cu.sendEmailVerification()
    .then((e) => {
      showNotification("Email sent to " + cu.email, 4000);
    })
    .catch((e) => {
      showNotification("Error: " + e.message, 3000);
      console.error(e.message);
    });
}

function getAccountDataAndInit() {
  db_getUserSnapshot()
    .then((e) => {
      if (dbSnapshot === null) {
        throw "Missing db snapshot. Client likely could not connect to the backend.";
      }
      initPaceCaret(true);
      if (!configChangedBeforeDb) {
        if (cookieConfig === null) {
          accountIconLoading(false);
          applyConfig(dbSnapshot.config);
          // showNotification('Applying db config',3000);
          updateSettingsPage();
          saveConfigToCookie(true);
          restartTest(false, true);
        } else if (dbSnapshot.config !== undefined) {
          let configsDifferent = false;
          Object.keys(config).forEach((key) => {
            if (!configsDifferent) {
              try {
                if (key !== "resultFilters") {
                  if (Array.isArray(config[key])) {
                    config[key].forEach((arrval, index) => {
                      if (arrval != dbSnapshot.config[key][index]) {
                        configsDifferent = true;
                        console.log(
                          `.config is different: ${arrval} != ${dbSnapshot.config[key][index]}`
                        );
                      }
                    });
                  } else {
                    if (config[key] != dbSnapshot.config[key]) {
                      configsDifferent = true;
                      console.log(
                        `..config is different ${key}: ${config[key]} != ${dbSnapshot.config[key]}`
                      );
                    }
                  }
                }
              } catch (e) {
                console.log(e);
                configsDifferent = true;
                console.log(`...config is different: ${e.message}`);
              }
            }
          });
          if (configsDifferent) {
            console.log("applying config from db");
            accountIconLoading(false);
            config = dbSnapshot.config;
            applyConfig(config);
            updateSettingsPage();
            saveConfigToCookie(true);
            restartTest(false, true);
          }
        }
        dbConfigLoaded = true;
      } else {
        accountIconLoading(false);
      }
      try {
        if (
          config.resultFilters === undefined ||
          config.resultFilters === null ||
          config.resultFilters.difficulty === undefined
        ) {
          if (
            dbSnapshot.config.resultFilters == null ||
            dbSnapshot.config.resultFilters.difficulty === undefined
          ) {
            config.resultFilters = defaultAccountFilters;
          } else {
            config.resultFilters = dbSnapshot.config.resultFilters;
          }
        }
      } catch (e) {
        config.resultFilters = defaultAccountFilters;
      }
      if ($(".pageLogin").hasClass("active")) {
        changePage("account");
      }
      refreshThemeButtons();
      accountIconLoading(false);
      updateFilterTags();
      updateCommandsTagsList();
      loadActiveTagsFromCookie();
      updateResultEditTagsPanelButtons();
      showAccountSettingsSection();
    })
    .catch((e) => {
      accountIconLoading(false);
      console.error(e);
      showNotification(
        "Error downloading user data. Refresh to try again. If error persists contact Miodec.",
        5000
      );
      $("#top #menu .account .icon").html('<i class="fas fa-fw fa-times"></i>');
      $("#top #menu .account").css("opacity", 1);
    });
}

function updateHoverChart(filteredId) {
  let data = filteredResults[filteredId].chartData;
  let labels = [];
  for (let i = 1; i <= data.wpm.length; i++) {
    labels.push(i.toString());
  }
  hoverChart.data.labels = labels;
  hoverChart.data.datasets[0].data = data.wpm;
  hoverChart.data.datasets[1].data = data.raw;
  hoverChart.data.datasets[2].data = data.err;

  hoverChart.options.scales.xAxes[0].ticks.minor.fontColor = themeColors.sub;
  hoverChart.options.scales.xAxes[0].scaleLabel.fontColor = themeColors.sub;
  hoverChart.options.scales.yAxes[0].ticks.minor.fontColor = themeColors.sub;
  hoverChart.options.scales.yAxes[2].ticks.minor.fontColor = themeColors.sub;
  hoverChart.options.scales.yAxes[0].scaleLabel.fontColor = themeColors.sub;
  hoverChart.options.scales.yAxes[2].scaleLabel.fontColor = themeColors.sub;

  hoverChart.data.datasets[0].borderColor = themeColors.main;
  hoverChart.data.datasets[0].pointBackgroundColor = themeColors.main;
  hoverChart.data.datasets[1].borderColor = themeColors.sub;
  hoverChart.data.datasets[1].pointBackgroundColor = themeColors.sub;

  hoverChart.options.annotation.annotations[0].borderColor = themeColors.sub;
  hoverChart.options.annotation.annotations[0].label.backgroundColor =
    themeColors.sub;
  hoverChart.options.annotation.annotations[0].label.fontColor = themeColors.bg;

  let maxChartVal = Math.max(...[Math.max(...data.wpm), Math.max(...data.raw)]);
  let minChartVal = Math.min(...[Math.min(...data.wpm), Math.min(...data.raw)]);
  hoverChart.options.scales.yAxes[0].ticks.max = Math.round(maxChartVal);
  hoverChart.options.scales.yAxes[1].ticks.max = Math.round(maxChartVal);

  if (!config.startGraphsAtZero) {
    hoverChart.options.scales.yAxes[0].ticks.min = Math.round(minChartVal);
    hoverChart.options.scales.yAxes[1].ticks.min = Math.round(minChartVal);
  } else {
    hoverChart.options.scales.yAxes[0].ticks.min = 0;
    hoverChart.options.scales.yAxes[1].ticks.min = 0;
  }

  hoverChart.update({ duration: 0 });
}

function showHoverChart() {
  $(".pageAccount .hoverChartWrapper").stop(true, true).fadeIn(125);
  $(".pageAccount .hoverChartBg").stop(true, true).fadeIn(125);
}

function hideHoverChart() {
  $(".pageAccount .hoverChartWrapper").stop(true, true).fadeOut(125);
  $(".pageAccount .hoverChartBg").stop(true, true).fadeOut(125);
}

function updateHoverChartPosition(x, y) {
  $(".pageAccount .hoverChartWrapper").css({ top: y, left: x });
}

// $(document).on("mouseleave", ".pageAccount .hoverChartButton", (event) => {
//   hideHoverChart();
// });

let defaultAccountFilters = {
  difficulty: {
    normal: true,
    expert: true,
    master: true,
  },
  mode: {
    words: true,
    time: true,
    quote: true,
    custom: true,
  },
  words: {
    10: true,
    25: true,
    50: true,
    100: true,
    200: true,
    custom: true,
  },
  time: {
    15: true,
    30: true,
    60: true,
    120: true,
    custom: true,
  },
  punctuation: {
    on: true,
    off: true,
  },
  numbers: {
    on: true,
    off: true,
  },
  date: {
    last_day: false,
    last_week: false,
    last_month: false,
    all: true,
  },
  tags: {
    none: true,
  },
  language: {},
  funbox: {
    none: true,
  },
};

getLanguageList().then((languages) => {
  languages.forEach((language) => {
    $(
      ".pageAccount .content .filterButtons .buttonsAndTitle.languages .buttons"
    ).append(
      `<div class="button" filter="${language}">${language.replace(
        "_",
        " "
      )}</div>`
    );
    defaultAccountFilters.language[language] = true;
  });
});

$(
  ".pageAccount .content .filterButtons .buttonsAndTitle.funbox .buttons"
).append(`<div class="button" filter="none">none</div>`);

getFunboxList().then((funboxModes) => {
  funboxModes.forEach((funbox) => {
    $(
      ".pageAccount .content .filterButtons .buttonsAndTitle.funbox .buttons"
    ).append(
      `<div class="button" filter="${funbox.name}">${funbox.name.replace(
        /_/g,
        " "
      )}</div>`
    );
    defaultAccountFilters.funbox[funbox.name] = true;
  });
});

function updateFilterTags() {
  $(
    ".pageAccount .content .filterButtons .buttonsAndTitle.tags .buttons"
  ).empty();
  if (dbSnapshot.tags.length > 0) {
    $(".pageAccount .content .filterButtons .buttonsAndTitle.tags").removeClass(
      "hidden"
    );
    $(
      ".pageAccount .content .filterButtons .buttonsAndTitle.tags .buttons"
    ).append(`<div class="button" filter="none">no tag</div>`);
    dbSnapshot.tags.forEach((tag) => {
      defaultAccountFilters.tags[tag.id] = true;
      $(
        ".pageAccount .content .filterButtons .buttonsAndTitle.tags .buttons"
      ).append(`<div class="button" filter="${tag.id}">${tag.name}</div>`);
    });
  } else {
    $(".pageAccount .content .filterButtons .buttonsAndTitle.tags").addClass(
      "hidden"
    );
  }
  // showActiveFilters();
}

function toggleFilter(group, filter) {
  if (group === "date") {
    Object.keys(config.resultFilters.date).forEach((date) => {
      setFilter("date", date, false);
    });
  }
  config.resultFilters[group][filter] = !config.resultFilters[group][filter];
}

function setFilter(group, filter, set) {
  config.resultFilters[group][filter] = set;
}

// function toggleFilterButton(filter) {
//   const element = $(
//     `.pageAccount .content .filterButtons .button[filter=${filter}]`
//   );
//   if (element.hasClass("active")) {
//     //disable that filter

//     if (filter == "all" || filter == "none") {
//       return;
//     } else if (filter == "mode_words") {
//       // $.each($(`.pageAccount .content .filterButtons .buttons.wordsFilter .button`),(index,obj)=>{
//       //   let f = $(obj).attr('filter')
//       //   disableFilterButton(f)
//       // })
//     } else if (filter == "mode_time") {
//       // $.each($(`.pageAccount .content .filterButtons .buttons.timeFilter .button`),(index,obj)=>{
//       //   let f = $(obj).attr('filter')
//       //   disableFilterButton(f)
//       // })
//     } else if (filter == "punc_off") {
//       enableFilterButton("punc_on");
//     } else if (filter == "punc_on") {
//       enableFilterButton("punc_off");
//     }
//     disableFilterButton(filter);
//     disableFilterButton("all");
//   } else {
//     //enable that filter
//     disableFilterButton("none");

//     if (filter == "all") {
//       $.each(
//         $(`.pageAccount .content .filterButtons .button`),
//         (index, obj) => {
//           let f = $(obj).attr("filter");
//           if (
//             f != "none" &&
//             f != "date_month" &&
//             f != "date_week" &&
//             f != "date_day"
//           ) {
//             enableFilterButton(f);
//           }
//         }
//       );
//     } else if (filter == "none") {
//       disableFilterButton("all");
//       $.each(
//         $(`.pageAccount .content .filterButtons .button`),
//         (index, obj) => {
//           let f = $(obj).attr("filter");
//           if (f != "none") {
//             disableFilterButton(f);
//           }
//         }
//       );
//     } else if (
//       filter == "date_all" ||
//       filter == "date_month" ||
//       filter == "date_week" ||
//       filter == "date_day"
//     ) {
//       disableFilterButton("date_all");
//       disableFilterButton("date_month");
//       disableFilterButton("date_week");
//       disableFilterButton("date_day");
//       enableFilterButton(filter);
//     }
//     // else if(filter == "mode_words"){
//     //   $.each($(`.pageAccount .content .filterButtons .buttons.wordsFilter .button`),(index,obj)=>{
//     //     let f = $(obj).attr('filter');
//     //     enableFilterButton(f);
//     //   })
//     // }else if(filter == "mode_time"){
//     //   $.each($(`.pageAccount .content .filterButtons .buttons.timeFilter .button`),(index,obj)=>{
//     //     let f = $(obj).attr('filter');
//     //     enableFilterButton(f);
//     //   })
//     // }else if(['10','25','50','100','200'].includes(filter)){
//     //   enableFilterButton('words');
//     // }else if(['15','30','60','120'].includes(filter)){
//     //   enableFilterButton('time');
//     // }

//     enableFilterButton(filter);
//   }
//   showActiveFilters();
// }

// function disableFilterButton(filter) {
//   const element = $(
//     `.pageAccount .content .filterButtons .button[filter=${filter}]`
//   );
//   element.removeClass("active");
// }

// function enableFilterButton(filter) {
//   const element = $(
//     `.pageAccount .content .filterButtons .button[filter=${filter}]`
//   );
//   element.addClass("active");
// }

function showActiveFilters() {
  // activeFilters = [];
  // $.each($(".pageAccount .filterButtons .button"), (i, obj) => {
  //   if ($(obj).hasClass("active")) {
  //     activeFilters.push($(obj).attr("filter"));
  //   }
  // });

  let aboveChartDisplay = {};

  Object.keys(config.resultFilters).forEach((group) => {
    aboveChartDisplay[group] = {
      all: true,
      array: [],
    };
    Object.keys(config.resultFilters[group]).forEach((filter) => {
      if (config.resultFilters[group][filter]) {
        aboveChartDisplay[group].array.push(filter);
      } else {
        aboveChartDisplay[group].all = false;
      }
      let buttonEl;
      if (group === "date") {
        buttonEl = $(
          `.pageAccount .group.topFilters .filterGroup[group="${group}"] .button[filter="${filter}"]`
        );
      } else {
        buttonEl = $(
          `.pageAccount .group.filterButtons .filterGroup[group="${group}"] .button[filter="${filter}"]`
        );
      }
      if (config.resultFilters[group][filter]) {
        buttonEl.addClass("active");
      } else {
        buttonEl.removeClass("active");
      }
    });
  });

  function addText(group) {
    let ret = "";
    ret += "<div class='group'>";
    if (group == "difficulty") {
      ret += `<span aria-label="Difficulty" data-balloon-pos="up"><i class="fas fa-fw fa-star"></i>`;
    } else if (group == "mode") {
      ret += `<span aria-label="Mode" data-balloon-pos="up"><i class="fas fa-fw fa-bars"></i>`;
    } else if (group == "punctuation") {
      ret += `<span aria-label="Punctuation" data-balloon-pos="up"><span class="punc" style="font-weight: 900;
      width: 1.25rem;
      text-align: center;
      display: inline-block;
      letter-spacing: -.1rem;">!?</span>`;
    } else if (group == "numbers") {
      ret += `<span aria-label="Numbers" data-balloon-pos="up"><span class="numbers" style="font-weight: 900;
        width: 1.25rem;
        text-align: center;
        margin-right: .1rem;
        display: inline-block;
        letter-spacing: -.1rem;">15</span>`;
    } else if (group == "words") {
      ret += `<span aria-label="Words" data-balloon-pos="up"><i class="fas fa-fw fa-font"></i>`;
    } else if (group == "time") {
      ret += `<span aria-label="Time" data-balloon-pos="up"><i class="fas fa-fw fa-clock"></i>`;
    } else if (group == "date") {
      ret += `<span aria-label="Date" data-balloon-pos="up"><i class="fas fa-fw fa-calendar"></i>`;
    } else if (group == "tags") {
      ret += `<span aria-label="Tags" data-balloon-pos="up"><i class="fas fa-fw fa-tags"></i>`;
    } else if (group == "language") {
      ret += `<span aria-label="Language" data-balloon-pos="up"><i class="fas fa-fw fa-globe-americas"></i>`;
    } else if (group == "funbox") {
      ret += `<span aria-label="Funbox" data-balloon-pos="up"><i class="fas fa-fw fa-gamepad"></i>`;
    }
    if (aboveChartDisplay[group].all) {
      ret += "all";
    } else {
      //TODO: is this used?
      //allall = false;
      if (group === "tags") {
        ret += aboveChartDisplay.tags.array
          .map((id) => {
            if (id == "none") return id;
            let name = dbSnapshot.tags.filter((t) => t.id == id)[0];
            if (name !== undefined) {
              return dbSnapshot.tags.filter((t) => t.id == id)[0].name;
            }
          })
          .join(", ");
      } else {
        ret += aboveChartDisplay[group].array.join(", ").replace(/_/g, " ");
      }
    }
    ret += "</span></div>";
    return ret;
  }

  let chartString = "";

  //date
  chartString += addText("date");
  chartString += `<div class="spacer"></div>`;

  //mode
  chartString += addText("mode");
  chartString += `<div class="spacer"></div>`;

  //time
  if (aboveChartDisplay.mode.array.includes("time")) {
    chartString += addText("time");
    chartString += `<div class="spacer"></div>`;
  }

  //words
  if (aboveChartDisplay.mode.array.includes("words")) {
    chartString += addText("words");
    chartString += `<div class="spacer"></div>`;
  }

  //diff
  chartString += addText("difficulty");
  chartString += `<div class="spacer"></div>`;

  //punc
  chartString += addText("punctuation");
  chartString += `<div class="spacer"></div>`;

  //numbers
  chartString += addText("numbers");
  chartString += `<div class="spacer"></div>`;

  //language
  chartString += addText("language");
  chartString += `<div class="spacer"></div>`;

  //funbox
  chartString += addText("funbox");
  chartString += `<div class="spacer"></div>`;

  //tags
  chartString += addText("tags");
  // chartString += `<div class="spacer"></div>`;

  // let allall = true;
  // let count = 0;
  // Object.keys(aboveChartDisplay).forEach((group) => {
  //   count++;
  //   if (group === "time" && !aboveChartDisplay.mode.array.includes("time"))
  //     return;
  //   if (group === "words" && !aboveChartDisplay.mode.array.includes("words"))
  //     return;

  //   if (aboveChartDisplay[group].array.length > 0) {
  //     chartString += "<div class='group'>";
  //     if (group == "difficulty") {
  //       chartString += `<span aria-label="Difficulty" data-balloon-pos="up"><i class="fas fa-fw fa-star"></i>`;
  //     } else if (group == "mode") {
  //       chartString += `<span aria-label="Mode" data-balloon-pos="up"><i class="fas fa-fw fa-bars"></i>`;
  //     } else if (group == "punctuation") {
  //       chartString += `<span aria-label="Punctuation" data-balloon-pos="up"><span class="punc" style="font-weight: 900;
  //       width: 1.25rem;
  //       text-align: center;
  //       display: inline-block;
  //       letter-spacing: -.1rem;">!?</span>`;
  //     } else if (group == "numbers") {
  //       chartString += `<span aria-label="Numbers" data-balloon-pos="up"><span class="numbers" style="font-weight: 900;
  //         width: 1.25rem;
  //         text-align: center;
  //         margin-right: .1rem;
  //         display: inline-block;
  //         letter-spacing: -.1rem;">15</span>`;
  //     } else if (group == "words") {
  //       chartString += `<span aria-label="Words" data-balloon-pos="up"><i class="fas fa-fw fa-font"></i>`;
  //     } else if (group == "time") {
  //       chartString += `<span aria-label="Time" data-balloon-pos="up"><i class="fas fa-fw fa-clock"></i>`;
  //     } else if (group == "date") {
  //       chartString += `<span aria-label="Date" data-balloon-pos="up"><i class="fas fa-fw fa-calendar"></i>`;
  //     } else if (group == "tags") {
  //       chartString += `<span aria-label="Tags" data-balloon-pos="up"><i class="fas fa-fw fa-tags"></i>`;
  //     } else if (group == "language") {
  //       chartString += `<span aria-label="Language" data-balloon-pos="up"><i class="fas fa-fw fa-globe-americas"></i>`;
  //     } else if (group == "funbox") {
  //       chartString += `<span aria-label="Funbox" data-balloon-pos="up"><i class="fas fa-fw fa-gamepad"></i>`;
  //     }

  //     if (aboveChartDisplay[group].all) {
  //       chartString += "all";
  //     } else {
  //       allall = false;
  //       if (group === "tags") {
  //         chartString += aboveChartDisplay.tags.array
  //           .map((id) => {
  //             if (id == "none") return id;
  //             let name = dbSnapshot.tags.filter((t) => t.id == id)[0];
  //             if (name !== undefined) {
  //               return dbSnapshot.tags.filter((t) => t.id == id)[0].name;
  //             }
  //           })
  //           .join(", ");
  //       } else {
  //         chartString += aboveChartDisplay[group].array
  //           .join(", ")
  //           .replace(/_/g, " ");
  //       }
  //     }
  //     chartString += "</span></div>";
  //     if (Object.keys(aboveChartDisplay).length !== count)
  //       chartString += `<div class="spacer"></div>`;
  //   }
  // });

  // if (allall) chartString = `<i class="fas fa-fw fa-filter"></i>all`;

  $(".pageAccount .group.chart .above").html(chartString);

  refreshAccountPage();
}

function showChartPreloader() {
  $(".pageAccount .group.chart .preloader").stop(true, true).animate(
    {
      opacity: 1,
    },
    125
  );
}

function hideChartPreloader() {
  $(".pageAccount .group.chart .preloader").stop(true, true).animate(
    {
      opacity: 0,
    },
    125
  );
}

function fillPbTables() {
  $(".pageAccount .timePbTable tbody").html(`
  <tr>
    <td>15</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>30</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>60</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>120</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  `);
  $(".pageAccount .wordsPbTable tbody").html(`
  <tr>
    <td>10</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>25</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>50</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>100</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
  </tr>
  `);

  const pb = dbSnapshot.personalBests;
  let pbData;
  let text;

  text = "";
  try {
    pbData = pb.time[15].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>15</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>15</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  try {
    pbData = pb.time[30].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>30</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>30</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  try {
    pbData = pb.time[60].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>60</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>60</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  try {
    pbData = pb.time[120].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>120</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>120</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  $(".pageAccount .timePbTable tbody").html(text);

  text = "";
  try {
    pbData = pb.words[10].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>10</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>10</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  try {
    pbData = pb.words[25].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>25</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>25</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  try {
    pbData = pb.words[50].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>50</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>50</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  try {
    pbData = pb.words[100].sort((a, b) => b.wpm - a.wpm)[0];
    text += `<tr>
      <td>100</td>
      <td>${pbData.wpm}</td>
      <td>${pbData.raw === undefined ? "-" : pbData.raw}</td>
      <td>${pbData.acc === undefined ? "-" : pbData.acc + "%"}</td>
      <td>
      ${pbData.consistency === undefined ? "-" : pbData.consistency + "%"}
      </td>
    </tr>`;
  } catch (e) {
    text += `<tr>
      <td>100</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
  }
  $(".pageAccount .wordsPbTable tbody").html(text);
}

let filteredResults = [];
let visibleTableLines = 0;

function loadMoreLines() {
  if (filteredResults == [] || filteredResults.length == 0) return;
  for (let i = visibleTableLines; i < visibleTableLines + 10; i++) {
    const result = filteredResults[i];
    if (result == undefined) continue;
    let withpunc = "";
    // if (result.punctuation) {
    //   withpunc = '<br>punctuation';
    // }
    // if (result.blindMode) {
    //   withpunc = '<br>blind';
    // }
    let diff = result.difficulty;
    if (diff == undefined) {
      diff = "normal";
    }

    let raw;
    try {
      raw = result.rawWpm.toFixed(2);
      if (raw == undefined) {
        raw = "-";
      }
    } catch (e) {
      raw = "-";
    }

    let icons = `<span aria-label="${result.language.replace(
      "_",
      " "
    )}" data-balloon-pos="up"><i class="fas fa-fw fa-globe-americas"></i></span>`;

    if (diff === "normal") {
      icons += `<span aria-label="${result.difficulty}" data-balloon-pos="up"><i class="far fa-fw fa-star"></i></span>`;
    } else if (diff === "expert") {
      icons += `<span aria-label="${result.difficulty}" data-balloon-pos="up"><i class="fas fa-fw fa-star-half-alt"></i></span>`;
    } else if (diff === "master") {
      icons += `<span aria-label="${result.difficulty}" data-balloon-pos="up"><i class="fas fa-fw fa-star"></i></span>`;
    }

    if (result.punctuation) {
      icons += `<span aria-label="punctuation" data-balloon-pos="up" style="font-weight:900">!?</span>`;
    }

    if (result.numbers) {
      icons += `<span aria-label="numbers" data-balloon-pos="up" style="font-weight:900">15</span>`;
    }

    if (result.blindMode) {
      icons += `<span aria-label="blind mode" data-balloon-pos="up"><i class="fas fa-fw fa-eye-slash"></i></span>`;
    }

    if (result.funbox !== "none" && result.funbox !== undefined) {
      icons += `<span aria-label="${result.funbox.replace(
        /_/g,
        " "
      )}" data-balloon-pos="up"><i class="fas fa-gamepad"></i></span>`;
    }

    if (result.chartData === undefined) {
      icons += `<span class="hoverChartButton" aria-label="No chart data found" data-balloon-pos="up"><i class="fas fa-chart-line"></i></span>`;
    } else if (result.chartData === "toolong") {
      icons += `<span class="hoverChartButton" aria-label="Chart history is not available for long tests" data-balloon-pos="up"><i class="fas fa-chart-line"></i></span>`;
    } else {
      icons += `<span class="hoverChartButton" filteredResultsId="${i}" style="opacity: 1"><i class="fas fa-chart-line"></i></span>`;
    }

    let tagNames = "";

    if (result.tags !== undefined && result.tags.length > 0) {
      result.tags.forEach((tag) => {
        dbSnapshot.tags.forEach((snaptag) => {
          if (tag === snaptag.id) {
            tagNames += snaptag.name + ", ";
          }
        });
      });
      tagNames = tagNames.substring(0, tagNames.length - 2);
    }

    // if(tagNames !== ""){
    //   icons += `<span aria-label="${tagNames}" data-balloon-pos="up"><i class="fas fa-fw fa-tag"></i></span>`;
    // }

    let restags;
    if (result.tags === undefined) {
      restags = "[]";
    } else {
      restags = JSON.stringify(result.tags);
    }

    let tagIcons = `<span id="resultEditTags" resultId="${result.id}" tags='${restags}' aria-label="no tags" data-balloon-pos="up" style="opacity: .25"><i class="fas fa-fw fa-tag"></i></span>`;

    if (tagNames !== "") {
      if (result.tags !== undefined && result.tags.length > 1) {
        tagIcons = `<span id="resultEditTags" resultId="${result.id}" tags='${restags}' aria-label="${tagNames}" data-balloon-pos="up"><i class="fas fa-fw fa-tags"></i></span>`;
      } else {
        tagIcons = `<span id="resultEditTags" resultId="${result.id}" tags='${restags}' aria-label="${tagNames}" data-balloon-pos="up"><i class="fas fa-fw fa-tag"></i></span>`;
      }
    }

    let consistency = result.consistency;

    if (consistency === undefined) {
      consistency = "-";
    } else {
      consistency = consistency.toFixed(2) + "%";
    }

    let pb = result.isPb;
    if (pb) {
      pb = '<i class="fas fa-fw fa-crown"></i>';
    } else {
      pb = "";
    }

    $(".pageAccount .history table tbody").append(`
    <tr>
    <td>${pb}</td>
    <td>${result.wpm.toFixed(2)}</td>
    <td>${raw}</td>
    <td>${result.acc.toFixed(2)}%</td>
    <td>${result.correctChars}</td>
    <td>${result.incorrectChars}</td>
    <td>${consistency}</td>
    <td>${result.mode} ${result.mode2}${withpunc}</td>
    <td class="infoIcons">${icons}</td>
    <td>${tagIcons}</td>
    <td>${moment(result.timestamp).format("DD MMM YYYY<br>HH:mm")}</td>
    </tr>`);
  }
  visibleTableLines += 10;
  if (visibleTableLines >= filteredResults.length) {
    $(".pageAccount .loadMoreButton").addClass("hidden");
  } else {
    $(".pageAccount .loadMoreButton").removeClass("hidden");
  }
}

function clearGlobalStats() {
  $(".pageAccount .globalTimeTyping .val").text(`-`);
  $(".pageAccount .globalTestsStarted .val").text(`-`);
  $(".pageAccount .globalTestsCompleted .val").text(`-`);
}

function refreshGlobalStats() {
  if (dbSnapshot.globalStats.time != undefined) {
    let th = Math.floor(dbSnapshot.globalStats.time / 3600);
    let tm = Math.floor((dbSnapshot.globalStats.time % 3600) / 60);
    let ts = Math.floor((dbSnapshot.globalStats.time % 3600) % 60);
    $(".pageAccount .globalTimeTyping .val").text(`

      ${th < 10 ? "0" + th : th}:${tm < 10 ? "0" + tm : tm}:${
      ts < 10 ? "0" + ts : ts
    }
  `);
  }
  if (dbSnapshot.globalStats.started != undefined) {
    $(".pageAccount .globalTestsStarted .val").text(
      dbSnapshot.globalStats.started
    );
  }
  if (dbSnapshot.globalStats.completed != undefined) {
    $(".pageAccount .globalTestsCompleted .val").text(
      dbSnapshot.globalStats.completed
    );
  }
}

let totalSecondsFiltered = 0;

function refreshAccountPage() {
  function cont() {
    refreshThemeColorObject();
    refreshGlobalStats();
    fillPbTables();

    let chartData = [];
    let wpmChartData = [];
    //TODO: is this used?
    //let rawChartData = [];
    let accChartData = [];
    visibleTableLines = 0;

    let topWpm = 0;
    let topMode = "";
    let testRestarts = 0;
    let totalWpm = 0;
    let testCount = 0;

    let last10 = 0;
    let wpmLast10total = 0;

    let totalAcc = 0;
    let totalAcc10 = 0;

    let rawWpm = {
      total: 0,
      count: 0,
      last10Total: 0,
      last10Count: 0,
      max: 0,
    };

    let totalSeconds = 0;
    totalSecondsFiltered = 0;

    let totalCons = 0;
    let totalCons10 = 0;
    let consCount = 0;

    //TODO: is this used?
    //let dailyActivityDays = [];
    let activityChartData = {};

    filteredResults = [];
    $(".pageAccount .history table tbody").empty();
    dbSnapshot.results.forEach((result) => {
      let tt = 0;
      if (result.testDuration == undefined) {
        //test finished before testDuration field was introduced - estimate
        if (result.mode == "time") {
          tt = parseFloat(result.mode2);
        } else if (result.mode == "words") {
          tt = (parseFloat(result.mode2) / parseFloat(result.wpm)) * 60;
        }
      } else {
        tt = parseFloat(result.testDuration);
      }
      if (result.incompleteTestSeconds != undefined) {
        tt += result.incompleteTestSeconds;
      } else if (result.restartCount != undefined && result.restartCount > 0) {
        tt += (tt / 4) * result.restartCount;
      }
      totalSeconds += tt;

      // console.log(result);
      //apply filters
      try {
        let resdiff = result.difficulty;
        if (resdiff == undefined) {
          resdiff = "normal";
        }
        // if (!activeFilters.includes("difficulty_" + resdiff)) return;
        if (!config.resultFilters.difficulty[resdiff]) return;
        // if (!activeFilters.includes("mode_" + result.mode)) return;
        if (!config.resultFilters.mode[result.mode]) return;

        if (result.mode == "time") {
          let timefilter = "custom";
          if ([15, 30, 60, 120].includes(parseInt(result.mode2))) {
            timefilter = result.mode2;
          }
          // if (!activeFilters.includes(timefilter)) return;
          if (!config.resultFilters.time[timefilter]) return;
        } else if (result.mode == "words") {
          let wordfilter = "custom";
          if ([10, 25, 50, 100, 200].includes(parseInt(result.mode2))) {
            wordfilter = result.mode2;
          }
          // if (!activeFilters.includes(wordfilter)) return;
          if (!config.resultFilters.words[wordfilter]) return;
        }

        // if (!activeFilters.includes("lang_" + result.language)) return;

        let langFilter = config.resultFilters.language[result.language];

        if (
          result.language === "english_expanded" &&
          config.resultFilters.language.english_1k
        ) {
          langFilter = true;
        }
        if (!langFilter) return;

        let puncfilter = "off";
        if (result.punctuation) {
          puncfilter = "on";
        }
        if (!config.resultFilters.punctuation[puncfilter]) return;
        // if (!activeFilters.includes(puncfilter)) return;

        let numfilter = "off";
        if (result.numbers) {
          numfilter = "on";
        }
        if (!config.resultFilters.numbers[numfilter]) return;

        if (result.funbox === "none" || result.funbox === undefined) {
          // if (!activeFilters.includes("funbox_none")) return;
          if (!config.resultFilters.funbox.none) return;
        } else {
          // if (!activeFilters.includes("funbox_" + result.funbox)) return;
          if (!config.resultFilters.funbox[result.funbox]) return;
        }

        let tagHide = true;

        if (result.tags === undefined || result.tags.length === 0) {
          //no tags, show when no tag is enabled
          if (dbSnapshot.tags.length > 0) {
            // if (activeFilters.includes("tag_notag")) tagHide = false;
            if (config.resultFilters.tags.none) tagHide = false;
          } else {
            tagHide = false;
          }
        } else {
          //tags exist
          let validTags = dbSnapshot.tags.map((t) => t.id);
          result.tags.forEach((tag) => {
            //check if i even need to check tags anymore
            if (!tagHide) return;
            //check if tag is valid
            if (validTags.includes(tag)) {
              //tag valid, check if filter is on
              // if (activeFilters.includes("tag_" + tag)) tagHide = false;
              if (config.resultFilters.tags[tag]) tagHide = false;
            } else {
              //tag not found in valid tags, meaning probably deleted
              if (config.resultFilters.tags.none) tagHide = false;
            }
          });
        }

        if (tagHide) return;

        let timeSinceTest = Math.abs(result.timestamp - Date.now()) / 1000;

        let datehide = true;

        // if (
        //   activeFilters.includes("date_all") ||
        //   (activeFilters.includes("date_day") && timeSinceTest <= 86400) ||
        //   (activeFilters.includes("date_week") && timeSinceTest <= 604800) ||
        //   (activeFilters.includes("date_month") && timeSinceTest <= 18144000)
        // ) {
        //   datehide = false;
        // }

        if (
          config.resultFilters.date.all ||
          (config.resultFilters.date.last_day && timeSinceTest <= 86400) ||
          (config.resultFilters.date.last_week && timeSinceTest <= 604800) ||
          (config.resultFilters.date.last_month && timeSinceTest <= 2592000)
        ) {
          datehide = false;
        }

        if (datehide) return;

        filteredResults.push(result);
      } catch (e) {
        showNotification(
          "Something went wrong when filtering. Resetting filters.",
          5000
        );
        config.resultFilters = defaultAccountFilters;
        saveConfigToCookie();
      }

      //filters done
      //=======================================

      let resultDate = new Date(result.timestamp);
      resultDate.setSeconds(0);
      resultDate.setMinutes(0);
      resultDate.setHours(0);
      resultDate.setMilliseconds(0);
      resultDate = resultDate.getTime();

      if (Object.keys(activityChartData).includes(String(resultDate))) {
        activityChartData[resultDate].amount++;
        activityChartData[resultDate].totalWpm += result.wpm;
      } else {
        activityChartData[resultDate] = {
          amount: 1,
          totalWpm: result.wpm,
        };
      }

      tt = 0;
      if (result.testDuration == undefined) {
        //test finished before testDuration field was introduced - estimate
        if (result.mode == "time") {
          tt = parseFloat(result.mode2);
        } else if (result.mode == "words") {
          tt = (parseFloat(result.mode2) / parseFloat(result.wpm)) * 60;
        }
      } else {
        tt = parseFloat(result.testDuration);
      }
      if (result.incompleteTestSeconds != undefined) {
        tt += result.incompleteTestSeconds;
      } else if (result.restartCount != undefined && result.restartCount > 0) {
        tt += (tt / 4) * result.restartCount;
      }
      totalSecondsFiltered += tt;

      if (last10 < 10) {
        last10++;
        wpmLast10total += result.wpm;
        totalAcc10 += result.acc;
        result.consistency !== undefined
          ? (totalCons10 += result.consistency)
          : 0;
      }
      testCount++;

      if (result.consistency !== undefined) {
        consCount++;
        totalCons += result.consistency;
      }

      if (result.rawWpm != null) {
        if (rawWpm.last10Count < 10) {
          rawWpm.last10Count++;
          rawWpm.last10Total += result.rawWpm;
        }
        rawWpm.total += result.rawWpm;
        rawWpm.count++;
        if (result.rawWpm > rawWpm.max) {
          rawWpm.max = result.rawWpm;
        }
      }

      totalAcc += result.acc;

      if (result.restartCount != undefined) {
        testRestarts += result.restartCount;
      }

      chartData.push({
        x: result.timestamp,
        y: result.wpm,
        acc: result.acc,
        mode: result.mode,
        mode2: result.mode2,
        punctuation: result.punctuation,
        language: result.language,
        timestamp: result.timestamp,
        difficulty: result.difficulty,
        raw: result.rawWpm,
      });

      wpmChartData.push(result.wpm);

      accChartData.push({
        x: result.timestamp,
        y: result.acc,
      });

      if (result.wpm > topWpm) {
        let puncsctring = result.punctuation ? ",<br>with punctuation" : "";
        let numbsctring = result.numbers
          ? ",<br> " + (result.punctuation ? "&" : "") + "with numbers"
          : "";
        topWpm = result.wpm;
        topMode = result.mode + " " + result.mode2 + puncsctring + numbsctring;
      }

      totalWpm += result.wpm;
    });
    loadMoreLines();
    ////////

    let thisDate = new Date(Date.now());
    thisDate.setSeconds(0);
    thisDate.setMinutes(0);
    thisDate.setHours(0);
    thisDate.setMilliseconds(0);
    thisDate = thisDate.getTime();

    let activityChartData_amount = [];
    let activityChartData_avgWpm = [];
    let lastTimestamp = 0;
    Object.keys(activityChartData).forEach((date) => {
      let datecheck;
      if (lastTimestamp > 0) {
        datecheck = lastTimestamp;
      } else {
        datecheck = thisDate;
      }

      let numDaysBetweenTheDays = (datecheck - date) / 86400000;

      if (numDaysBetweenTheDays > 1) {
        if (datecheck === thisDate) {
          activityChartData_amount.push({
            x: parseInt(thisDate),
            y: 0,
          });
        }

        for (let i = 0; i < numDaysBetweenTheDays - 1; i++) {
          activityChartData_amount.push({
            x: parseInt(datecheck) - 86400000 * (i + 1),
            y: 0,
          });
        }
      }

      activityChartData_amount.push({
        x: parseInt(date),
        y: activityChartData[date].amount,
      });
      activityChartData_avgWpm.push({
        x: parseInt(date),
        y: roundTo2(
          activityChartData[date].totalWpm / activityChartData[date].amount
        ),
      });
      lastTimestamp = date;
    });

    // console.log(activityChartData);

    activityChart.options.scales.xAxes[0].ticks.minor.fontColor =
      themeColors.sub;
    activityChart.options.scales.yAxes[0].ticks.minor.fontColor =
      themeColors.sub;
    activityChart.options.scales.yAxes[0].scaleLabel.fontColor =
      themeColors.sub;
    activityChart.data.datasets[0].borderColor = themeColors.main;
    activityChart.data.datasets[0].backgroundColor = themeColors.main;

    activityChart.options.legend.labels.fontColor = themeColors.sub;
    activityChart.data.datasets[0].trendlineLinear.style = themeColors.sub;

    activityChart.data.datasets[0].data = activityChartData_amount;

    activityChart.options.scales.yAxes[1].ticks.minor.fontColor =
      themeColors.sub;
    activityChart.options.scales.yAxes[1].scaleLabel.fontColor =
      themeColors.sub;
    activityChart.data.datasets[1].borderColor = themeColors.sub;
    // activityChart.data.datasets[1].backgroundColor = themeColors.main;
    activityChart.data.datasets[1].data = activityChartData_avgWpm;

    activityChart.options.legend.labels.fontColor = themeColors.sub;

    resultHistoryChart.options.scales.xAxes[0].ticks.minor.fontColor =
      themeColors.sub;
    resultHistoryChart.options.scales.yAxes[0].ticks.minor.fontColor =
      themeColors.sub;
    resultHistoryChart.options.scales.yAxes[0].scaleLabel.fontColor =
      themeColors.sub;
    resultHistoryChart.options.scales.yAxes[1].ticks.minor.fontColor =
      themeColors.sub;
    resultHistoryChart.options.scales.yAxes[1].scaleLabel.fontColor =
      themeColors.sub;
    resultHistoryChart.data.datasets[0].borderColor = themeColors.main;
    resultHistoryChart.data.datasets[1].borderColor = themeColors.sub;

    resultHistoryChart.options.legend.labels.fontColor = themeColors.sub;
    resultHistoryChart.data.datasets[0].trendlineLinear.style = themeColors.sub;

    resultHistoryChart.data.datasets[0].data = chartData;
    resultHistoryChart.data.datasets[1].data = accChartData;

    let wpms = chartData.map((r) => r.y);
    let minWpmChartVal = Math.min(...wpms);
    let maxWpmChartVal = Math.max(...wpms);

    let accuracies = accChartData.map((r) => r.y);
    let minAccuracyChartVal = Math.min(...accuracies);
    let maxAccuracyChartVal = Math.max(...accuracies);

    resultHistoryChart.options.scales.yAxes[0].ticks.max =
      Math.floor(maxWpmChartVal) + (10 - (Math.floor(maxWpmChartVal) % 10));
    resultHistoryChart.options.scales.yAxes[1].ticks.max = Math.ceil(
      maxAccuracyChartVal
    );

    if (!config.startGraphsAtZero) {
      resultHistoryChart.options.scales.yAxes[0].ticks.min = Math.floor(
        minWpmChartVal
      );
      resultHistoryChart.options.scales.yAxes[1].ticks.min = Math.floor(
        minAccuracyChartVal
      );
    } else {
      resultHistoryChart.options.scales.yAxes[0].ticks.min = 0;
      resultHistoryChart.options.scales.yAxes[1].ticks.min = 0;
    }

    if (chartData == [] || chartData.length == 0) {
      $(".pageAccount .group.noDataError").removeClass("hidden");
      $(".pageAccount .group.chart").addClass("hidden");
      $(".pageAccount .group.dailyActivityChart").addClass("hidden");
      $(".pageAccount .group.history").addClass("hidden");
      $(".pageAccount .triplegroup.stats").addClass("hidden");
    } else {
      $(".pageAccount .group.noDataError").addClass("hidden");
      $(".pageAccount .group.chart").removeClass("hidden");
      $(".pageAccount .group.dailyActivityChart").removeClass("hidden");
      $(".pageAccount .group.history").removeClass("hidden");
      $(".pageAccount .triplegroup.stats").removeClass("hidden");
    }

    // moment
    //   .utc(moment.duration(totalSeconds, "seconds").asMilliseconds())
    //   .format("HH:mm:ss")
    let th = Math.floor(totalSeconds / 3600);
    let tm = Math.floor((totalSeconds % 3600) / 60);
    let ts = Math.floor((totalSeconds % 3600) % 60);
    $(".pageAccount .timeTotal .val").text(`

      ${th < 10 ? "0" + th : th}:${tm < 10 ? "0" + tm : tm}:${
      ts < 10 ? "0" + ts : ts
    }
    `);
    //moment
    // .utc(moment.duration(totalSecondsFiltered, "seconds").asMilliseconds())
    // .format("HH:mm:ss")
    let tfh = Math.floor(totalSecondsFiltered / 3600);
    let tfm = Math.floor((totalSecondsFiltered % 3600) / 60);
    let tfs = Math.floor((totalSecondsFiltered % 3600) % 60);
    $(".pageAccount .timeTotalFiltered .val").text(`

    ${tfh < 10 ? "0" + tfh : tfh}:${tfm < 10 ? "0" + tfm : tfm}:${
      tfs < 10 ? "0" + tfs : tfs
    }
  `);

    $(".pageAccount .highestWpm .val").text(topWpm);
    $(".pageAccount .averageWpm .val").text(Math.round(totalWpm / testCount));
    $(".pageAccount .averageWpm10 .val").text(
      Math.round(wpmLast10total / last10)
    );

    $(".pageAccount .highestRaw .val").text(rawWpm.max);
    $(".pageAccount .averageRaw .val").text(
      Math.round(rawWpm.total / rawWpm.count)
    );
    $(".pageAccount .averageRaw10 .val").text(
      Math.round(rawWpm.last10Total / rawWpm.last10Count)
    );

    $(".pageAccount .highestWpm .mode").html(topMode);
    $(".pageAccount .testsTaken .val").text(testCount);

    $(".pageAccount .avgAcc .val").text(Math.round(totalAcc / testCount) + "%");
    $(".pageAccount .avgAcc10 .val").text(
      Math.round(totalAcc10 / last10) + "%"
    );

    // console.log(totalCons10);
    // console.log(last10);

    if (totalCons == 0 || totalCons == undefined) {
      $(".pageAccount .avgCons .val").text("-");
      $(".pageAccount .avgCons10 .val").text("-");
    } else {
      $(".pageAccount .avgCons .val").text(
        Math.round(totalCons / consCount) + "%"
      );
      $(".pageAccount .avgCons10 .val").text(
        Math.round(totalCons10 / Math.min(last10, consCount)) + "%"
      );
    }

    $(".pageAccount .testsStarted .val").text(`${testCount + testRestarts}`);

    $(".pageAccount .testsCompleted .val").text(
      `${testCount}(${Math.floor(
        (testCount / (testCount + testRestarts)) * 100
      )}%)`
    );

    $(".pageAccount .avgRestart .val").text(
      (testRestarts / testCount).toFixed(1)
    );

    // if(testCount == 0){
    //   $('.pageAccount .group.chart').fadeOut(125);
    //   $('.pageAccount .triplegroup.stats').fadeOut(125);
    //   $('.pageAccount .group.history').fadeOut(125);
    // }else{
    //   $('.pageAccount .group.chart').fadeIn(125);
    //   $('.pageAccount .triplegroup.stats').fadeIn(125);
    //   $('.pageAccount .group.history').fadeIn(125);
    // }

    // let favMode = testModes.words10;
    // let favModeName = 'words10';
    // $.each(testModes, (key, mode) => {
    //   if (mode.length > favMode.length) {
    //     favMode = mode;
    //     favModeName = key;
    //   }
    // })
    // if (favModeName == 'words10' && testModes.words10.length == 0) {
    //   //new user
    //   $(".pageAccount .favouriteTest .val").text(`-`);
    // } else {
    //   $(".pageAccount .favouriteTest .val").text(`${favModeName} (${Math.floor((favMode.length/testCount) * 100)}%)`);
    // }

    if (resultHistoryChart.data.datasets[0].data.length > 0) {
      resultHistoryChart.options.plugins.trendlineLinear = true;
    } else {
      resultHistoryChart.options.plugins.trendlineLinear = false;
    }

    if (activityChart.data.datasets[0].data.length > 0) {
      activityChart.options.plugins.trendlineLinear = true;
    } else {
      activityChart.options.plugins.trendlineLinear = false;
    }

    let wpmPoints = filteredResults.map((r) => r.wpm).reverse();

    let trend = findLineByLeastSquares(wpmPoints);

    let wpmChange = trend[1][1] - trend[0][1];

    let wpmChangePerHour = wpmChange * (3600 / totalSecondsFiltered);

    // let slope = calculateSlope(trend);
    let plus = wpmChangePerHour > 0 ? "+" : "";

    $(".pageAccount .group.chart .below .text").text(
      `Speed change per hour spent typing: ${
        plus + roundTo2(wpmChangePerHour)
      } wpm.`
    );

    resultHistoryChart.update({ duration: 0 });
    activityChart.update({ duration: 0 });

    swapElements($(".pageAccount .preloader"), $(".pageAccount .content"), 250);
  }
  if (dbSnapshot === null) {
    showNotification(`Missing account data. Please refresh.`, 5000);
    $(".pageAccount .preloader").html("Missing account data. Please refresh.");
  } else if (dbSnapshot.results === undefined) {
    db_getUserResults().then((d) => {
      if (d) {
        // cont();
        showActiveFilters();
      } else {
        setTimeout(() => {
          changePage("");
        }, 500);
        // console.log("something went wrong");
      }
    });
  } else {
    console.log("using db snap");
    try {
      cont();
    } catch (e) {
      console.error(e);
      showNotification(`Something went wrong: ${e}`, 5000);
    }
  }
}

function showResultEditTagsPanel() {
  if ($("#resultEditTagsPanelWrapper").hasClass("hidden")) {
    $("#resultEditTagsPanelWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 125);
  }
}

function hideResultEditTagsPanel() {
  if (!$("#resultEditTagsPanelWrapper").hasClass("hidden")) {
    $("#resultEditTagsPanelWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        100,
        (e) => {
          $("#resultEditTagsPanelWrapper").addClass("hidden");
        }
      );
  }
}

function updateResultEditTagsPanelButtons() {
  $("#resultEditTagsPanel .buttons").empty();
  dbSnapshot.tags.forEach((tag) => {
    $("#resultEditTagsPanel .buttons").append(
      `<div class="button tag" tagid="${tag.id}">${tag.name}</div>`
    );
  });
}

function updateActiveResultEditTagsPanelButtons(active) {
  if (active === []) return;
  $.each($("#resultEditTagsPanel .buttons .button"), (index, obj) => {
    let tagid = $(obj).attr("tagid");
    if (active.includes(tagid)) {
      $(obj).addClass("active");
    } else {
      $(obj).removeClass("active");
    }
    // active.forEach(activetagid => {
    //   if(activetagid === tagid){
    //     $(obj).addClass('active');
    //   }else{
    //     $(obj).removeClass('active');
    //   }
    // })
  });
}

function updateLbMemory(mode, mode2, type, value) {
  dbSnapshot.lbMemory[mode + mode2][type] = value;
}
