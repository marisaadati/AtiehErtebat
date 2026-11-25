/* Homepage hero — service network. No dependencies. */
(function () {
  'use strict';
  var root = document.querySelector('.ah-hero');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var services = JSON.parse(document.getElementById('ah-services').textContent);
  var nodes = Array.prototype.slice.call(root.querySelectorAll('.ah-node'));
  var spokes = root.querySelectorAll('.ah-spoke');
  var packets = root.querySelectorAll('.ah-packet');
  var detail = root.querySelector('.ah-detail');
  var bar = root.querySelector('.ah-detail__bar i');
  var f = function (k) { return detail.querySelector('[data-ah="' + k + '"]'); };
  var faDigits = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };

  /* ---------- active service ---------- */
  var DURATION = parseFloat(getComputedStyle(root).getPropertyValue('--ah-dur')) || 5200;
  var current = 0, start = performance.now(), paused = false, holdUntil = 0, visible = true;

  function select(i, user) {
    current = (i + services.length) % services.length;
    var s = services[current];
    nodes.forEach(function (n, k) { n.setAttribute('aria-pressed', k === current ? 'true' : 'false'); });
    spokes.forEach(function (p) { p.classList.toggle('is-on', +p.dataset.i === current); });
    packets.forEach(function (p) { p.classList.toggle('is-on', +p.dataset.i === current); });
    f('icon').setAttribute('href', '#ah-i-' + s.icon);
    f('k').textContent = s.k;
    f('name').textContent = s.name;
    f('text').textContent = s.text;
    f('href').setAttribute('href', s.href);
    f('n').textContent = faDigits(current + 1);
    detail.classList.remove('is-swap'); void detail.offsetWidth; detail.classList.add('is-swap');
    start = performance.now();
    if (user) holdUntil = performance.now() + 12000; // a click pauses auto-play for a while
  }

  nodes.forEach(function (n, k) {
    n.addEventListener('click', function () { select(k, true); });
    n.addEventListener('keydown', function (e) {
      var next = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key];
      if (next) { e.preventDefault(); select(current + next, true); nodes[current].focus(); }
    });
  });
  [root.querySelector('.ah-net'), detail].forEach(function (el) {
    el.addEventListener('mouseenter', function () { paused = true; });
    el.addEventListener('mouseleave', function () { paused = false; });
    el.addEventListener('focusin', function () { paused = true; });
    el.addEventListener('focusout', function () { paused = false; });
  });

  function tick(now) {
    var held = paused || now < holdUntil || !visible || reduce;
    if (held) { start = now - (parseFloat(bar.style.getPropertyValue('--p')) || 0) * DURATION; }
    else {
      var p = Math.min((now - start) / DURATION, 1);
      bar.style.setProperty('--p', p.toFixed(3));
      if (p >= 1) select(current + 1, false);
    }
    requestAnimationFrame(tick);
  }
  select(0, false);
  requestAnimationFrame(tick);

  /* ---------- particle network background ---------- */
  var canvas = root.querySelector('.ah-hero__particles');
  var box = root.querySelector('.ah-hero__box');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, pts = [], mouse = { x: -9999, y: -9999 };

  function resize() {
    var r = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(70, Math.max(24, (W * H) / 16000)));
    pts = [];
    for (var i = 0; i < count; i++) {
      pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: Math.random() * 1.6 + .8 });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var LINK = 130;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        var dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var k = .6 / Math.sqrt(d2 + 1); a.x += dx * k; a.y += dy * k; }
      }
      for (var j = i + 1; j < pts.length; j++) {
        var b = pts[j], ex = a.x - b.x, ey = a.y - b.y, d = Math.sqrt(ex * ex + ey * ey);
        if (d < LINK) {
          ctx.strokeStyle = 'rgba(55,125,129,' + (0.16 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(87,179,183,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  var raf = 0;
  function loop() { draw(); raf = requestAnimationFrame(loop); }

  box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  box.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
  window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
  resize();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (reduce) { draw(); return; }
      if (visible && !raf) loop();
      else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0.05 }).observe(box);
  } else if (!reduce) { loop(); }
  if (reduce) draw();
})();
