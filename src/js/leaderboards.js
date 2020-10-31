import * as Util from "./util";

let currentLeaderboard = "time_15";

export function showLeaderboards() {
  if ($("#leaderboardsWrapper").hasClass("hidden")) {
    $("#leaderboardsWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate(
        {
          opacity: 1,
        },
        125,
        () => {
          updateLeaderboards();
        }
      );
  }
}

export function hideLeaderboards() {
  $("#leaderboardsWrapper")
    .stop(true, true)
    .css("opacity", 1)
    .animate(
      {
        opacity: 0,
      },
      100,
      () => {
        $("#leaderboardsWrapper").addClass("hidden");
      }
    );
  Util.focusWords();
}

function updateLeaderboards() {
  $("#leaderboardsWrapper .buttons .button").removeClass("active");
  $(
    `#leaderboardsWrapper .buttons .button[board=${currentLeaderboard}]`
  ).addClass("active");

  // $(
  //   `#leaderboardsWrapper .leaderboardMode .button[mode=${currentLeaderboard.mode}]`
  // ).addClass("active");

  // $("#leaderboardsWrapper .leaderboardWords .button").removeClass("active");
  // $(
  //   `#leaderboardsWrapper .leaderboardWords .button[words=${currentLeaderboard.words}]`
  // ).addClass("active");

  // $("#leaderboardsWrapper .leaderboardTime .button").removeClass("active");
  // $(
  //   `#leaderboardsWrapper .leaderboardTime .button[time=${currentLeaderboard.time}]`
  // ).addClass("active");

  let boardinfo = currentLeaderboard.split("_");

  // if (boardinfo[0] === "time") {
  //   $("#leaderboardsWrapper .leaderboardWords").addClass("hidden");
  //   $("#leaderboardsWrapper .leaderboardTime").removeClass("hidden");
  // } else if (currentLeaderboard.mode === "words") {
  //   $("#leaderboardsWrapper .leaderboardWords").removeClass("hidden");
  //   $("#leaderboardsWrapper .leaderboardTime").addClass("hidden");
  // }

  // let mode2;
  // if (currentLeaderboard.mode === "words") {
  //   mode2 = currentLeaderboard.words;
  // } else if (currentLeaderboard.mode === "time") {
  //   mode2 = currentLeaderboard.time;
  // }

  let uid = null;
  if (firebase.auth().currentUser !== null) {
    uid = firebase.auth().currentUser.uid;
  }

  Util.showBackgroundLoader();
  Promise.all([
    firebase.functions().httpsCallable("getLeaderboard")({
      mode: boardinfo[0],
      mode2: boardinfo[1],
      type: "daily",
      uid: uid,
    }),
    firebase.functions().httpsCallable("getLeaderboard")({
      mode: boardinfo[0],
      mode2: boardinfo[1],
      type: "global",
      uid: uid,
    }),
  ])
    .then((lbdata) => {
      Util.hideBackgroundLoader();
      let dailyData = lbdata[0].data;
      let globalData = lbdata[1].data;

      //daily
      let diffAsDate = new Date(dailyData.resetTime - Date.now());

      let diffHours = diffAsDate.getUTCHours();
      let diffMinutes = diffAsDate.getUTCMinutes();
      let diffSeconds = diffAsDate.getUTCSeconds();

      let resetString = "";
      if (diffHours > 0) {
        resetString = `resets in ${diffHours} ${
          diffHours == 1 ? "hour" : "hours"
        } ${diffMinutes} ${diffMinutes == 1 ? "minute" : "minutes"}
        `;
      } else if (diffMinutes > 0) {
        resetString = `resets in ${diffMinutes} ${
          diffMinutes == 1 ? "minute" : "minutes"
        } ${diffSeconds} ${diffSeconds == 1 ? "second" : "seconds"}`;
      } else if (diffSeconds > 0) {
        resetString = `resets in ${diffSeconds} ${
          diffSeconds == 1 ? "second" : "seconds"
        }`;
      }

      $("#leaderboardsWrapper .subtitle").text(resetString);

      $("#leaderboardsWrapper table.daily tfoot").html(`
      <tr>
        <td><br><br></td>
        <td colspan="5" style="text-align:center;">Not qualified</>
        <td><br><br></td>
      </tr>
      `);
      //daily
      $("#leaderboardsWrapper table.daily tbody").empty();
      let dindex = 0;
      if (dailyData.board !== undefined) {
        dailyData.board.forEach((entry) => {
          if (entry.hidden) return;
          let meClassString = "";
          if (entry.currentUser) {
            meClassString = ' class="me"';
            $("#leaderboardsWrapper table.daily tfoot").html(`
            <tr>
            <td>${dindex + 1}</td>
            <td>You</td>
            <td>${entry.wpm.toFixed(2)}</td>
            <td>${entry.raw.toFixed(2)}</td>
            <td>${entry.acc.toFixed(2)}%</td>
            <td>${entry.mode} ${entry.mode2}</td>
            <td>${moment(entry.timestamp).format("DD MMM YYYY<br>HH:mm")}</td>
          </tr>
            `);
          }
          $("#leaderboardsWrapper table.daily tbody").append(`
          <tr>
          <td>${
            dindex === 0 ? '<i class="fas fa-fw fa-crown"></i>' : dindex + 1
          }</td>
          <td ${meClassString}>${entry.name}</td>
          <td>${entry.wpm.toFixed(2)}</td>
          <td>${entry.raw.toFixed(2)}</td>
          <td>${entry.acc.toFixed(2)}%</td>
          <td>${entry.mode} ${entry.mode2}</td>
          <td>${moment(entry.timestamp).format("DD MMM YYYY<br>HH:mm")}</td>
        </tr>
        `);
          dindex++;
        });
      }
      let lenDaily = 0;
      if (dailyData.board !== undefined) lenDaily = dailyData.board.length;
      if (dailyData.length === 0 || lenDaily !== dailyData.size) {
        for (let i = lenDaily; i < dailyData.size; i++) {
          $("#leaderboardsWrapper table.daily tbody").append(`
          <tr>
                <td>${i + 1}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-<br>-</td>
              </tr>
        `);
        }
      }

      $("#leaderboardsWrapper table.global tfoot").html(`
      <tr>
      <td><br><br></td>
      <td colspan="5" style="text-align:center;">Not qualified</>
      <td><br><br></td>
      </tr>
      `);
      //global
      $("#leaderboardsWrapper table.global tbody").empty();
      let index = 0;
      if (globalData.board !== undefined) {
        globalData.board.forEach((entry) => {
          if (entry.hidden) return;
          let meClassString = "";
          if (entry.currentUser) {
            meClassString = ' class="me"';
            $("#leaderboardsWrapper table.global tfoot").html(`
            <tr>
            <td>${index + 1}</td>
            <td>You</td>
            <td>${entry.wpm.toFixed(2)}</td>
            <td>${entry.raw.toFixed(2)}</td>
            <td>${entry.acc.toFixed(2)}%</td>
            <td>${entry.mode} ${entry.mode2}</td>
            <td>${moment(entry.timestamp).format("DD MMM YYYY<br>HH:mm")}</td>
          </tr>
            `);
          }
          $("#leaderboardsWrapper table.global tbody").append(`
          <tr>
          <td>${
            index === 0 ? '<i class="fas fa-fw fa-crown"></i>' : index + 1
          }</td>
          <td ${meClassString}>${entry.name}</td>
          <td>${entry.wpm.toFixed(2)}</td>
          <td>${entry.raw.toFixed(2)}</td>
          <td>${entry.acc.toFixed(2)}%</td>
          <td>${entry.mode} ${entry.mode2}</td>
          <td>${moment(entry.timestamp).format("DD MMM YYYY<br>HH:mm")}</td>
        </tr>
        `);
          index++;
        });
      }
      let lenGlobal = 0;
      if (globalData.board !== undefined) lenGlobal = globalData.board.length;
      if (globalData.length === 0 || lenGlobal !== globalData.size) {
        for (let i = lenGlobal; i < globalData.size; i++) {
          $("#leaderboardsWrapper table.global tbody").append(`
        <tr>
              <td>${i + 1}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-<br>-</td>
            </tr>
      `);
        }
      }
    })
    .catch((e) => {
      Util.showNotification("Something went wrong", 3000);
    });
}

$("#leaderboardsWrapper").click((e) => {
  if ($(e.target).attr("id") === "leaderboardsWrapper") {
    hideLeaderboards();
  }
});

$("#leaderboardsWrapper .buttons .button").click((e) => {
  currentLeaderboard = $(e.target).attr("board");
  updateLeaderboards();
});

// $("#leaderboardsWrapper .leaderboardWords .button").click((e) => {
//   currentLeaderboard.words = $(e.target).attr("words");
//   updateLeaderboards();
// });

// $("#leaderboardsWrapper .leaderboardTime .button").click((e) => {
//   currentLeaderboard.time = $(e.target).attr("time");
//   updateLeaderboards();
// });
