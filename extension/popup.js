async function getCredentials() {
  return typeof QADR_ENV !== 'undefined' ? QADR_ENV : {};
}


// Dynamically scan all open tabs to find any running Qadr workspace to extract the logged-in Firebase details.
// Checks our custom key first, then falls back to Firebase SDK's own persistence keys.
async function syncAuthFromOpenTabs() {
  try {
    const config = await getCredentials();
    const targetUrl = config.WEB_APP_URL || "https://qadr-os.vercel.app";
    
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        if (!tabs || tabs.length === 0) {
          resolve(false);
          return;
        }

        console.log("Qadr Extension scanning open tabs for workspace...");
        
        // Search all open tabs to find the first Qadr workspace tab
        const qadrTab = tabs.find((tab) => {
          if (!tab.url) return false;
          const u = tab.url.toLowerCase();
          const t = tab.title ? tab.title.toLowerCase() : "";
          const isMatch = u.includes("qadr-os.vercel.app") || 
                          u.includes("localhost") || 
                          u.includes("127.0.0.1") || 
                          u.includes("qadr") ||
                          u.includes(":8081") ||
                          u.includes(":19006") ||
                          t.includes("qadr") ||
                          u.includes(targetUrl.toLowerCase());
          
          if (isMatch) {
            console.log("Matched Qadr workspace tab:", { url: tab.url, title: tab.title });
          }
          return isMatch;
        });

        if (!qadrTab) {
          resolve(false);
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: qadrTab.id },
          world: 'MAIN',
          func: () => {
            const uid = localStorage.getItem('qadr-auth-uid');
            const token = localStorage.getItem('qadr-auth-token');
            return { uid, token };
          }
        }, (results) => {
          if (chrome.runtime.lastError || !results || !results[0] || !results[0].result) {
            resolve(false);
            return;
          }

          const { uid, token } = results[0].result;
          if (uid) {
            chrome.storage.local.set({ userId: uid, token: token }, () => {
              console.log("Synced auth from active Qadr tab (LocalStorage):", uid);
              resolve(true);
            });
          } else {
            resolve(false);
          }
        });
      });
    });
  } catch (e) {
    console.error("Error in syncAuthFromOpenTabs:", e);
    return false;
  }
}

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const activeScreen = document.getElementById("active-screen");
const syncKeyInput = document.getElementById("sync-key-input");
const connectSyncBtn = document.getElementById("connect-sync-btn");
const webLoginBtn = document.getElementById("web-login-btn");
const toggleManualBtn = document.getElementById("toggle-manual-btn");
const manualAuthSection = document.getElementById("manual-auth-section");
const authErrorMsg = document.getElementById("auth-error-msg");
const disconnectBtn = document.getElementById("disconnect-btn");
const quickInput = document.getElementById("quick-input");
const quickAddBtn = document.getElementById("quick-add-btn");
const quickSaveStatus = document.getElementById("quick-save-status");
const activePageTitle = document.getElementById("active-page-title");
const activePageUrl = document.getElementById("active-page-url");
const savePageBtn = document.getElementById("save-page-btn");
const recentsList = document.getElementById("recents-list");

let currentTab = null;

// Initialize Popup
document.addEventListener("DOMContentLoaded", async () => {
  // Try to sync auth from open tabs first if extension is not authenticated
  chrome.storage.local.get(["userId"], async (res) => {
    if (!res.userId) {
      await syncAuthFromOpenTabs();
    }
    checkAuthState();
    fetchActiveTabDetails();
  });
  
  // Listen for storage changes to refresh state instantly when web-login succeeds
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.userId)) {
      checkAuthState();
    }
  });
});

// Toggle views depending on authentication state
function checkAuthState() {
  chrome.storage.local.get(["userId"], (res) => {
    if (res.userId) {
      loginScreen.classList.remove("active");
      activeScreen.classList.add("active");
      refreshRecentsFeed(res.userId);
    } else {
      activeScreen.classList.remove("active");
      loginScreen.classList.add("active");
    }
  });
}

// Fetch details of the active browser tab
function fetchActiveTabDetails() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      currentTab = tabs[0];
      if (currentTab.url && !currentTab.url.startsWith("chrome://")) {
        activePageTitle.textContent = currentTab.title || "Untitled Web Page";
        activePageUrl.textContent = currentTab.url;
        savePageBtn.disabled = false;
      } else {
        activePageTitle.textContent = "Cannot save system pages";
        activePageUrl.textContent = "Clipper disabled for system URLs";
        savePageBtn.disabled = true;
      }
    }
  });
}

// Method A: Connect with pasted user ID (Sync Key)
connectSyncBtn.addEventListener("click", () => {
  const syncKey = syncKeyInput.value.trim();
  authErrorMsg.textContent = "";

  if (!syncKey) {
    authErrorMsg.textContent = "Please paste a valid Qadr Sync Key / User ID.";
    return;
  }

  // Save ID directly
  chrome.storage.local.set({ userId: syncKey }, () => {
    syncKeyInput.value = "";
    checkAuthState();
  });
});

// Web Login: Open Qadr Web App Workspace in new tab
webLoginBtn.addEventListener("click", async () => {
  const config = await getCredentials();
  const targetUrl = config.WEB_APP_URL || "http://localhost:8081";
  chrome.tabs.create({ url: targetUrl });
});

// Toggle manual Sync Key Paste section visibility
toggleManualBtn.addEventListener("click", () => {
  manualAuthSection.classList.toggle("hidden");
  if (manualAuthSection.classList.contains("hidden")) {
    toggleManualBtn.textContent = "Connect manually with Sync Key";
  } else {
    toggleManualBtn.textContent = "Hide manual connection";
  }
});

// Disconnect/Logout Handler
disconnectBtn.addEventListener("click", () => {
  chrome.storage.local.remove(["userId", "email"], () => {
    checkAuthState();
  });
});

// Save Active Webpage Link
savePageBtn.addEventListener("click", () => {
  if (!currentTab || !currentTab.url) return;

  savePageBtn.disabled = true;
  savePageBtn.textContent = "Saving...";

  chrome.runtime.sendMessage(
    {
      action: "save_link",
      url: currentTab.url,
      title: currentTab.title,
    },
    (res) => {
      savePageBtn.disabled = false;
      savePageBtn.textContent = "Save Link";

      if (res && res.success) {
        // Trigger visual toast overlay on tab
        chrome.tabs.sendMessage(currentTab.id, {
          action: "item_saved",
          item: res.item,
        });
        chrome.storage.local.get(["userId"], (storage) => {
          refreshRecentsFeed(storage.userId);
        });
      } else {
        alert("Failed to save capture: " + (res ? res.error : "Unknown error"));
      }
    }
  );
});

// Quick Add custom notes / manual URLs
async function handleQuickAdd() {
  const text = quickInput.value.trim();
  quickSaveStatus.className = "status-msg";
  quickSaveStatus.textContent = "";

  if (!text) return;

  quickInput.disabled = true;
  quickAddBtn.disabled = true;

  chrome.runtime.sendMessage(
    {
      action: "save_link",
      url: text.startsWith("http") ? text : undefined,
      title: text.startsWith("http") ? "Saved Clipper Link" : text,
    },
    (res) => {
      quickInput.disabled = false;
      quickAddBtn.disabled = false;

      if (res && res.success) {
        quickInput.value = "";
        quickSaveStatus.classList.add("success");
        quickSaveStatus.textContent = "Saved to your Mind successfully!";
        chrome.storage.local.get(["userId"], (storage) => {
          refreshRecentsFeed(storage.userId);
        });
        setTimeout(() => {
          quickSaveStatus.textContent = "";
        }, 3000);
      } else {
        quickSaveStatus.classList.add("error");
        quickSaveStatus.textContent = "Error: " + (res ? res.error : "Failed to save");
      }
    }
  );
}

quickAddBtn.addEventListener("click", handleQuickAdd);
quickInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleQuickAdd();
});

// Refresh list of 5 recent captures
async function refreshRecentsFeed(userId) {
  try {
    const config = await getCredentials();
    const { token } = await chrome.storage.local.get(["token"]);
    const authHeader = token ? `Bearer ${token}` : `Bearer ${config.SUPABASE_KEY}`;

    const getUrl = `${config.SUPABASE_URL}/rest/v1/sync_domains?domain=eq.qadr-mind-items&user_id=eq.${userId}`;
    const res = await fetch(getUrl, {
      method: "GET",
      headers: {
        "apikey": config.SUPABASE_KEY,
        "Authorization": authHeader,
      },
    });

    if (!res.ok) return;

    const rows = await res.json();
    let items = [];
    if (rows && rows[0] && rows[0].payload && Array.isArray(rows[0].payload.items)) {
      items = rows[0].payload.items;
    }

    recentsList.innerHTML = "";
    if (items.length === 0) {
      recentsList.innerHTML = `<p class="empty-state">No recent captures found. Try saving a page!</p>`;
      return;
    }

    // Display first 5 captures
    const recentItems = items.slice(0, 5);
    recentItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "recent-card";

      const title = document.createElement("div");
      title.className = "recent-title";
      title.textContent = item.title || "Saved capture";
      card.appendChild(title);

      const metaRow = document.createElement("div");
      metaRow.className = "recent-meta-row";

      // Badge indicator
      const format = item.contentKind || item.type || "link";
      const badge = document.createElement("span");
      badge.className = `badge ${format === "reel" ? "reel" : format === "video" ? "video" : "link"}`;
      badge.textContent = format;
      metaRow.appendChild(badge);

      // Top 2 tags
      const tags = item.autoTags || [];
      tags.slice(0, 2).forEach((tag) => {
        const tagSpan = document.createElement("span");
        tagSpan.className = "tag-pill";
        tagSpan.textContent = `#${tag}`;
        metaRow.appendChild(tagSpan);
      });

      card.appendChild(metaRow);
      recentsList.appendChild(card);
    });
  } catch (e) {
    console.error("Failed to load recents feed: ", e);
  }
}
