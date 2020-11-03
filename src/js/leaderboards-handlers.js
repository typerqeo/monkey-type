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
