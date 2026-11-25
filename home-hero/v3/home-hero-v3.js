/* Homepage hero — Version 3 "Connected globe". No dependencies. */
(function () {
  'use strict';
  var root = document.querySelector('.ahg-hero');
  if (!root) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var services = JSON.parse(root.querySelector('script[type="application/json"]').textContent);
  var items = Array.prototype.slice.call(root.querySelectorAll('.ahg-item'));
  var DURATION = parseFloat(getComputedStyle(root).getPropertyValue('--ahg-dur')) || 5600;
  var current = 0, start = performance.now(), paused = false, holdUntil = 0, visible = true;

  function select(i, user) {
    current = (i + items.length) % items.length;
    items.forEach(function (it, k) {
      var on = k === current;
      it.classList.toggle('is-on', on);
      it.querySelector('.ahg-item__btn').setAttribute('aria-expanded', on ? 'true' : 'false');
      it.querySelector('.ahg-item__bar i').style.setProperty('--p', 0);
    });
    start = performance.now();
    if (user) holdUntil = performance.now() + 12000;
  }
  items.forEach(function (it, k) {
    var b = it.querySelector('.ahg-item__btn');
    b.addEventListener('click', function () { select(k, true); });
    b.addEventListener('keydown', function (e) {
      var d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); select(current + d, true); items[current].querySelector('.ahg-item__btn').focus(); }
    });
  });
  var list = root.querySelector('.ahg-list');
  list.addEventListener('mouseenter', function () { paused = true; });
  list.addEventListener('mouseleave', function () { paused = false; });
  list.addEventListener('focusin', function () { paused = true; });
  list.addEventListener('focusout', function () { paused = false; });

  /* ---------- globe ---------- */
  var wrap = root.querySelector('.ahg-globe'), canvas = wrap.querySelector('canvas'), ctx = canvas.getContext('2d');
  var S = 0, dpr = 1, R = 0, rot = 0.6, tilt = -0.32, targetRot = null;
  var N = 1100, sphere = [];
  for (var i = 0; i < N; i++) { // fibonacci sphere
    var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963229728653;
    sphere.push([Math.cos(th) * rr, y, Math.sin(th) * rr]);
  }
  function ll(lat, lon) { var a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)]; }
  var HUB = ll(26.5, 54); // Kish
  var markers = [ll(52, 10), ll(48, 105), ll(-8, 35), ll(-24, 128), ll(14, -12)].slice(0, services.length);

  function project(v) {
    var c = Math.cos(rot), s = Math.sin(rot), x = v[0] * c - v[2] * s, z = v[0] * s + v[2] * c, y = v[1];
    var ct = Math.cos(tilt), st = Math.sin(tilt), y2 = y * ct - z * st, z2 = y * st + z * ct;
    return { x: S / 2 + x * R, y: S / 2 - y2 * R, z: z2 };
  }
  function slerp(a, b, t) {
    var d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))), sd = Math.sin(d) || 1;
    var k1 = Math.sin((1 - t) * d) / sd, k2 = Math.sin(t * d) / sd;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  function arcPoint(a, b, t) { var p = slerp(a, b, t), lift = 1 + 0.28 * Math.sin(Math.PI * t); return [p[0] * lift, p[1] * lift, p[2] * lift]; }

  function resize() {
    var r = wrap.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    S = r.width; R = S * 0.36; canvas.width = S * dpr; canvas.height = S * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(now) {
    ctx.clearRect(0, 0, S, S);
    // sphere rim
    ctx.beginPath(); ctx.arc(S / 2, S / 2, R, 0, Math.PI * 2);
    var g = ctx.createRadialGradient(S / 2 - R * .3, S / 2 - R * .35, R * .1, S / 2, S / 2, R);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(227,246,247,.55)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(87,179,183,.25)'; ctx.lineWidth = 1; ctx.stroke();
    // dots
    for (var i = 0; i < N; i++) {
      var p = project(sphere[i]);
      if (p.z < -0.05) continue;
      var a = 0.18 + 0.72 * p.z;
      ctx.fillStyle = 'rgba(55,125,129,' + a.toFixed(3) + ')';
      ctx.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
    }
    // arcs hub → markers
    var hub = project(HUB);
    for (var m = 0; m < markers.length; m++) {
      var on = m === current;
      ctx.beginPath();
      var seg = 48, started = false;
      for (var s = 0; s <= seg; s++) {
        var q = project(arcPoint(HUB, markers[m], s / seg));
        if (q.z < -0.15) { started = false; continue; }
        if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = on ? 'rgba(55,125,129,.95)' : 'rgba(87,179,183,.35)';
      ctx.lineWidth = on ? 2.2 : 1.2;
      ctx.setLineDash(on ? [] : [3, 5]); ctx.stroke(); ctx.setLineDash([]);
      // travelling packet
      var t = ((now / (on ? 1400 : 2600)) + m * .21) % 1, pk = project(arcPoint(HUB, markers[m], t));
      if (pk.z > -0.1) { ctx.beginPath(); ctx.fillStyle = on ? '#377d81' : 'rgba(87,179,183,.8)'; ctx.arc(pk.x, pk.y, on ? 3.6 : 2.4, 0, Math.PI * 2); ctx.fill(); }
      // marker
      var mk = project(markers[m]);
      if (mk.z > -0.05) {
        var pulse = on ? (now / 900) % 1 : 0;
        if (on) { ctx.beginPath(); ctx.strokeStyle = 'rgba(87,179,183,' + (1 - pulse).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.arc(mk.x, mk.y, 8 + pulse * 18, 0, Math.PI * 2); ctx.stroke(); }
        ctx.beginPath(); ctx.fillStyle = on ? '#377d81' : '#fff'; ctx.strokeStyle = '#377d81'; ctx.lineWidth = 2;
        ctx.arc(mk.x, mk.y, on ? 7 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (on || mk.z > .35) {
          ctx.font = (on ? '700 ' : '600 ') + Math.max(11, S * .024) + 'px Kalameh, Vazirmatn, Tahoma, sans-serif';
          ctx.textAlign = 'center'; ctx.direction = 'rtl';
          var label = services[m].name, w = ctx.measureText(label).width + 18, lx = mk.x, ly = mk.y - 20;
          ctx.fillStyle = on ? '#316466' : 'rgba(255,255,255,.92)';
          roundRect(lx - w / 2, ly - 13, w, 24, 12); ctx.fill();
          ctx.fillStyle = on ? '#fff' : '#252525'; ctx.fillText(label, lx, ly + 4);
        }
      }
    }
    // hub (Kish)
    if (hub.z > -0.05) {
      ctx.beginPath(); ctx.fillStyle = '#57b3b7'; ctx.arc(hub.x, hub.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.strokeStyle = 'rgba(87,179,183,.4)'; ctx.lineWidth = 6; ctx.arc(hub.x, hub.y, 10, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  var raf = 0, last = performance.now();
  function frame(now) {
    var dt = Math.min(now - last, 50); last = now;
    // auto-advance
    if (paused || now < holdUntil || !visible) start = now - (parseFloat(items[current].querySelector('.ahg-item__bar i').style.getPropertyValue('--p')) || 0) * DURATION;
    else {
      var p = Math.min((now - start) / DURATION, 1);
      items[current].querySelector('.ahg-item__bar i').style.setProperty('--p', p.toFixed(3));
      if (p >= 1) select(current + 1, false);
    }
    rot += dt * 0.00012;
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { resize(); draw(performance.now()); });
  resize(); select(0, false); draw(performance.now());
  if (reduce) return;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0.05 }).observe(wrap);
  } else raf = requestAnimationFrame(frame);
})();
