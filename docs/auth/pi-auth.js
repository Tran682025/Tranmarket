<!-- docs/auth/pi-auth.js – Tranmarket Pi login helper -->

// Khóa lưu user trong localStorage
const TRM_PI_USER_KEY = "trm-pi-user-v1";

// ===== Helpers lưu / đọc user =====
function saveUser(profile) {
  try {
    localStorage.setItem(TRM_PI_USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Tranmarket – cannot save user to localStorage:", e);
  }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(TRM_PI_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Tranmarket – cannot read user from localStorage:", e);
    return null;
  }
}

function clearUser() {
  try {
    localStorage.removeItem(TRM_PI_USER_KEY);
  } catch (e) {
    console.warn("Tranmarket – cannot clear user from localStorage:", e);
  }
}

// ===== Render UI trong <div id="pi-login"> =====
function renderLoggedOut(container, onLogin) {
  container.innerHTML = `
    <button id="trm-pi-login-btn"
            style="
              padding:6px 14px;
              border-radius:999px;
              border:none;
              cursor:pointer;
              font-size:12px;
              font-weight:600;
              color:#fff;
              background:linear-gradient(90deg,#7a00ff,#ffbb00);
              box-shadow:0 0 10px rgba(0,0,0,0.6);
              white-space:nowrap;">
      Login with Pi Wallet
    </button>
  `;

  const btn = container.querySelector("#trm-pi-login-btn");
  if (btn) {
    btn.addEventListener("click", onLogin);
  }
}

function renderLoggedIn(container, profile, onLogout) {
  const username = profile.username || "Pi user";
  const wallet = profile.wallet_address || "";
  const shortWallet = wallet
    ? wallet.slice(0, 6) + "..." + wallet.slice(-4)
    : "no wallet";

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;font-size:11px;">
      <span>✅ ${username}</span>
      <span style="opacity:0.75;">(${shortWallet})</span>
      <button id="trm-pi-logout-btn"
              style="
                padding:2px 8px;
                border-radius:999px;
                border:1px solid rgba(255,255,255,0.3);
                background:transparent;
                color:#fff;
                font-size:10px;
                cursor:pointer;">
        Logout
      </button>
    </div>
  `;

  const btn = container.querySelector("#trm-pi-logout-btn");
  if (btn) {
    btn.addEventListener("click", onLogout);
  }
}

// ===== Hàm login chính =====
async function loginWithPi(updateUI) {
  if (typeof window.Pi === "undefined") {
    throw new Error("Pi SDK is not available yet.");
  }

  // Production: sandbox = false
  window.Pi.init({
    version: "2.0",
    sandbox: false
  });

  const scopes = ["username", "wallet_address", "platform"];

  const authResult = await window.Pi.authenticate(
    scopes,
    function onIncompletePaymentFound(payment) {
      console.log("[Tranmarket] onIncompletePaymentFound:", payment);
    }
  );

  const user = authResult && authResult.user ? authResult.user : {};

  const walletAddress =
    user.wallet_address ||
    (user.credentials && user.credentials.wallet_address) ||
    "";

  const platform =
    (authResult && authResult.app && authResult.app.platform) ||
    "pi-browser";

  const validUntil =
    (authResult && authResult.accessToken && authResult.accessToken.expiresAt) ||
    null;

  const profile = {
    username: user.username || "",
    uid: user.uid || "",
    wallet_address: walletAddress,
    platform: platform,
    valid_until: validUntil
  };

  saveUser(profile);
  updateUI(profile);
}

// ===== Logout =====
function doLogout(updateUI) {
  clearUser();
  updateUI(null);
}

// ===== Khởi động trên từng trang =====
window.initPiLogin = function () {
  const container = document.getElementById("pi-login");
  if (!container) {
    console.warn(
      "Tranmarket – initPiLogin: không tìm thấy <div id='pi-login'></div> trong trang."
    );
    return;
  }

  let tries = 0;
  const maxTries = 12; // ~6–8 giây là đủ

  function updateUI(profile) {
    if (profile) {
      renderLoggedIn(container, profile, () => doLogout(updateUI));
    } else {
      renderLoggedOut(container, handleLoginClick);
    }
  }

  async function handleLoginClick() {
    try {
      await loginWithPi(updateUI);
    } catch (err) {
      console.error("[Tranmarket Pi Auth Error]", err);
      alert(
        "Đăng nhập với ví Pi thất bại.\n\nChi tiết: " +
          (err && err.message ? err.message : JSON.stringify(err))
      );
    }
  }

  function waitForPi() {
    if (typeof window.Pi !== "undefined") {
      const existing = getStoredUser();
      updateUI(existing);
      return;
    }

    if (tries >= maxTries) {
      container.innerText =
        "[Pi Web3 không khả dụng. Hãy mở Tranmarket trong Pi Browser để đăng nhập.]";
      return;
    }

    tries++;
    container.innerText = "[Đang tải Pi Web3…]";
    setTimeout(waitForPi, 600);
  }

  waitForPi();
};
