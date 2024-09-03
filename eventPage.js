// Interval (in seconds) to update the timer
const UPDATE_INTERVAL = 1;

initializeDefaults();

// Function to initialize default settings
function initializeDefaults() {
  const defaults = {
    date: new Date().toLocaleDateString(),
    domains: JSON.stringify({}),
    total: JSON.stringify({ today: 0 }),
    daily_limit_hr: 24,
    daily_limit_min: 0,
    daily_limit_sec: 0,
    flag: 0,
    chart_limit: 7,
    other: JSON.stringify({ today: 0 }),
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!localStorage[key]) {
      localStorage[key] = value;
    }
  }
}

// Function to combine domains that are not in the top threshold into the "other" category
function combineEntries(threshold) {
  const domains = JSON.parse(localStorage["domains"]);
  const other = JSON.parse(localStorage["other"]);

  if (Object.keys(domains).length <= threshold) return;

  const domainEntries = Object.entries(domains).map(([domain]) => ({
    domain,
    today: JSON.parse(localStorage[domain]).today,
  }));

  domainEntries.sort((a, b) => b.today - a.today);

  for (let i = threshold; i < domainEntries.length; i++) {
    const domain = domainEntries[i].domain;
    delete localStorage[domain];
    delete domains[domain];
  }

  localStorage["other"] = JSON.stringify(other);
  localStorage["domains"] = JSON.stringify(domains);
}

// Function to check if the data needs to be reset for a new day
function checkDate() {
  const todayStr = new Date().toLocaleDateString();
  const savedDay = localStorage["date"];

  if (savedDay !== todayStr) {
    localStorage["flag"] = 0;

    const domains = JSON.parse(localStorage["domains"]);
    for (const domain in domains) {
      const domainData = JSON.parse(localStorage[domain]);
      domainData.today = 0;
      localStorage[domain] = JSON.stringify(domainData);
    }

    const total = JSON.parse(localStorage["total"]);
    total.today = 0;
    localStorage["total"] = JSON.stringify(total);

    combineEntries(500);
    localStorage["date"] = todayStr;
  }
}

// Function to extract the domain from a URL
function extractDomain(url) {
  const domainMatch = url.match(/:\/\/(www\.)?(.+?)\//);
  return domainMatch ? domainMatch[2] : '';
}

// Function to check if the URL should be blacklisted
function inBlacklist(url) {
  return !url.match(/^http/);
}

// Function to update the data for the active tab
function updateData() {
  chrome.idle.queryState(30, (state) => {
    if (state === "active") {
      chrome.tabs.query({ lastFocusedWindow: true, active: true }, (tabs) => {
        if (tabs.length === 0) return;

        const tab = tabs[0];
        checkDate();

        if (!inBlacklist(tab.url)) {
          const domain = extractDomain(tab.url);
          let domains = JSON.parse(localStorage["domains"]);

          if (!(domain in domains)) {
            domains[domain] = 1;
            localStorage["domains"] = JSON.stringify(domains);
          }

          const domainData = localStorage[domain]
            ? JSON.parse(localStorage[domain])
            : { today: 0 };

          domainData.today += UPDATE_INTERVAL;
          localStorage[domain] = JSON.stringify(domainData);

          const total = JSON.parse(localStorage["total"]);
          total.today += UPDATE_INTERVAL;
          localStorage["total"] = JSON.stringify(total);

          const numMin = Math.floor(domainData.today / 60).toString().padEnd(4, "m");
          chrome.browserAction.setBadgeText({ text: numMin });
        } else {
          chrome.browserAction.setBadgeText({ text: "" });
        }
      });
    }
  });

  const h = parseInt(localStorage["daily_limit_hr"], 10);
  const m = parseInt(localStorage["daily_limit_min"], 10);
  const s = parseInt(localStorage["daily_limit_sec"], 10);
  const total = JSON.parse(localStorage["total"]);
  const dailyLimit = 3600 * h + 60 * m + s;

  if (total.today >= dailyLimit && localStorage["flag"] == 0) {
    chrome.notifications.create('limitNotif', {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Limit Reached for Today',
      message: 'Your Web Time has finished for the Day!!!'
    });
    localStorage["flag"] = 1;
  }
}

// Set the interval to update data
setInterval(updateData, UPDATE_INTERVAL * 1000);
