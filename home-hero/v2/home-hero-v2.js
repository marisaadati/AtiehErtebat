/* Homepage hero — Version 2 "Data bus". No dependencies. */
(function () {
  'use strict';
  var root = document.querySelector('.ahb-hero');
  if (!root) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var services = JSON.parse(root.querySelector('script[type="application/json"]').textContent);
  var nodes = Array.prototype.slice.call(root.querySelectorAll('.ahb-node'));
  var detail = root.querySelector('.ahb-detail');
  var bar = root.querySelector('.ahb-detail__bar i');
  var q = function (k) { return detail.querySelector('[data-ahb="' + k + '"]'); };
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  var DURATION = parseFloat(getComputedStyle(root).getPropertyValue('--ahb-dur')) || 5200;
  var current = 0, start = performance.now(), paused = false, holdUntil = 0, visible = true;

  function select(i, user) {
    current = (i + services.length) % services.length;
    var s = services[current];
    nodes.forEach(function (n, k) { n.setAttribute('aria-pressed', k === current ? 'true' : 'false'); });
    q('n').textContent = fa('0' + (current + 1));
    q('name').textContent = s.name;
    q('text').textContent = s.text;
    q('href').setAttribute('href', s.href);
    detail.classList.remove('is-swap'); void detail.offsetWidth; detail.classList.add('is-swap');
    start = performance.now();
    if (user) holdUntil = performance.now() + 12000;
  }
  nodes.forEach(function (n, k) {
    n.addEventListener('click', function () { select(k, true); });
    n.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(k, true); return; }
      var d = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); select(current + d, true); nodes[current].focus(); }
    });
  });
  [root.querySelector('.ahb-bus'), detail].forEach(function (el) {
    el.addEventListener('mouseenter', function () { paused = true; });
    el.addEventListener('mouseleave', function () { paused = false; });
    el.addEventListener('focusin', function () { paused = true; });
    el.addEventListener('focusout', function () { paused = false; });
  });
  (function tick(now) {
    if (paused || now < holdUntil || !visible || reduce) start = now - (parseFloat(bar.style.getPropertyValue('--p')) || 0) * DURATION;
    else {
      var p = Math.min((now - start) / DURATION, 1);
      bar.style.setProperty('--p', p.toFixed(3));
      if (p >= 1) select(current + 1, false);
    }
    requestAnimationFrame(tick);
  })(performance.now());
  select(0, false);

  /* rising glow particles */
  var box = root.querySelector('.ahb-box'), canvas = root.querySelector('.ahb-bg'), ctx = canvas.getContext('2d');
  var W, H, pts = [], raf = 0;
  function resize() {
    var r = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(60, Math.max(20, W * H / 22000)));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, v: Math.random() * .35 + .1, r: Math.random() * 1.8 + .4, a: Math.random() * .6 + .2 });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!reduce) { p.y -= p.v; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } }
      ctx.beginPath(); ctx.fillStyle = 'rgba(113,205,208,' + p.a + ')'; ctx.shadowColor = '#71cdd0'; ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  function loop() { draw(); raf = requestAnimationFrame(loop); }
  window.addEventListener('resize', function () { resize(); draw(); });
  resize(); draw();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (reduce) return;
      if (visible && !raf) loop(); else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0.05 }).observe(box);
  } else if (!reduce) loop();
})();
