/* 챔척순즈 스튜디오 — 작품 필터와 이미지 보기만. 플레이·다운로드 없음. */
(function () {
  "use strict";

  var bar = document.querySelector("[data-filter-bar]");
  if (bar) {
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      var key = btn.getAttribute("data-filter");
      bar.querySelectorAll("[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      document.querySelectorAll("[data-group]").forEach(function (el) {
        var groups = (el.getAttribute("data-group") || "").split(/\s+/);
        var show = key === "all" || groups.indexOf(key) !== -1;
        el.hidden = !show;
      });
    });
  }

  var dlg = document.getElementById("lightbox");
  if (!dlg) return;
  var dlgImg = dlg.querySelector(".lightbox-img");
  var dlgCap = dlg.querySelector(".lightbox-cap");
  var closer = dlg.querySelector("[data-close]");

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a.shot");
    if (!a || !dlgImg) return;
    e.preventDefault();
    var img = a.querySelector("img");
    dlgImg.src = a.getAttribute("href");
    dlgImg.alt = img ? img.getAttribute("alt") || "" : "";
    if (dlgCap) dlgCap.textContent = a.getAttribute("data-caption") || "";
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    if (closer) closer.focus();
  });

  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close();
  });
  dlg.addEventListener("close", function () {
    if (dlgImg) dlgImg.removeAttribute("src");
  });
})();
