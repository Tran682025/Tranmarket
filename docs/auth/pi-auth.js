// docs/auth/pi-auth.js – SIMPLE TEST ONLY

(function () {
  console.log("[Tranmarket TEST] pi-auth.js loaded");

  // Tạo 1 hàm global cho auth-test.html gọi
  window.initPiLogin = function () {
    console.log("[Tranmarket TEST] initPiLogin() called");

    var c = document.getElementById("pi-login");
    if (!c) return;

    c.textContent = "[TEST] initPiLogin is working";
  };
})();
