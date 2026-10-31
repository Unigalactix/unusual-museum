/* The Unusual Museum — landing enhancements
   Starfield backdrop, hero mouse-glow, card tilt, scroll reveal.
   Everything is gated behind prefers-reduced-motion and
   fine-pointer checks; without JS the page is fully usable. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Starfield / nebula backdrop ---------- */
  var canvas = document.getElementById("starfield");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var nebulae = [];
    var W = 0, H = 0, raf = null, running = false;

    function buildField() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(50, Math.min(95, Math.floor(W / 14)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.4 + Math.random() * 1.1,
          sp: 1.5 + Math.random() * 4.5,        /* px per second, drifting down */
          ph: Math.random() * Math.PI * 2,      /* twinkle phase */
          tw: 0.25 + Math.random() * 0.6        /* twinkle speed */
        });
      }
      nebulae = [
        { x: W * 0.82, y: H * 0.10, r: Math.max(W, H) * 0.42, c: "88,64,190",  a: 0.055 },
        { x: W * 0.10, y: H * 0.88, r: Math.max(W, H) * 0.38, c: "16,116,138", a: 0.045 },
        { x: W * 0.45, y: H * 0.55, r: Math.max(W, H) * 0.30, c: "217,164,65", a: 0.028 }
      ];
    }

    function drawField(t) {
      ctx.clearRect(0, 0, W, H);
      var i, g, s;
      for (i = 0; i < nebulae.length; i++) {
        g = ctx.createRadialGradient(nebulae[i].x, nebulae[i].y, 0, nebulae[i].x, nebulae[i].y, nebulae[i].r);
        g.addColorStop(0, "rgba(" + nebulae[i].c + "," + nebulae[i].a + ")");
        g.addColorStop(1, "rgba(" + nebulae[i].c + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        var alpha = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(s.ph + t * 0.001 * s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226,232,255," + alpha.toFixed(3) + ")";
        ctx.fill();
      }
    }

    var last = 0;
    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      for (var i = 0; i < stars.length; i++) {
        stars[i].y += stars[i].sp * dt;
        stars[i].x += stars[i].sp * 0.18 * dt;
        if (stars[i].y > H + 2) { stars[i].y = -2; stars[i].x = Math.random() * W; }
        if (stars[i].x > W + 2) { stars[i].x = -2; }
      }
      drawField(t);
      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced) return;
      running = true; last = 0;
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
    }

    buildField();
    drawField(0);                       /* static frame (also the reduced-motion result) */
    start();
    window.addEventListener("resize", function () { buildField(); drawField(0); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
  }

  /* ---------- Hero mouse glow (desktop, fine pointer) ---------- */
  var header = document.querySelector("header");
  if (header && finePointer && !reduced) {
    header.addEventListener("pointermove", function (e) {
      var r = header.getBoundingClientRect();
      var mx = ((e.clientX - r.left) / r.width) * 100;
      var my = ((e.clientY - r.top) / r.height) * 100;
      header.style.setProperty("--mx", mx.toFixed(1) + "%");
      header.style.setProperty("--my", my.toFixed(1) + "%");
    });
    header.addEventListener("pointerleave", function () {
      header.style.setProperty("--mx", "50%");
      header.style.setProperty("--my", "30%");
    });
  }

  /* ---------- Card tilt (desktop, fine pointer, max 4deg) ---------- */
  if (finePointer && !reduced) {
    var cards = document.querySelectorAll(".grid a.card");
    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("tilting");
        card.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-py * 8).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var targets = document.querySelectorAll(".grid a.card, .why-card, .ticker, .stats");
  Array.prototype.forEach.call(targets, function (el) { el.classList.add("rv"); });

  function revealAll() {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("in"); });
  }

  if (reduced || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(targets, function (el, i) {
      if (el.classList.contains("card")) {
        el.style.transitionDelay = ((i % 3) * 60) + "ms";
        window.setTimeout(function () { el.style.transitionDelay = ""; }, 1100);
      }
      io.observe(el);
    });
  }
})();
