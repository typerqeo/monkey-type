var resultHistoryChart = new Chart($(".pageAccount #resultHistoryChart"), {
  animationSteps: 60,
  type: "line",
  data: {
    datasets: [
      {
        yAxisID: "wpm",
        label: "wpm",
        fill: false,
        data: [],
        borderColor: "#f44336",
        borderWidth: 2,
        // trendlineLinear: {
        //   style: "rgba(244,67,54,.25)",
        //   lineStyle: "solid",
        //   width: 1
        // }
        trendlineLinear: {
          style: "rgba(255,105,180, .8)",
          lineStyle: "dotted",
          width: 4,
        },
      },
      {
        yAxisID: "acc",
        label: "acc",
        fill: false,
        data: [],
        borderColor: "#cccccc",
        borderWidth: 2,
      },
    ],
  },
  options: {
    tooltips: {
      // Disable the on-canvas tooltip
      enabled: true,
      titleFontFamily: "Roboto Mono",
      bodyFontFamily: "Roboto Mono",
      intersect: false,
      custom: function (tooltip) {
        if (!tooltip) return;
        // disable displaying the color box;
        tooltip.displayColors = false;
      },
      callbacks: {
        // HERE YOU CUSTOMIZE THE LABELS
        title: function () {
          return;
        },
        beforeLabel: function (tooltipItem, data) {
          let resultData =
            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          if (tooltipItem.datasetIndex !== 0) {
            return `acc: ${resultData.y}%`;
          }
          let label =
            `${data.datasets[tooltipItem.datasetIndex].label}: ${
              tooltipItem.yLabel
            }` +
            "\n" +
            `raw: ${resultData.raw}` +
            "\n" +
            `acc: ${resultData.acc}` +
            "\n\n" +
            `mode: ${resultData.mode} `;

          if (resultData.mode == "time") {
            label += resultData.mode2;
          } else if (resultData.mode == "words") {
            label += resultData.mode2;
          }

          let diff = resultData.difficulty;
          if (diff == undefined) {
            diff = "normal";
          }
          label += "\n" + `difficulty: ${diff}`;

          label +=
            "\n" +
            `punctuation: ${resultData.punctuation}` +
            "\n" +
            `language: ${resultData.language}` +
            "\n\n" +
            `date: ${moment(resultData.timestamp).format("DD MMM YYYY HH:mm")}`;

          return label;
        },
        label: function (tooltipItem, data) {
          return;
        },
        afterLabel: function (tooltipItem, data) {
          return;
        },
      },
    },
    animation: {
      duration: 250,
    },
    legend: {
      display: false,
      labels: {
        fontFamily: "Roboto Mono",
        fontColor: "#ffffff",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    // tooltips: {
    //   mode: 'index',
    //   intersect: false,
    // },
    hover: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontFamily: "Roboto Mono",
          },
          type: "time",
          bounds: "ticks",
          distribution: "series",
          display: false,
          offset: true,
          scaleLabel: {
            display: false,
            labelString: "Date",
          },
        },
      ],
      yAxes: [
        {
          id: "wpm",
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            stepSize: 10,
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Words per Minute",
            fontFamily: "Roboto Mono",
          },
        },
        {
          id: "acc",
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            max: 100,
          },
          display: true,
          position: "right",
          scaleLabel: {
            display: true,
            labelString: "Accuracy",
            fontFamily: "Roboto Mono",
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
  },
});

let activityChart = new Chart($(".pageAccount #activityChart"), {
  animationSteps: 60,
  type: "bar",
  data: {
    datasets: [
      {
        yAxisID: "count",
        label: "Tests Completed",
        data: [],
        trendlineLinear: {
          style: "rgba(255,105,180, .8)",
          lineStyle: "dotted",
          width: 2,
        },
        order: 3,
      },
      {
        yAxisID: "avgWpm",
        label: "Average Wpm",
        data: [],
        type: "line",
        order: 2,
        lineTension: 0,
        fill: false,
      },
    ],
  },
  options: {
    tooltips: {
      callbacks: {
        // HERE YOU CUSTOMIZE THE LABELS
        title: function (tooltipItem, data) {
          let resultData =
            data.datasets[tooltipItem[0].datasetIndex].data[
              tooltipItem[0].index
            ];
          return moment(resultData.x).format("DD MMM YYYY");
        },
      },
    },
    animation: {
      duration: 250,
    },
    legend: {
      display: false,
      labels: {
        fontFamily: "Roboto Mono",
        fontColor: "#ffffff",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    hover: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontFamily: "Roboto Mono",
            autoSkip: true,
            autoSkipPadding: 40,
          },
          type: "time",
          time: {
            unit: "day",
            displayFormats: {
              day: "D MMM",
            },
          },
          bounds: "ticks",
          distribution: "series",
          display: true,
          scaleLabel: {
            display: false,
            labelString: "Date",
          },
          offset: true,
        },
      ],
      yAxes: [
        {
          id: "count",
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            autoSkip: true,
            autoSkipPadding: 40,
            stepSize: 10,
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Tests Completed",
            fontFamily: "Roboto Mono",
          },
        },
        {
          id: "avgWpm",
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            autoSkip: true,
            autoSkipPadding: 40,
            stepSize: 10,
          },
          display: true,
          position: "right",
          scaleLabel: {
            display: true,
            labelString: "Average Wpm",
            fontFamily: "Roboto Mono",
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
  },
});

let hoverChart = new Chart($(".pageAccount #hoverChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "wpm",
        data: [],
        // backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: "rgba(125, 125, 125, 1)",
        borderWidth: 2,
        yAxisID: "wpm",
        order: 2,
        radius: 2,
      },
      {
        label: "raw",
        data: [],
        // backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: "rgba(125, 125, 125, 1)",
        borderWidth: 2,
        yAxisID: "raw",
        order: 3,
        radius: 2,
      },
      {
        label: "errors",
        data: [],
        // backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: "rgba(255, 125, 125, 1)",
        pointBackgroundColor: "rgba(255, 125, 125, 1)",
        borderWidth: 2,
        order: 1,
        yAxisID: "error",
        // barPercentage: 0.1,
        maxBarThickness: 10,
        type: "scatter",
        pointStyle: "crossRot",
        radius: function (context) {
          var index = context.dataIndex;
          var value = context.dataset.data[index];
          return value.y <= 0 ? 0 : 3;
        },
        pointHoverRadius: function (context) {
          var index = context.dataIndex;
          var value = context.dataset.data[index];
          return value.y <= 0 ? 0 : 5;
        },
      },
    ],
  },
  options: {
    tooltips: {
      titleFontFamily: "Roboto Mono",
      bodyFontFamily: "Roboto Mono",
      mode: "index",
      intersect: false,
    },
    legend: {
      display: false,
      labels: {
        defaultFontFamily: "Roboto Mono",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    // hover: {
    //   mode: 'x',
    //   intersect: false
    // },
    scales: {
      xAxes: [
        {
          ticks: {
            fontFamily: "Roboto Mono",
            autoSkip: true,
            autoSkipPadding: 40,
          },
          display: true,
          scaleLabel: {
            display: false,
            labelString: "Seconds",
            fontFamily: "Roboto Mono",
          },
        },
      ],
      yAxes: [
        {
          id: "wpm",
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Words per Minute",
            fontFamily: "Roboto Mono",
          },
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            autoSkip: true,
            autoSkipPadding: 40,
          },
          gridLines: {
            display: true,
          },
        },
        {
          id: "raw",
          display: false,
          scaleLabel: {
            display: true,
            labelString: "Raw Words per Minute",
            fontFamily: "Roboto Mono",
          },
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            autoSkip: true,
            autoSkipPadding: 40,
          },
          gridLines: {
            display: false,
          },
        },
        {
          id: "error",
          display: true,
          position: "right",
          scaleLabel: {
            display: true,
            labelString: "Errors",
            fontFamily: "Roboto Mono",
          },
          ticks: {
            precision: 0,
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            autoSkip: true,
            autoSkipPadding: 40,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
    annotation: {
      annotations: [
        {
          enabled: false,
          type: "line",
          mode: "horizontal",
          scaleID: "wpm",
          value: "-30",
          borderColor: "red",
          borderWidth: 1,
          borderDash: [2, 2],
          label: {
            // Background color of label, default below
            backgroundColor: "blue",
            fontFamily: "Roboto Mono",

            // Font size of text, inherits from global
            fontSize: 11,

            // Font style of text, default below
            fontStyle: "normal",

            // Font color of text, default below
            fontColor: "#fff",

            // Padding of label to add left/right, default below
            xPadding: 6,

            // Padding of label to add top/bottom, default below
            yPadding: 6,

            // Radius of label rectangle, default below
            cornerRadius: 3,

            // Anchor position of label on line, can be one of: top, bottom, left, right, center. Default below.
            position: "center",

            // Whether the label is enabled and should be displayed
            enabled: true,

            // Text to display in label - default is null. Provide an array to display values on a new line
            content: "PB",
          },
        },
      ],
    },
  },
});
