// File: docs/auth/pi-auth.js
// Tranmarket – Pi Wallet Login (Phase 9)
// Không đụng layout, chỉ lo phần login + localStorage

(function () {
  const STORAGE_KEY = "tranmarket_pi_user";

  // Phát hiện nền tảng cho vui + analytics
  function detectPlatform() {
    const ua = (navigator.userAgent || "").toLowerCase();

    if (ua.includes("pibrowser")) return "Pi Browser";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
    if (ua.includes("android")) return "Android";
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";

    return "Unknown";
  }

  // Đọc user từ localStorage (nếu có)
  function getStoredUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.username) return null;
      return parsed;
    } catch (err) {
      console.error("Tranmarket: error reading user from localStorage", err);
      return null;
    }
  }

  // Lưu user vào localStorage
  function saveUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      console.error("Tranmarket: error saving user to localStorage", err);
    }
  }

  // Xoá user (logout)
  function clearUser() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Tranmarket: error clearing user from localStorage", err);
    }
  }

  // Rút gọn địa chỉ ví: 0x1234…abcd
  function abbreviateAddress(addr) {
    if (!addr || typeof addr !== "string") return "";
    if (addr.length <= 12) return addr;
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  // Render UI: khi chưa login / đã login
  function render(container, user, isPiAvailable, onLogin, onLogout) {
    if (!container) return;

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tm-pi-login-wrapper";

    if (!user) {
      // CHƯA LOGIN
      if (!isPiAvailable) {
        const note = document.createElement("span");
        note.className = "tm-pi-login-note";
        note.textContent =
          "Login với ví Pi chỉ hoạt động trong Pi Browser.";
        wrapper.appendChild(note);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tm-btn tm-btn-primary tm-pi-login-button";
      btn.textContent = "Login with Pi Wallet";

      if (!isPiAvailable) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", onLogin);
      }

      wrapper.appendChild(btn);
    } else {
      // ĐÃ LOGIN
      const info = document.createElement("span");
      info.className = "tm-pi-login-greeting";

      const addrShort = user.wallet_address
        ? abbreviateAddress(user.wallet_address)
        : "N/A";

      info.textContent =
        "Xin chào " + user.username + " • Ví: " + addrShort;

      const logoutBtn = document.createElement("button");
      logoutBtn.type = "button";
      logoutBtn.className = "tm-btn tm-btn-outline tm-pi-logout-button";
      logoutBtn.textContent = "Logout";

      logoutBtn.addEventListener("click", onLogout);

      wrapper.appendChild(info);
      wrapper.appendChild(logoutBtn);
    }

    container.appendChild(wrapper);
  }

  // Gọi Pi SDK để login
  async function loginWithPi(updateUI) {
    if (typeof window.Pi === "undefined") {
      alert("Không tìm thấy Pi SDK. Vui lòng mở Tranmarket trong Pi Browser.");
      return;
    }

    try {
      // Khởi tạo Pi SDK – giữ giống auth-test hôm qua (mainnet)
      window.Pi.init({
        version: "2.0",
        sandbox: true
        // Nếu sau này test sandbox thì đổi network ở đây
      });

      // Lấy đúng những gì cần:
      // username + wallet_address + platform
      const scopes = ["username", "wallet_address", "platform"];

      const authResult = await window.Pi.authenticate(
        scopes,
        function onIncompletePaymentFound(payment) {
          // Phase 9 không xử lý thanh toán, chỉ log cho đẹp
          console.log("Tranmarket – onIncompletePaymentFound:", payment);
        }
      );

      const user = authResult && authResult.user ? authResult.user : {};

      // JSON "đại gia" trả về có thể đặt wallet_address / platform
      // ở nhiều chỗ – ta bắt hết cho chắc.
      let walletAddress =
        user.wallet_address ||
        (user.credentials && user.credentials.wallet_address) ||
        null;

      let platform =
        user.platform ||
        (user.credentials && user.credentials.platform) ||
        detectPlatform();

      let validUntil =
        authResult.valid_until ||
        (user.credentials && user.credentials.valid_until) ||
        null;

      // Nếu vẫn chưa có valid_until thì tạm set +24h
      if (!validUntil) {
        const now = Date.now();
        validUntil = new Date(now + 24 * 60 * 60 * 1000).toISOString();
      }

      const profile = {
        username: user.username || "",
        uid: user.uid || "",
        wallet_address: walletAddress,
        platform: platform,
        valid_until: validUntil
      };

      saveUser(profile);
      updateUI(profile);
  } catch (err) {
  console.error("[Tranmarket Pi Auth Error]", err);
  alert(
    "Đăng nhập với ví Pi thất bại.\n\nChi tiết: " +
      (err && err.message ? err.message : JSON.stringify(err))
  );
}


  function doLogout(updateUI) {
    clearUser();
    updateUI(null);
  }

  // Hàm main mỗi trang sẽ gọi
  window.initPiLogin = function () {
    const container = document.getElementById("pi-login");
    if (!container) {
      console.warn(
        'Tranmarket – initPiLogin: không tìm thấy <div id="pi-login"></div> trong trang hiện tại.'
      );
      return;
    }

    const isPiAvailable = typeof window.Pi !== "undefined";
    let currentUser = getStoredUser();

    function updateUI(newUser) {
      currentUser = newUser;
      render(
        container,
        currentUser,
        isPiAvailable,
        handleLoginClick,
        handleLogoutClick
      );
    }

    async function handleLoginClick() {
      await loginWithPi(updateUI);
    }

    function handleLogoutClick() {
      doLogout(updateUI);
    }

    updateUI(currentUser);
  };

  // Tiện cho các script khác (Day5 / Day6) dùng chung
  window.getTranmarketPiUser = getStoredUser;
})();
