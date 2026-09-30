(function () {
  function getStored() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function setStored(v) {
    try { localStorage.setItem("theme", v); } catch (e) {}
  }
  function apply(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveCurrent = current || (prefersDark ? "dark" : "light");
      var next = effectiveCurrent === "dark" ? "light" : "dark";
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion && document.startViewTransition) {
        document.startViewTransition(function () {
          apply(next);
        });
      } else {
        apply(next);
      }
      setStored(next);
    });
  });
})();
