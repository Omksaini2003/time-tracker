// Load the Visualization API with the required packages
google.charts.load("current", { packages: ["corechart", "table"] });

// Set a callback to run when the API is loaded
google.charts.setOnLoadCallback(displayData);

// Convert seconds to a human-readable time format
function timeString(numSeconds) {
  if (numSeconds === 0) return "0 sec";

  const timeTerms = {
    hr: 3600,
    min: 60,
    sec: 1,
  };

  let remainder = numSeconds;
  let timeStr = "";

  for (const [term, divisor] of Object.entries(timeTerms)) {
    if (remainder >= divisor) {
      const numUnits = Math.floor(remainder / divisor);
      timeStr += `${numUnits} ${term}`;
      remainder %= divisor;
      if (remainder) timeStr += " ";
    }
  }

  return timeStr;
}

// Main function to display data
function displayData() {
  const domains = JSON.parse(localStorage.getItem("domains"));
  const chartData = [];
  const tableData = [];

  for (const domain in domains) {
    const domainData = JSON.parse(localStorage.getItem(domain));
    const numSeconds = domainData.today;

    if (numSeconds > 0) {
      addDomainData(domain, numSeconds, chartData, tableData);
    }
  }

  handleNoData(chartData);
  sortData(chartData, tableData);

  const limitedDataChart = limitData(chartData);
  const limitedDataTable = limitData(tableData);

  addOthers(limitedDataChart, limitedDataTable, chartData);

  drawChart(limitedDataChart);
  addTotal(limitedDataTable);
  drawTable(limitedDataTable);
}

// Add domain data to chart and table arrays
function addDomainData(domain, numSeconds, chartData, tableData) {
  const colorClasses = [
    "#5c91e6", "#a711f2", "#c353e6", "#ed39a8", 
    "#e66ec8", "#eb3147", "#ffae00", "#0db81e"
  ];
  const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

  chartData.push([
    domain,
    { v: numSeconds, f: timeString(numSeconds), p: { style: "text-align: left; white-space: normal;" } }
  ]);

  tableData.push([
    { v: domain, p: { style: `text-align: left; white-space: normal; background-color: ${randomColor};` } },
    { v: numSeconds, f: timeString(numSeconds), p: { style: `text-align: left; white-space: normal; background-color: ${randomColor};` } }
  ]);
}

// Handle the case when no data is available
function handleNoData(chartData) {
  document.getElementById("nodata").style.display = chartData.length === 0 ? "inline" : "none";
}

// Sort chart and table data in descending order
function sortData(chartData, tableData) {
  chartData.sort((a, b) => b[1].v - a[1].v);
  tableData.sort((a, b) => b[1].v - a[1].v);
}

// Limit the chart and table data to a specific number of items
function limitData(data) {
  const chartLimit = top === self ? parseInt(localStorage.getItem("chart_limit"), 10) : 9;
  return data.slice(0, chartLimit);
}

// Add "Others" category if needed
function addOthers(limitedDataChart, limitedDataTable, chartData) {
  const sum = chartData.slice(limitedDataChart.length).reduce((acc, item) => acc + item[1].v, 0);

  if (sum > 0) {
    const randomColor = getRandomColor();
    limitedDataChart.push([
      "Others",
      { v: sum, f: timeString(sum), p: { style: "text-align: left; white-space: normal;" } }
    ]);
    limitedDataTable.push([
      { v: "Others", p: { style: `text-align: left; white-space: normal; background-color: ${randomColor};` } },
      { v: sum, f: timeString(sum), p: { style: `text-align: left; white-space: normal; background-color: ${randomColor};` } }
    ]);
  }
}

// Draw the chart using Google Charts API
function drawChart(data) {
  const chartData = new google.visualization.DataTable();
  chartData.addColumn("string", "Domain");
  chartData.addColumn("number", "Time");
  chartData.addRows(data);

  const options = {
    tooltip: { text: "percentage" },
    chartArea: { width: 400, height: 180 },
    is3D: true,
    pieHole: 0.4,
    colors: ['#5c91e6', '#a711f2', '#c353e6', '#ed39a8', '#e66ec8', '#eb3147', '#ffae00', '#0db81e']
  };

  const chart = new google.visualization.PieChart(document.getElementById("chart_div"));
  chart.draw(chartData, options);
}

// Draw the table using Google Charts API
function drawTable(data) {
  const tableData = new google.visualization.DataTable();
  tableData.addColumn("string", "Domain");
  tableData.addColumn("number", "Time Spent Today");
  tableData.addRows(data);

  const options = {
    allowHtml: true,
    sort: "disable",
    width: "100%",
    height: "100%",
  };

  const table = new google.visualization.Table(document.getElementById("table_div"));
  table.draw(tableData, options);
}

// Add total time to the table
function addTotal(tableData) {
  const total = JSON.parse(localStorage.getItem("total"));
  const numSeconds = total.today;

  tableData.push([
    { v: "Total", p: { style: "text-align: left; font-weight: bold; background-color: cyan;" } },
    { v: numSeconds, f: timeString(numSeconds), p: { style: "text-align: left; white-space: normal; font-weight: bold; background-color: cyan;" } }
  ]);
}

// Get a random color for table rows
function getRandomColor() {
  const colors = ["#5c91e6", "#a711f2", "#c353e6", "#ed39a8", "#e66ec8", "#eb3147", "#ffae00", "#0db81e"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Add event listener for the options button
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#options").addEventListener("click", () => {
    chrome.tabs.create({ url: "options.html" });
  });
});
