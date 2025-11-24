// docs/auth/pi-auth.js – Tranmarket Pi Wallet auth (v3 – rõ trạng thái)

(function () {
  console.log("[Tranmarket] pi-auth.js loaded");
  window.TranPiAuthLoaded = true;

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

    if (typeof window.Pi === "undefined") {
      alert("Không thấy Pi SDK. Vui lòng mở Tranmarket trong Pi Browser.");
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

      // 👉 Hiện thông báo rõ ràng khi login OK
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
          "Bạn vừa HUỶ đăng nhập với ví Pi trên Pi Browser.\n\n" +
            "Nếu chắc chắn đã bấm Allow mà vẫn hiện thông báo này,\n" +
            "thì đây là lỗi phía Pi SDK / Pi Browser, không phải lỗi Tranmarket."
        );
        return;
      }

      alert("Đăng nhập với ví Pi thất bại.\n\nChi tiết: " + msg);
      updateUI(null);
    }
  }

  window.loginWithPi = loginWithPi;

  window.initPiLogin = function (updateUI) {
    console.log("[Tranmarket] initPiLogin() called");
    const fn = updateUI || defaultUpdateUI;
    const stored = loadUser();
    fn(stored || null);
  };
})();
