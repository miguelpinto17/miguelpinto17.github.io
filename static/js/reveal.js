(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Give project/lesson diagrams a scroll zoom-in without editing every content file.
    document.querySelectorAll(".diagram").forEach(function (d) {
      if (!d.classList.contains("reveal-zoom")) d.classList.add("reveal-zoom");
    });

    var els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
    if (!els.length) return;

    // Stagger siblings that reveal together (cards in a grid, rows in a list)
    // so they cascade in rather than popping in unison.
    var counters = new Map();
    els.forEach(function (el) {
      var parent = el.parentElement;
      var i = counters.get(parent) || 0;
      el.style.setProperty("--stagger-i", i);
      counters.set(parent, i + 1);
    });

    if (!("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  });

  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      bar.style.width = pct + "%";
      bar.classList.toggle("visible", doc.scrollTop > 40);
      ticking = false;
    }
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", update);
  });

  var navBtn, headerNav;
  document.addEventListener("DOMContentLoaded", function () {
    navBtn = document.querySelector("[data-nav-toggle]");
    headerNav = document.querySelector("[data-nav]");
    if (navBtn && headerNav) {
      navBtn.addEventListener("click", function () {
        headerNav.classList.toggle("open");
        var expanded = headerNav.classList.contains("open");
        navBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    }
  });

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Count stat numbers up from 0 when they scroll into view, preserving
  // whatever prefix/suffix formatting is already in the HTML (+, %, commas).
  document.addEventListener("DOMContentLoaded", function () {
    var els = document.querySelectorAll(".stat-value");
    if (!els.length || reducedMotion() || !("IntersectionObserver" in window)) return;

    function animate(el) {
      var text = el.textContent.trim();
      var match = text.match(/[\d,]+/);
      if (!match) return;
      var target = parseInt(match[0].replace(/,/g, ""), 10);
      var prefix = text.slice(0, match.index);
      var suffix = text.slice(match.index + match[0].length);
      var duration = 1100;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = text;
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          animate(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  });

  // Cursor-reactive tilt + glow on cards, pointer-fine devices only.
  document.addEventListener("DOMContentLoaded", function () {
    if (reducedMotion() || !(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
    var els = document.querySelectorAll(".card, .skill-category");
    if (!els.length) return;
    els.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var px = x / r.width;
        var py = y / r.height;
        el.style.setProperty("--tilt-x", ((py - 0.5) * -6).toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", ((px - 0.5) * 6).toFixed(2) + "deg");
        el.style.setProperty("--glow-x", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--glow-y", (py * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      });
    });
  });

  // Hero glow parallax: drifts opposite scroll direction at a fraction of speed.
  document.addEventListener("DOMContentLoaded", function () {
    var hero = document.querySelector(".hero");
    if (!hero || reducedMotion()) return;
    var ticking = false;
    function update() {
      var y = Math.min(window.scrollY * 0.22, 90);
      hero.style.setProperty("--parallax", y + "px");
      ticking = false;
    }
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  });
})();
