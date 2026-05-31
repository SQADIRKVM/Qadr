// Synchronously load env.js which registers the global QADR_ENV configuration
try {
  importScripts('env.js');
} catch (e) {
  console.error("Failed to importScripts('env.js'):", e);
}

async function getCredentials() {
  return typeof QADR_ENV !== 'undefined' ? QADR_ENV : {};
}


// Helper to generate IDs matching Qadr's style
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Helper to capture active tab screenshot
function captureTabPromise(windowId) {
  return new Promise((resolve) => {
    chrome.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 40 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.warn("captureVisibleTab error:", chrome.runtime.lastError.message);
        resolve(undefined);
      } else {
        resolve(dataUrl);
      }
    });
  });
}

// Classify URL to get appropriate Qadr contentKind, platform and type badges
function classifyUrl(url) {
  const u = url.toLowerCase();
  let platform = "generic";
  let contentKind = "link";
  let type = "url";
  let isReel = false;

  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    platform = "youtube";
    if (u.includes("/shorts") || u.includes("shorts/")) {
      contentKind = "reel";
      type = "video";
      isReel = true;
    } else {
      contentKind = "video";
      type = "video";
    }
  } else if (u.includes("instagram.com")) {
    platform = "instagram";
    if (u.includes("/reel/") || u.includes("/reels/")) {
      contentKind = "reel";
      type = "video";
      isReel = true;
    } else {
      contentKind = "social";
      type = "url";
    }
  } else if (u.includes("tiktok.com")) {
    platform = "tiktok";
    contentKind = "reel";
    type = "video";
    isReel = true;
  } else if (u.includes("twitter.com") || u.includes("x.com")) {
    platform = "x";
    contentKind = "social";
    type = "url";
  } else if (u.includes("reddit.com")) {
    platform = "reddit";
    contentKind = "social";
    type = "url";
  } else if (u.includes("linkedin.com")) {
    platform = "linkedin";
    contentKind = "social";
    type = "url";
  }

  return { platform, contentKind, type, isReel };
}

// Fetch sync_domains from Supabase, append capture, and upsert back
async function saveToMind(userId, input) {
  if (!userId) throw new Error("Sync Key/User ID not set");

  const config = await getCredentials();
  const now = new Date().toISOString();
  const id = generateId();
  const { platform, contentKind, type, isReel } = classifyUrl(input.url || "");

  // Create clean Qadr MindItem payload
  const newItem = {
    id,
    type: input.type || type,
    contentKind: input.contentKind || contentKind,
    title: input.title || "Saved capture",
    rawContent: input.url || input.text || "",
    url: input.url || undefined,
    platform: platform !== "generic" ? platform : undefined,
    isReel: isReel || undefined,
    imageText: input.type === "image" ? "Saved image capture" : undefined,
    imageUri: input.imageUri || undefined,
    previewImageUrl: input.imageUri || undefined,
    autoTags: ["saved", "web-clipper"],
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    enrichPending: true,
    aiEnriched: false,
    videoUrl: input.videoUrl || undefined,
  };

  // 1. Fetch current Zustand store state from Supabase sync_domains
  const { token } = await chrome.storage.local.get(["token"]);
  const authHeader = token ? `Bearer ${token}` : `Bearer ${config.SUPABASE_KEY}`;
  console.log("Saving item using auth type:", token ? "Firebase User JWT" : "Supabase Anon Key");

  const getUrl = `${config.SUPABASE_URL}/rest/v1/sync_domains?domain=eq.qadr-mind-items&user_id=eq.${userId}`;
  const getRes = await fetch(getUrl, {
    method: "GET",
    headers: {
      "apikey": config.SUPABASE_KEY,
      "Authorization": authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!getRes.ok) {
    throw new Error(`Failed to fetch current captures: ${getRes.statusText}`);
  }

  const rows = await getRes.json();
  let items = [];
  if (rows && rows[0] && rows[0].payload && Array.isArray(rows[0].payload.items)) {
    items = rows[0].payload.items;
  }

  // Prepend new item and filter duplicates of the same URL if it exists
  if (newItem.url) {
    items = items.filter(
      (item) => !item.url || item.url.trim().toLowerCase() !== newItem.url.trim().toLowerCase()
    );
  }
  const updatedItems = [newItem, ...items];

  // 2. Upsert updated payload back to Supabase
  const upsertUrl = `${config.SUPABASE_URL}/rest/v1/sync_domains`;
  const upsertBody = {
    user_id: userId,
    domain: "qadr-mind-items",
    payload: { items: updatedItems },
    updated_at: now,
  };

  const upsertRes = await fetch(upsertUrl, {
    method: "POST",
    headers: {
      "apikey": config.SUPABASE_KEY,
      "Authorization": authHeader,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify(upsertBody),
  });

  if (!upsertRes.ok) {
    const errBody = await upsertRes.text().catch(() => "");
    throw new Error(`Failed to save capture: ${upsertRes.status} ${upsertRes.statusText} — ${errBody}`);
  }

  return newItem;
}

// ─── DYNAMIC POPUP MANAGEMENT ──────────────────────────────────────────
// When logged in: no popup, icon click = instant save (mymind style)
// When not logged in: show popup for login

function updatePopupState(isLoggedIn) {
  if (isLoggedIn) {
    // Remove popup so onClicked fires — instant save mode
    chrome.action.setPopup({ popup: "" });
    chrome.action.setTitle({ title: "Click to save this page to Mind" });
  } else {
    // Show login popup
    chrome.action.setPopup({ popup: "popup.html" });
    chrome.action.setTitle({ title: "Qadr Mind — Sign in to start saving" });
  }
}

// Check auth state and update popup on startup
chrome.storage.local.get(["userId"], (res) => {
  updatePopupState(!!res.userId);
});

// Listen for auth changes to toggle popup mode
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.userId) {
    updatePopupState(!!changes.userId.newValue);
  }
});

// ─── ONE-CLICK INSTANT SAVE (fires only when popup is removed) ─────────

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    return;
  }

  chrome.storage.local.get(["userId"], async (res) => {
    const userId = res.userId;
    if (!userId) {
      // Shouldn't happen (popup should be set), but safety fallback
      chrome.action.setPopup({ popup: "popup.html" });
      return;
    }

    // 1. Show "saving..." toast immediately
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "saving_started",
        title: tab.title || "Saving...",
      });
    } catch (e) {
      // Content script may not be loaded yet, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["content.css"],
        });
        await chrome.tabs.sendMessage(tab.id, {
          action: "saving_started",
          title: tab.title || "Saving...",
        });
      } catch (e2) {
        console.warn("Could not inject content script:", e2);
      }
    }

    // 2. Query videoUrl from active tab
    let videoUrl = undefined;
    try {
      const resp = await chrome.tabs.sendMessage(tab.id, { action: "get_video_url" });
      if (resp && resp.videoUrl) {
        videoUrl = resp.videoUrl;
      }
    } catch (e) {
      console.warn("Could not query videoUrl directly from tab, attempting after injecting script...");
    }

    // 3. Capture and Save to Supabase
    try {
      const imageUri = await captureTabPromise(null);
      // If we couldn't get videoUrl, try one more time after injecting content script (if context was invalidated)
      if (!videoUrl) {
        try {
          const resp = await chrome.tabs.sendMessage(tab.id, { action: "get_video_url" });
          if (resp && resp.videoUrl) {
            videoUrl = resp.videoUrl;
          }
        } catch (e) { /* ignore */ }
      }

      const item = await saveToMind(userId, {
        url: tab.url,
        title: tab.title,
        imageUri: imageUri,
        videoUrl: videoUrl,
      });

      // 3. Show "saved!" toast
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "item_saved",
          item: item,
        });
      } catch (e) {
        console.warn("Could not send saved toast:", e);
      }
    } catch (err) {
      console.error("Save failed:", err);
      // Show error toast
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "save_error",
          error: err.message,
        });
      } catch (e) {
        console.warn("Could not send error toast:", e);
      }
    }
  });
});

// ─── CONTEXT MENUS ──────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-page",
    title: "Save page to Qadr Mind 🧠",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "save-selection",
    title: "Save selection to Qadr Mind ✍️",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "save-image",
    title: "Save image to Qadr Mind 🖼️",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  chrome.storage.local.get(["userId"], async (res) => {
    const userId = res.userId;
    if (!userId) {
      chrome.action.setPopup({ popup: "popup.html" });
      return;
    }

    try {
      let itemInput = {};
      if (info.menuItemId === "save-page") {
        const imageUri = await captureTabPromise(null);
        itemInput = {
          url: info.pageUrl,
          title: tab.title,
          imageUri: imageUri,
        };
      } else if (info.menuItemId === "save-selection") {
        itemInput = {
          text: info.selectionText,
          title: "Selection Highlight",
          type: "note",
          contentKind: "link",
        };
      } else if (info.menuItemId === "save-image") {
        itemInput = {
          url: info.srcUrl,
          imageUri: info.srcUrl,
          title: "Saved Image capture",
          type: "image",
          contentKind: "link",
        };
      }

      // Show saving toast
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "saving_started",
          title: itemInput.title || "Saving...",
        });
      } catch (e) { /* content script may not be ready */ }

      const item = await saveToMind(userId, itemInput);

      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "item_saved",
          item: item,
        });
      } catch (e) { /* content script may not be ready */ }
    } catch (err) {
      console.error(err);
    }
  });
});

// ─── MESSAGE HANDLER ────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sync_auth") {
    if (message.userId) {
      chrome.storage.local.set({ userId: message.userId, token: message.token }, () => {
        console.log("Automatically synced Qadr session ID and token:", message.userId);
      });
    } else if (message.logout) {
      chrome.storage.local.remove(["userId", "token", "email"], () => {
        console.log("Automatically disconnected Qadr session via web logout.");
      });
    }
    return false;
  }

  if (message.action === "save_link") {
    chrome.storage.local.get(["userId"], async (res) => {
      const userId = res.userId;
      if (!userId) {
        sendResponse({ success: false, error: "Not logged in" });
        return;
      }
      try {
        const item = await saveToMind(userId, {
          url: message.url,
          title: message.title || "Custom Note",
        });
        sendResponse({ success: true, item });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true; // Keep channel open for async response
  }
});
