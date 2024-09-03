// Saves options to localStorage.
function save_options() {
  saveTimeOption("daily_limit_hr");
  saveTimeOption("daily_limit_min");
  saveTimeOption("daily_limit_sec");

  var limit = parseInt(document.getElementById("chart_limit").value);
  if (!isNaN(limit)) {
    localStorage.setItem("chart_limit", limit);
  } else {
    document.getElementById("chart_limit").value = localStorage.getItem("chart_limit") || "";
  }

  // Update status to let user know options were saved.
  showStatus("Options Saved.", "success");
}

// Helper function to save time options
function saveTimeOption(id) {
  var value = parseInt(document.getElementById(id).value);
  if (!isNaN(value)) {
    localStorage.setItem(id, value);
  } else {
    document.getElementById(id).value = localStorage.getItem(id) || "";
  }
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  restoreTimeOption("daily_limit_hr");
  restoreTimeOption("daily_limit_min");
  restoreTimeOption("daily_limit_sec");

  document.getElementById("chart_limit").value = localStorage.getItem("chart_limit") || "";
}

// Helper function to restore time options
function restoreTimeOption(id) {
  document.getElementById(id).value = localStorage.getItem(id) || "";
}

// Function to show status messages
function showStatus(message, className) {
  var status = document.getElementById("status");
  status.innerHTML = message;
  status.className = className;
  setTimeout(function () {
    status.innerHTML = "";
    status.className = "";
  }, 750);
}

function clearData() {
  localStorage.clear();
  chrome.extension.getBackgroundPage().setDefaults();
  location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
  // Restore options
  restore_options();

  // Set handlers for option descriptions
  document.querySelector("#save-button").addEventListener("click", save_options);
  document.querySelector("#clear-data").addEventListener("click", clearData);
});
