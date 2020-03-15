let colours = {
  "Positive results": "rgb(214, 39, 40)",
  "Awaiting results": "rgb(255, 127, 14)",
  "Negative results": "rgb(44, 160, 44)",
  "Number of samples tested": "rgb(31, 119, 180)"
};

let render_data = function(data) {
  draw_cummulative(data);
  set_lastUpdated(data);
  draw_changes(data);
};

let plot_graph = function(elementId, plot_data) {
  GRAPH = document.getElementById(elementId);

  Plotly.plot(
    GRAPH,
    plot_data,
    {
      margin: { t: 15, b: 25 },
      paper_bgcolor: "whitesmoke",
      plot_bgcolor: "whitesmoke"
    }, //layout
    { scrollZoom: true, responsive: true }
  ); // controls
};

let draw_cummulative = function(data) {
  const updated = data["Updated"];
  const plot_data = [];
  const ignoreKeys = ["cacheUntil", "Updated", "Saved"];

  for (const key in data) {
    if (ignoreKeys.indexOf(key) == -1) {
      plot_data.push({
        name: key,
        x: updated,
        y: data[key],
        mode: "lines",
        line: {
          color: colours[key]
        }
      });
    }
  }

  plot_graph("tracker_graph", plot_data);
};

let draw_changes = function(data) {
  let filtered_data = [];

  for (const i in data["Updated"]) {
    let current = moment(data["Updated"][i]).startOf("day");

    if (i == 0 || current < moment(data["Updated"][i - 1]).startOf("day")) {
      const record = {};
      record.Day = current;
      record.Tested = data["Number of samples tested"][i];
      record.Returned =
        data["Negative results"][i] + data["Positive results"][i];
      record.Pending = data["Awaiting results"][i];
      filtered_data.push(record);
    }
  }

  const diffTested = [];
  const diffReturned = [];
  const diffPending = [];
  filtered_data
    .sort(function(a, b) {
      return a.Day - b.Day;
    })
    .forEach(function(v, i, d) {
      if (i == 0) {
        return;
      }
      if (v.Tested > d[i - 1].Tested) {
        diffTested.push({
          Day: v.Day.toDate(),
          Tested: v.Tested - d[i - 1].Tested
        });
      }
      if (v.Returned > d[i - 1].Returned) {
        diffReturned.push({
          Day: v.Day.toDate(),
          Returned: v.Returned - d[i - 1].Returned
        });
      }
      diffPending.push({ Day: v.Day.toDate(), Pending: v.Pending });
    });

  //'#9467bd',  # muted purple
  //'#8c564b',  # chestnut brown

  let plot_data = [];
  plot_data.push({
    name: "Tested",
    x: diffTested.map(function(v) {
      return v.Day;
    }),
    y: diffTested.map(function(v) {
      return v.Tested;
    }),
    type: "bar",
    marker: { color: "#CBD081" }
  });
  plot_data.push({
    name: "Returned",
    x: diffReturned.map(function(v) {
      return v.Day;
    }),
    y: diffReturned.map(function(v) {
      return v.Returned;
    }),
    type: "bar",
    marker: { color: "#58A4B0" }
  });
  plot_data.push({
    name: "Awaiting Results",
    x: diffPending.map(function(v) {
      return v.Day;
    }),
    y: diffPending.map(function(v) {
      return v.Pending;
    }),
    type: "scatter",
    marker: { color: "rgb(255, 127, 14)" },
    mode: "lines+markers",
    line: { shape: "spline" }
  });

  plot_graph("changes_graph", plot_data);
};

let set_lastUpdated = function(data) {
  let cacheUtil = moment(data.cacheUntil);
  let lastUpdated = moment(data["Updated"][0]);

  document.getElementById(
    "load"
  ).innerHTML = `Covid tracker loaded.  Data will refresh ${cacheUtil.fromNow()}`;
  document.getElementById("lastUpdated").innerHTML = lastUpdated.calendar();
};
