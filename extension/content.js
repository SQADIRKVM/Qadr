// ─── MESSAGE HANDLER ────────────────────────────────────────────────────
// Listen for toast messages from the background service worker

try {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      if (message.action === "saving_started") {
        showSavingToast(message.title);
        sendResponse({ status: "saving_shown" });
      }
      if (message.action === "item_saved") {
        showSavedToast(message.item);
        sendResponse({ status: "saved_shown" });
      }
      if (message.action === "save_error") {
        showErrorToast(message.error);
        sendResponse({ status: "error_shown" });
      }
    } catch (e) {
      // Extension context may be invalidated after reload
    }
  });
} catch (e) {
  // Extension was reloaded — content script is stale, ignore
}

// ─── TOAST: "One moment, saving..." ─────────────────────────────────────

function showSavingToast(title) {
  removeExistingToasts();

  const toast = document.createElement("qadr-toast");
  toast.className = "qadr-clipper-toast qadr-toast-saving";
  toast.id = "qadr-active-toast";

  toast.innerHTML = `
    <div class="qadr-toast-row">
      <div class="qadr-toast-spinner-wrapper">
        <div class="qadr-toast-spinner"></div>
      </div>
      <div class="qadr-toast-info">
        <span class="qadr-toast-label">Qadr Clipper</span>
        <span class="qadr-toast-msg">Saving to your Mind...</span>
      </div>
    </div>
  `;

  document.body.appendChild(toast);
}

// ─── TOAST: "Saved to your Mind" ────────────────────────────────────────

function showSavedToast(item) {
  let toast = document.getElementById("qadr-active-toast");
  
  if (!toast) {
    toast = document.createElement("qadr-toast");
    toast.id = "qadr-active-toast";
    document.body.appendChild(toast);
  }

  // Add the saved state classes
  toast.className = "qadr-clipper-toast qadr-toast-saved";

  const title = item.title || "Web Link";
  const format = item.contentKind || item.type || "link";
  const tags = item.autoTags || [];
  const tagHtml = tags.slice(0, 2).map(t => `<span class="qadr-toast-tag">#${t}</span>`).join("");

  // Smooth inner-HTML change
  toast.innerHTML = `
    <div class="qadr-toast-row">
      <div class="qadr-toast-check">
        <svg class="qadr-toast-svg-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF0031" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline class="qadr-checkmark-path" points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="qadr-toast-info">
        <span class="qadr-toast-label">Saved to your Mind</span>
        <span class="qadr-toast-title">${escapeHtml(title)}</span>
        <div class="qadr-toast-tags">
          <span class="qadr-toast-badge">${format}</span>
          ${tagHtml}
        </div>
      </div>
    </div>
    <div class="qadr-toast-progress-bar"></div>
  `;

  if (toast.dismissTimeout) clearTimeout(toast.dismissTimeout);

  // Auto-dismiss after 3 seconds
  toast.dismissTimeout = setTimeout(() => {
    toast.classList.add("dismiss");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─── TOAST: Error ───────────────────────────────────────────────────────

function showErrorToast(error) {
  let toast = document.getElementById("qadr-active-toast");
  
  if (!toast) {
    toast = document.createElement("qadr-toast");
    toast.id = "qadr-active-toast";
    document.body.appendChild(toast);
  }

  toast.className = "qadr-clipper-toast qadr-toast-error";

  toast.innerHTML = `
    <div class="qadr-toast-row">
      <div class="qadr-toast-error-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="qadr-toast-info">
        <span class="qadr-toast-label" style="color: #FF4444;">Save Failed</span>
        <span class="qadr-toast-msg" style="color: #E5E2E1; font-size: 11px;">${escapeHtml(error || "Unknown error")}</span>
      </div>
    </div>
  `;

  if (toast.dismissTimeout) clearTimeout(toast.dismissTimeout);

  setTimeout(() => {
    toast.classList.add("dismiss");
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// ─── HELPERS ────────────────────────────────────────────────────────────

function removeExistingToasts() {
  const old = document.querySelectorAll(".qadr-clipper-toast");
  old.forEach(t => t.remove());
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ─── AUTH SYNC (Direct LocalStorage Bridge) ──────────────────────────────

function checkPageLocalStorageAuth() {
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.id) {
    cleanupStaleIntervals();
    return;
  }

  const uid = localStorage.getItem('qadr-auth-uid');
  const token = localStorage.getItem('qadr-auth-token');

  try {
    if (uid) {
      chrome.runtime.sendMessage({
        action: "sync_auth",
        userId: uid,
        token: token
      });
    } else {
      chrome.runtime.sendMessage({
        action: "sync_auth",
        userId: null,
        logout: true
      });
    }
  } catch (e) {
    cleanupStaleIntervals();
  }
}

let authSyncInterval = null;

function cleanupStaleIntervals() {
  if (authSyncInterval) {
    clearInterval(authSyncInterval);
    authSyncInterval = null;
  }
}

// Auto-scan on Qadr pages
const hostname = window.location.hostname;
const docTitle = document.title || "";
if (
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.includes("qadr") ||
  docTitle.toLowerCase().includes("qadr")
) {
  checkPageLocalStorageAuth();
  authSyncInterval = setInterval(checkPageLocalStorageAuth, 2000);
}
