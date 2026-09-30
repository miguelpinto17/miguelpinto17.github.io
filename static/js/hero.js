/* Signal hero — a canvas particle field that resolves scattered "raw data"
   into a rising trend line. Dependency-free. Respects reduced motion,
   replays on click, and reacts to scroll (parallax + fade). */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var hero = document.querySelector("[data-signal-hero]");
    var canvas = hero && hero.querySelector("[data-signal-canvas]");
    if (!hero || !canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var reduceMQ = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : { matches: false, addEventListener: function () {} };

    var W = 0, H = 0, DPR = 1;
    var particles = [];
    var lineNodes = [];
    var colors = {};
    var startTime = 0;
    var duration = 2200;
    var raf = null;
    var running = false;
    var resolved = false;
    var visible = true;

    // ---- colour helpers (read from CSS custom properties) ----
    function parseColor(str) {
      str = (str || "").trim();
      if (str.charAt(0) === "#") {
        var h = str.slice(1);
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var n = parseInt(h, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
      var m = str.match(/rgba?\(([^)]+)\)/);
      if (m) {
        var p = m[1].split(",").map(function (v) { return parseFloat(v); });
        return [p[0] | 0, p[1] | 0, p[2] | 0];
      }
      return [30, 64, 175];
    }
    function rgba(rgb, a) {
      return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
    }
    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.accent = parseColor(cs.getPropertyValue("--accent"));
      colors.accent2 = parseColor(cs.getPropertyValue("--accent-2"));
      colors.muted = parseColor(cs.getPropertyValue("--muted"));
      colors.border = parseColor(cs.getPropertyValue("--border"));
    }

    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    // Rising trend curve; t in [0,1] -> normalised y in [0,1] (0 = top).
    function trendY(t) {
      var base = 0.84 - 0.66 * t;
      var wave = Math.sin(t * Math.PI * 3.1) * 0.05
               + Math.sin(t * Math.PI * 6.7 + 1.3) * 0.022;
      return base + wave;
    }

    function makeParticle(tx, ty, isLine, t, delay, r, tone) {
      return {
        ox: Math.random() * W,
        oy: Math.random() * H,
        tx: tx, ty: ty,
        x: 0, y: 0,
        line: isLine, t: t, delay: delay,
        r: r, tone: tone, e: 0
      };
    }

    function build() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(120, rect.width);
      H = Math.max(36, rect.height);
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";

      var nNodes = Math.max(14, Math.min(30, Math.round(W / 12)));
      var nDust = Math.max(22, Math.min(56, Math.round(W / 6)));

      particles = [];
      var i;
      for (i = 0; i < nNodes; i++) {
        var t = i / (nNodes - 1);
        var delay = 0.12 + t * 0.5;            // left resolves first -> draws L→R
        particles.push(makeParticle(t * W, trendY(t) * H, true, t, delay, 1.5, "accent"));
      }
      for (i = 0; i < nDust; i++) {
        var t2 = Math.random();
        var spread = (Math.random() * Math.random() - 0.28) * 0.34 * H; // mostly below line
        var ty = trendY(t2) * H + spread + 0.015 * H;
        ty = Math.max(3, Math.min(H - 3, ty));
        particles.push(
          makeParticle(t2 * W, ty, false, t2, Math.random() * 0.55, 0.6 + Math.random() * 1.0,
            Math.random() < 0.5 ? "accent2" : "muted")
        );
      }
      lineNodes = particles.filter(function (p) { return p.line; })
        .sort(function (a, b) { return a.tx - b.tx; });
    }

    function toneRGB(tone) {
      if (tone === "accent2") return colors.accent2;
      if (tone === "muted") return colors.muted;
      return colors.accent;
    }

    function draw(gp) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var i, p;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        var lp = (gp - p.delay);
        lp = lp <= 0 ? 0 : lp / (1 - p.delay);
        if (lp > 1) lp = 1;
        p.e = easeOutCubic(lp);
        p.x = p.ox + (p.tx - p.ox) * p.e;
        p.y = p.oy + (p.ty - p.oy) * p.e;
      }

      var baseY = H * 0.9;

      // baseline
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(W * Math.min(1, gp * 1.15), baseY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(colors.border, 0.55 * gp);
      ctx.stroke();

      // area fill under the resolved portion of the line
      var active = lineNodes.filter(function (n) { return n.e > 0.02; });
      if (active.length > 1) {
        var grad = ctx.createLinearGradient(0, H * 0.16, 0, baseY);
        grad.addColorStop(0, rgba(colors.accent, 0.18 * gp));
        grad.addColorStop(1, rgba(colors.accent, 0));
        ctx.beginPath();
        ctx.moveTo(active[0].x, baseY);
        for (i = 0; i < active.length; i++) ctx.lineTo(active[i].x, active[i].y);
        ctx.lineTo(active[active.length - 1].x, baseY);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // dust — the raw data points settling into place
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        if (p.line || p.e <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(toneRGB(p.tone), 0.32 * p.e);
        ctx.fill();
      }

      // the signal line — segment by segment so it reveals left→right
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = rgba(colors.accent, 0.5 * gp);
      for (i = 1; i < lineNodes.length; i++) {
        var a = lineNodes[i - 1], b = lineNodes[i];
        var seg = Math.min(a.e, b.e);
        if (seg <= 0.03) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(colors.accent, 0.85 * seg);
        ctx.shadowBlur = 5 * seg;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // node dots + glowing head at the leading edge
      var head = null;
      for (i = 0; i < lineNodes.length; i++) {
        p = lineNodes[i];
        if (p.e <= 0.05) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(colors.accent, 0.65 * p.e);
        ctx.fill();
        if (p.e > 0.5) head = p;
      }
      if (head) {
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(colors.accent, gp);
        ctx.shadowColor = rgba(colors.accent, 0.8);
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(colors.accent, 0.35 * gp);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function frame(now) {
      var gp = Math.min((now - startTime) / duration, 1);
      draw(gp);
      if (gp < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        resolved = true;
        raf = null;
      }
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      resolved = false;
      running = true;
      startTime = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      resolved = true;
      running = false;
      draw(1);
    }

    function replay() {
      // fresh noise origins, then resolve again
      for (var i = 0; i < particles.length; i++) {
        particles[i].ox = Math.random() * W;
        particles[i].oy = Math.random() * H;
      }
      if (reduceMQ.matches) { drawStatic(); return; }
      start();
    }

    // ---- lifecycle ----
    function init(firstRun) {
      readColors();
      build();
      if (reduceMQ.matches) {
        drawStatic();
      } else if (firstRun) {
        // sync with the headline word reveal
        setTimeout(start, 320);
      } else if (resolved) {
        draw(1);
      } else {
        start();
      }
    }

    // resize (debounced)
    var resizeT = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { init(false); }, 180);
    });

    // clicking the signal replays it
    canvas.addEventListener("click", replay);

    // pause the animation loop when the hero scrolls out of view
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && running && !raf) raf = requestAnimationFrame(frame);
        if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
      }, { threshold: 0 }).observe(hero);
    }

    // re-read colours when the theme changes, and repaint the frozen frame
    function onThemeChange() {
      readColors();
      if (!running) draw(resolved ? 1 : 0);
    }
    new MutationObserver(onThemeChange).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    var schemeMQ = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (schemeMQ && schemeMQ.addEventListener) schemeMQ.addEventListener("change", onThemeChange);

    // react to a reduced-motion preference change on the fly
    if (reduceMQ.addEventListener) {
      reduceMQ.addEventListener("change", function () {
        if (reduceMQ.matches) { if (raf) cancelAnimationFrame(raf); drawStatic(); }
      });
    }

    init(true);
  });
})();
