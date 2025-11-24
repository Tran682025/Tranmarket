// auth/pi-auth.js – Tranmarket Pi Wallet auth (v4 – auto Pi.init + sandbox)

(function () {
  console.log("[Tranmarket] pi-auth.js loaded");
  window.TranPiAuthLoaded = true;

  // Đảm bảo Pi SDK được init đúng (dev app → sandbox: true)
  function ensurePiInit() {
    if (typeof window.Pi === "undefined") {
      console.warn("[Tranmarket] Pi SDK not found on window.Pi");
      return false;
    }
    if (window.TrmPiInitialized) {
      return true;
    }

    // Chọn sandbox tùy theo môi trường:
    // - localhost, 127.*, 10.* → sandbox: true (dev)
    // - github.io (Tranmarket) → sandbox: false (testnet public)
    const host = (window.location && window.location.hostname) || "";
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.");

    const useSandbox = isLocal ? true : false;

    try {
      window.Pi.init({
        version: "2.0",
        sandbox: useSandbox
      });
      window.TrmPiInitialized = true;
      console.log(
        "[Tranmarket] Pi.init() done (sandbox: " + useSandbox + ") on host:",
        host
      );
      return true;
    } catch (e) {
      console.error("[Tranmarket] Pi.init() failed", e);
      return false;
    }
  }


  function saveUser(profile) {
    try {
      localStorage.setItem("trm_user", JSON.stringify(profile));
    } catch (e) {
      console.warn("[Tranmarket] Cannot save profile to localStorage", e);
    }
  }

  function loadUser() {
    try {
      const raw = localStorage.getItem("trm_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[Tranmarket] Cannot parse stored profile", e);
      return null;
    }
  }

  function defaultUpdateUI(profile) {
    const c = document.getElementById("pi-login");
    if (!c) {
      console.warn("[Tranmarket] #pi-login not found.");
      return;
    }

    if (!profile) {
      c.innerHTML =
        '<button id="trm-login-btn" ' +
        'style="padding:10px 18px;border-radius:999px;border:none;' +
        'background:linear-gradient(90deg,#7a00ff,#ffbb00);color:#fff;' +
        'font-weight:600;font-size:13px;cursor:pointer;">' +
        'CONNECT PI WALLET' +
        "</button>";

      const btn = document.getElementById("trm-login-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          loginWithPi(defaultUpdateUI);
        });
      }
    } else {
      const shortAddr = profile.wallet_address
        ? profile.wallet_address.slice(0, 6) +
          "…" +
          profile.wallet_address.slice(-4)
        : "";
      c.textContent =
        "@" +
        (profile.username || "unknown") +
        (shortAddr ? " · " + shortAddr : "");
    }
  }

  async function loginWithPi(updateUI) {
    updateUI = updateUI || defaultUpdateUI;

    // Đảm bảo đã init
    if (!ensurePiInit()) {
      alert(
        "Không thấy hoặc không khởi tạo được Pi SDK.\n\n" +
          "Hãy chắc chắn đang mở Tranmarket bên trong Pi Browser."
      );
      return;
    }

    try {
      console.log("[Tranmarket] Calling Pi.authenticate…");

      const scopes = ["username", "wallet_address", "platform"];

      const authResult = await window.Pi.authenticate(
        scopes,
        function onIncompletePaymentFound(payment) {
          console.log("[Tranmarket] onIncompletePaymentFound", payment);
        }
      );

      console.log("[Tranmarket] authResult", authResult);

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
        valid_until:
          (authResult.accessToken && authResult.accessToken.lifetime) || null
      };

      console.log("[Tranmarket] profile", profile);

      saveUser(profile);
      updateUI(profile);

      alert(
        "Đăng nhập ví Pi thành công.\n\nTài khoản: @" +
          (profile.username || "unknown")
      );
    } catch (err) {
      console.error("[Tranmarket] Pi Auth Error", err);

      const msg =
        (err && err.message) ||
        (typeof err === "string" ? err : JSON.stringify(err) || "");

      const normalized = (msg || "").toLowerCase();

      const isUserCancel =
        normalized.includes("user cancelled") ||
        normalized.includes("user consent cancelled") ||
        normalized.includes("user rejected") ||
        (err && err.code === "USER_REJECTED") ||
        (err && err.code === "USER_CANCELLED");

      if (isUserCancel) {
        alert(
          "Pi Browser báo: bạn đã HUỶ đăng nhập với ví Pi.\n\n" +
            "Nếu Trẫm chắc chắn đã bấm Allow mà vẫn hiện thông báo này,\n" +
            "thì đây là vấn đề phía Pi SDK / cấu hình app, không phải lỗi giao diện Tranmarket."
        );
        return;
      }

      alert("Đăng nhập với ví Pi thất bại.\n\nChi tiết: " + msg);
      defaultUpdateUI(null);
    }
  }

  window.loginWithPi = loginWithPi;

  window.initPiLogin = function (updateUI) {
    console.log("[Tranmarket] initPiLogin() called");
    const fn = updateUI || defaultUpdateUI;

    // có thể init SDK luôn ở đây để chuẩn bị
    ensurePiInit();

    const stored = loadUser();
    fn(stored || null);
  };
})();
