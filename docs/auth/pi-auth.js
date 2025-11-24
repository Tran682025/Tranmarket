// docs/auth/pi-auth.js – Tranmarket minimal Pi Wallet auth (final)

(function () {
  console.log("[Tranmarket] pi-auth.js loaded");
  window.TranPiAuthLoaded = true;

  // Khóa lưu profile thống nhất cho toàn site
  const STORAGE_KEY = "trm_user";

  // Lưu profile vào localStorage (cho direct.html / các trang khác dùng lại)
  function saveUser(profile) {
    if (!profile) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn("[Tranmarket] Cannot save profile to localStorage", e);
    }
  }

  // Đọc profile từ localStorage
  function loadUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[Tranmarket] Cannot parse stored profile", e);
      return null;
    }
  }

  // UI mặc định: vẽ nút login / trạng thái đã login vào #pi-login
  function defaultUpdateUI(profile) {
    const container = document.getElementById("pi-login");
    if (!container) {
      console.warn("[Tranmarket] #pi-login not found.");
      return;
    }

    // Chưa có profile → vẽ nút đăng nhập
    if (!profile) {
      container.innerHTML =
        '<button id="trm-login-btn" ' +
        'style="padding:10px 18px;border-radius:999px;border:none;' +
        'background:linear-gradient(90deg,#7a00ff,#ffbb00);color:#fff;' +
        'font-weight:600;font-size:13px;cursor:pointer;">' +
        "CONNECT PI WALLET" +
        "</button>";

      const btn = document.getElementById("trm-login-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          loginWithPi(defaultUpdateUI);
        });
      }
      return;
    }

    // Đã login → hiển thị username + ví rút gọn
    const shortAddr = profile.wallet_address
      ? profile.wallet_address.slice(0, 6) +
        "…" +
        profile.wallet_address.slice(-4)
      : "";

    container.innerHTML =
      '<div style="font-size:13px;font-weight:500;">' +
      "Logged in as @" +
      (profile.username || "unknown") +
      (shortAddr ? " · " + shortAddr : "") +
      "</div>";
  }

  // Hàm gọi Pi.authenticate
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

      // Một số SDK trả wallet_address trong user, một số trong credentials
      const walletAddress =
        user.wallet_address ||
        (user.credentials && user.credentials.wallet_address) ||
        "";

      const profile = {
        username: user.username || "",
        uid: user.uid || "",
        wallet_address: walletAddress,
        platform: authResult.platform || "",
        // Không phụ thuộc chặt vào cấu trúc accessToken – chỉ lưu nếu có
        valid_until:
          (authResult.accessToken &&
            (authResult.accessToken.lifetime ||
              authResult.accessToken.expires_at)) ||
          null,
      };

      console.log("[Tranmarket] profile", profile);

      // Lưu profile + cập nhật UI
      saveUser(profile);
      updateUI(profile);
    } catch (err) {
      console.error("[Tranmarket] Pi Auth Error", err);

      let msg =
        (err && err.message) ||
        (typeof err === "string" ? err : JSON.stringify(err));

      // Trường hợp user tự hủy (cancel) → thông báo nhẹ nhàng hơn
      if (msg && msg.toLowerCase().includes("cancel")) {
        alert("Bạn đã hủy đăng nhập với ví Pi.\n\nKhi sẵn sàng, hãy thử lại.");
      } else {
        alert("Đăng nhập với ví Pi thất bại.\n\nChi tiết: " + msg);
      }

      // Cho UI quay lại trạng thái chưa login
      updateUI(null);
    }
  }

  // Expose ra global cho HTML gọi
  window.loginWithPi = loginWithPi;

  // Khởi tạo trạng thái login khi load trang
  window.initPiLogin = function (updateUI) {
    console.log("[Tranmarket] initPiLogin() called");
    const fn = updateUI || defaultUpdateUI;

    const storedProfile = loadUser();
    fn(storedProfile || null);
  };
})();
