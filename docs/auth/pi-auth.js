// docs/auth/pi-auth.js
// Tranmarket – Pi Auth v1 (direct.html)

(function () {
  // Nếu không có Pi SDK (không mở trong Pi Browser) thì bỏ qua luôn
  if (typeof window.Pi === "undefined") {
    console.warn("[Tranmarket] Pi SDK not found. Are you inside Pi Browser?");
    return;
  }

  // Khởi tạo Pi SDK (đang để sandbox:true – sau này lên mainnet chỉ cần đổi lại)
  try {
    window.Pi.init({
      version: "2.0",
      sandbox: true
    });
  } catch (e) {
    console.error("[Tranmarket] Pi.init error:", e);
  }

  // ===== Helpers UI =====

  function renderLoggedOut(container, updateUI) {
    container.innerHTML = "";

    const btn = document.createElement("button");
    btn.className = "pi-login-btn";
    btn.textContent = "Login with Pi Wallet";

    // style inline cho chắc ăn, sau này muốn chỉnh thì đẩy sang CSS
    btn.style.padding = "8px 18px";
    btn.style.borderRadius = "999px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "13px";
    btn.style.fontWeight = "600";
    btn.style.color = "#ffffff";
    btn.style.background = "linear-gradient(90deg, #7a00ff, #ffbb00)";
    btn.style.boxShadow = "0 0 16px rgba(0,0,0,0.7)";

    btn.onclick = function () {
      loginWithPi(updateUI);
    };

    container.appendChild(btn);
  }

  function renderLoggedIn(container, profile, updateUI) {
    container.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.style.display = "inline-flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "8px";
    wrap.style.padding = "6px 12px";
    wrap.style.borderRadius = "999px";
    wrap.style.background = "rgba(15, 8, 60, 0.9)";
    wrap.style.border = "1px solid rgba(159,123,255,0.7)";
    wrap.style.fontSize = "12px";

    const span = document.createElement("span");
    const username = profile.username || "unknown";
    const wallet = profile.wallet_address
      ? profile.wallet_address.slice(0, 4) +
        "..." +
        profile.wallet_address.slice(-4)
      : "no wallet";

    span.textContent = "@" + username + " • " + wallet;

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.style.marginLeft = "8px";
    logoutBtn.style.padding = "4px 10px";
    logoutBtn.style.borderRadius = "999px";
    logoutBtn.style.border = "none";
    logoutBtn.style.cursor = "pointer";
    logoutBtn.style.fontSize = "11px";
    logoutBtn.style.fontWeight = "600";
    logoutBtn.style.background = "rgba(255,255,255,0.08)";
    logoutBtn.style.color = "#f5f6ff";

    logoutBtn.onclick = function () {
      clearUser();
      updateUI(null);
    };

    wrap.appendChild(span);
    wrap.appendChild(logoutBtn);
    container.appendChild(wrap);
  }

  // ===== Local storage (Phase 10 sau xài tiếp) =====

  function getStoredUser() {
    try {
      const raw = localStorage.getItem("tranmarket_pi_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[Tranmarket] getStoredUser error:", e);
      return null;
    }
  }

  function saveUser(profile) {
    try {
      localStorage.setItem("tranmarket_pi_user", JSON.stringify(profile));
    } catch (e) {
      console.warn("[Tranmarket] saveUser error:", e);
    }
  }

  function clearUser() {
    try {
      localStorage.removeItem("tranmarket_pi_user");
    } catch (e) {
      console.warn("[Tranmarket] clearUser error:", e);
    }
  }

  // ===== Core login với Pi =====

  async function loginWithPi(updateUI) {
    if (typeof window.Pi === "undefined") {
      alert("Không tìm thấy Pi SDK. Vui lòng mở Tranmarket trong Pi Browser.");
      return;
    }

    try {
      const scopes = ["username", "wallet_address", "platform"];

      const authResult = await window.Pi.authenticate(
        scopes,
        function onIncompletePaymentFound(payment) {
          console.log("[Tranmarket] onIncompletePaymentFound", payment);
        }
      );

      const user = authResult && authResult.user;
      if (!user) {
        throw new Error("No user data returned from Pi.authenticate");
      }

      const walletAddress =
        user.wallet_address ||
        (user.credentials && user.credentials.wallet_address) ||
        "";

      const profile = {
        username: user.username || "",
        uid: user.uid || "",
        wallet_address: walletAddress,
        platform: authResult.platform || "",
        valid_until: authResult.accessToken && authResult.accessToken.lifetime
          ? authResult.accessToken.lifetime
          : null
      };

      console.log("[Tranmarket] Pi auth profile:", profile);

      saveUser(profile);
      updateUI(profile);
    } catch (err) {
      console.error("[Tranmarket Pi Auth Error]", err);
      const msg =
        err && err.message
          ? err.message
          : typeof err === "string"
          ? err
          : JSON.stringify(err);
      alert("Đăng nhập với ví Pi thất bại.\n\nChi tiết: " + msg);
    }
  }

  // ===== Hàm global để direct.html gọi =====

  window.initPiLogin = function () {
    const container = document.getElementById("pi-login");
    if (!container) {
      console.warn(
        "[Tranmarket] initPiLogin: không tìm thấy phần tử #pi-login trên trang."
      );
      return;
    }

    function updateUI(profile) {
      if (profile) {
        renderLoggedIn(container, profile, updateUI);
      } else {
        renderLoggedOut(container, updateUI);
      }
    }

    const stored = getStoredUser();
    if (stored && stored.username) {
      updateUI(stored);
    } else {
      updateUI(null);
    }
  };
})();
