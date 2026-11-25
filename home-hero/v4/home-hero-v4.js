/* Homepage hero — Version 4 "Spotlight". No dependencies. Supports several instances per page. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('.ahs-hero'), init);

  function init(root) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var data = JSON.parse(root.querySelector('script.ahs-data').textContent);
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.ahs-tab'));
    var panel = root.querySelector('.ahs-panel');
    var bar = panel.querySelector('.ahs-panel__bar i');
    var $ = function (k) { return panel.querySelector('[data-ahs="' + k + '"]'); };
    var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
    var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
    var DURATION = parseFloat(getComputedStyle(root).getPropertyValue('--ahs-dur')) || 6500;
    var current = 0, start = performance.now(), paused = false, holdUntil = 0, visible = true, progress = 0;

    function render(s, i) {
      var n = fa('0' + (i + 1));
      $('n').textContent = n; $('n2').textContent = fa(i + 1);
      $('k').textContent = s.k; $('name').textContent = s.name; $('text').textContent = s.text;
      $('href').setAttribute('href', s.href);
      $('icon').setAttribute('href', '#ahs-i-' + s.icon);
      $('points').innerHTML = s.points.map(function (p) {
        return '<li><span class="ahs-check"><svg class="ahs-icon" aria-hidden="true"><use href="#ahs-i-check"/></svg></span>' + esc(p) + '</li>';
      }).join('');
      var ANG = [-90, 30, 150];
      $('tags').innerHTML = s.tags.map(function (t, j) {
        return '<span class="ahs-sat" style="--a:' + ANG[j % 3] + 'deg"><i class="ahs-sat__line"></i><span class="ahs-tag">' + esc(t) + '</span></span>';
      }).join('');
    }
    function select(i, user, focus) {
      current = (i + data.length) % data.length;
      tabs.forEach(function (t, k) {
        var on = k === current;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tabs[current].id);
      panel.style.setProperty('--notch', tabs[current].style.getPropertyValue('--x'));
      render(data[current], current);
      panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap');
      if (focus) tabs[current].focus();
      // keep the active chip visible in the mobile scroller without moving the page
      var row = tabs[current].closest('.ahs-tabs');
      if (row && row.scrollWidth > row.clientWidth) {
        var li = tabs[current].parentNode;
        row.scrollTo({ left: li.offsetLeft - (row.clientWidth - li.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
      start = performance.now(); progress = 0;
      if (user) holdUntil = performance.now() + 12000;
    }

    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(k, true); });
      t.addEventListener('keydown', function (e) {
        // RTL: visual left = next item
        var d = { ArrowLeft: 1, ArrowRight: -1, Home: -current, End: data.length - 1 - current }[e.key];
        if (d !== undefined) { e.preventDefault(); select(current + d, true, true); }
      });
    });
    Array.prototype.forEach.call(panel.querySelectorAll('[data-ahs-go]'), function (b) {
      b.addEventListener('click', function () { select(current + parseInt(b.getAttribute('data-ahs-go'), 10), true); });
    });
    [root.querySelector('.ahs-bus'), panel].forEach(function (el) {
      el.addEventListener('mouseenter', function () { paused = true; });
      el.addEventListener('mouseleave', function () { paused = false; });
      el.addEventListener('focusin', function () { paused = true; });
      el.addEventListener('focusout', function () { paused = false; });
    });

    (function tick(now) {
      if (paused || now < holdUntil || !visible || reduce) start = now - progress * DURATION;
      else {
        progress = Math.min((now - start) / DURATION, 1);
        bar.style.setProperty('--p', progress.toFixed(3));
        if (progress >= 1) select(current + 1, false);
      }
      requestAnimationFrame(tick);
    })(performance.now());

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.15 }).observe(panel);
    }
    select(0, false);
  }
})();
