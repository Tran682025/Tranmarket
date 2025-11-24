// docs/auth/pi-auth.js
// Simple Pi login helper for Tranmarket (direct.html + future pages)

const STORAGE_KEY = "tranmarket_pi_user";
let currentUser = null;

// -------------------- Storage helpers --------------------

function saveUser(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("[Tranmarket] Cannot save user to localStorage:", e);
  }
}

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("[Tranmarket] Cannot read user from localStorage:", e);
    return null;
  }
}

function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[Tranmarket] Cannot clear user from localStorage:", e);
  }
}

// -------------------- UI helper --------------------

function shortAddress(addr) {
  if (!addr || typeof addr !== "string") return "";
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function updateUI(profile) {
  const container = document.getElementById("pi-login");
  if (!container) {
    console.warn("[Tranmarket] updateUI: div#pi-login not found on this page.");
    return;
  }

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px";

  // NOT logged in -> show big gradient button
  if (!profile || !profile.username) {
    const btn = document.createElement("button");
    btn.textContent = "Login with Pi Wallet";
    btn.style.border = "none";
    btn.style.borderRadius = "999px";
    btn.style.padding = "8px 18px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "13px";
    btn.style.fontWeight = "600";
    btn.style.color = "#fff";
    btn.style.backgroundImage = "linear-gradient(90deg,#7a00ff,#ffbb00)";
    btn.style.boxShadow = "0 0 18px rgba(0,0,0,0.6)";
    btn.onclick = handleLoginClick;

    wrapper.appendChild(btn);
  } else {
    // Logged in -> show username + short address + logout
    const info = document.createElement("div");
    info.style.fontSize = "12px";
    info.style.color = "#f5f6ff";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = profile.username;

    const sep = document.createElement("span");
    sep.textContent = " · ";
    sep.style.opacity = "0.7";

    const addrSpan = document.createElement("span");
    addrSpan.textContent = shortAddress(profile.wallet_address);
    addrSpan.style.opacity = "0.8";

    info.appendChild(nameSpan);
    info.appendChild(sep);
    info.appendChild(addrSpan);

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.style.marginLeft = "10px";
    logoutBtn.style.border = "1px solid rgba(159,123,255,0.7)";
    logoutBtn.style.borderRadius = "999px";
    logoutBtn.style.padding = "4px 10px";
    logoutBtn.style.cursor = "pointer";
    logoutBtn.style.fontSize = "11px";
    logoutBtn.style.background = "rgba(8,0,40,0.9)";
    logoutBtn.style.color = "#f5f6ff";
    logoutBtn.onclick = doLogout;

    wrapper.appendChild(info);
    wrapper.appendChild(logoutBtn);
  }

  container.appendChild(wrapper);
}

// -------------------- Pi SDK login core --------------------

async function loginWithPi() {
  if (typeof window.Pi === "undefined") {
    throw new Error("Pi SDK not found – hãy mở Tranmarket trong Pi Browser.");
  }

  // Init Pi SDK (sandbox=true cho test; sau này mainnet thì đổi sang false)
  window.Pi.init({
    version: "2.0",
    sandbox: true
  });

  const scopes = ["username", "wallet_address", "platform"];

  const authResult = await window.Pi.authenticate(
    scopes,
    function onIncompletePaymentFound(payment) {
      console.log("[Tranmarket] onIncompletePaymentFound:", payment);
      // Phase sau nếu có thanh toán thì xử lý tiếp ở đây
    }
  );

  const user = (authResult && authResult.user) ? authResult.user : {};
  const walletAddress =
    user.wallet_address ||
    (user.credentials && user.credentials.wallet_address) ||
    "";

  const platform =
    user.platform ||
    authResult.platform ||
    "";

  const validUntil =
    (authResult.accessToken && authResult.accessToken.expiresAt) ||
    null;

  const profile = {
    username: user.username || "",
    uid: user.uid || "",
    wallet_address: walletAddress,
    platform: platform,
    valid_until: validUntil
  };

  saveUser(profile);
  currentUser = profile;
  return profile;
}

// -------------------- Public handlers --------------------

async function handleLoginClick() {
  try {
    const profile = await loginWithPi();
    updateUI(profile);
  } catch (err) {
    const rawMsg = err && err.message ? String(err.message) : "";
    const msg = rawMsg.toLowerCase();

    // User bấm Cancel / đóng popup → không coi là lỗi
    if (msg.includes("cancel") || msg.includes("decline")) {
      console.log("[Tranmarket] User cancelled Pi login:", rawMsg);
      return;
    }

    console.error("[Tranmarket Pi Auth Error]", err);
    alert(
      "Đăng nhập với ví Pi thất bại.\n\nChi tiết: " +
      (rawMsg || JSON.stringify(err))
    );
  }
}

function doLogout() {
  clearUser();
  currentUser = null;
  updateUI(null);
}

// -------------------- Init entry for pages --------------------

window.initPiLogin = function () {
  const container = document.getElementById("pi-login");
  if (!container) {
    console.warn(
      "[Tranmarket] initPiLogin: không tìm thấy <div id=\"pi-login\"></div> trên trang."
    );
    return;
  }

  currentUser = loadUser();
  updateUI(currentUser);
};
