/* NexGap service page — interactions. No dependencies. */
(function () {
  'use strict';
  var root = document.querySelector('.nx-page');
  if (!root) return;
  root.classList.add('nx-js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isRTL = getComputedStyle(root).direction === 'rtl';

  /* ---------- Reveal on scroll ---------- */
  var revealEls = root.querySelectorAll('[data-nx-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Generic accessible tablist ---------- */
  function initTabs(list, onChange) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tabs[i].focus();
      if (onChange) onChange(i);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); if (t._userCb) t._userCb(); });
      t.addEventListener('keydown', function (e) {
        var next = isRTL ? 'ArrowLeft' : 'ArrowRight';
        var prev = isRTL ? 'ArrowRight' : 'ArrowLeft';
        var idx = null;
        if (e.key === next || e.key === 'ArrowDown') idx = (i + 1) % tabs.length;
        else if (e.key === prev || e.key === 'ArrowUp') idx = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') idx = 0;
        else if (e.key === 'End') idx = tabs.length - 1;
        if (idx !== null) { e.preventDefault(); select(idx, true); }
      });
    });
    return { select: select, tabs: tabs };
  }

  /* ---------- Platform tabs ---------- */
  var pTabs = root.querySelector('[data-nx-tabs="platform"]');
  /* horizontal scrolling for the tab chips when they overflow (mobile/tablet):
     mouse wheel → horizontal, drag to scroll, keep the active chip in view */
  function makeHScroll(el) {
    function overflowing() { return el.scrollWidth > el.clientWidth + 1; }
    function updateEnd() {
      var max = el.scrollWidth - el.clientWidth;
      el.classList.toggle('is-end', !overflowing() || Math.abs(el.scrollLeft) >= max - 2);
    }
    el.addEventListener('wheel', function (e) {
      if (!overflowing() || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollBy({ left: isRTL ? -e.deltaY : e.deltaY });
    }, { passive: false });
    var down = false, startX = 0, startLeft = 0, moved = false;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || !overflowing()) return;
      down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; el.classList.add('is-dragging'); }
      el.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false; el.classList.remove('is-dragging');
    });
    el.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    el.addEventListener('scroll', updateEnd, { passive: true });
    window.addEventListener('resize', updateEnd);
    updateEnd();
  }
  if (pTabs) makeHScroll(pTabs);

  if (pTabs) initTabs(pTabs, function (i) {
    var t = pTabs.querySelectorAll('[role="tab"]')[i];
    if (t && pTabs.scrollWidth > pTabs.clientWidth) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    // autoplay the platform video only while its tab is shown
    root.querySelectorAll('.nx-panel video').forEach(function (v) {
      var shown = !v.closest('.nx-panel').hidden;
      var card = v.closest('.nx-vcard');
      if (shown && !reduce) {
        var p = v.play(); if (p && p.catch) p.catch(function () {});
        if (card) card.classList.add('is-playing');
      } else { v.pause(); if (card) card.classList.remove('is-playing'); }
    });
  });

  /* ---------- Studio stepper (autoplay while visible) ---------- */
  var sList = root.querySelector('[data-nx-tabs="studio"]');
  if (sList) {
    var DURATION = 6500;
    var current = 0, start = 0, raf = 0, paused = false, visible = false, stopped = reduce;
    var ctrl = initTabs(sList, function (i) {
      current = i;
      ctrl && ctrl.tabs.forEach(function (t, k) {
        t.classList.toggle('is-done', k < i);
        t.style.setProperty('--p', 0);
      });
      start = performance.now();
      // play the production video only while its stage is visible
      root.querySelectorAll('.nx-stage video').forEach(function (v) {
        var shown = !v.closest('.nx-stage').hidden;
        if (shown && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!shown) v.pause();
      });
    });
    // user interaction stops autoplay for good
    ctrl.tabs.forEach(function (t) { t._userCb = function () { stopped = true; }; });

    function tick(now) {
      if (!stopped && visible && !paused) {
        var p = Math.min((now - start) / DURATION, 1);
        ctrl.tabs[current].style.setProperty('--p', p.toFixed(3));
        if (p >= 1) ctrl.select((current + 1) % ctrl.tabs.length, false);
      } else {
        start = now - (parseFloat(ctrl.tabs[current].style.getPropertyValue('--p')) || 0) * DURATION;
      }
      raf = requestAnimationFrame(tick);
    }
    var box = sList.closest('.nx-studio__box');
    box.addEventListener('mouseenter', function () { paused = true; });
    box.addEventListener('mouseleave', function () { paused = false; });
    box.addEventListener('focusin', function () { paused = true; });
    box.addEventListener('focusout', function () { paused = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.35 }).observe(box);
    } else { visible = true; }
    ctrl.select(0, false);
    if (!reduce) raf = requestAnimationFrame(tick);
  }

  /* ---------- Hero: cycling model + typed prompt ---------- */
  var modelEl = root.querySelector('[data-nx-model]');
  var promptEl = root.querySelector('[data-nx-prompt]');
  if (modelEl && promptEl && !reduce) {
    var models = (modelEl.getAttribute('data-nx-model') || '').split(',');
    var prompts = (promptEl.getAttribute('data-nx-prompt') || '').split('|');
    var mi = 0;
    function typePrompt(text, done) {
      var i = 0; promptEl.textContent = '';
      (function step() {
        promptEl.textContent = text.slice(0, i++);
        if (i <= text.length) setTimeout(step, 38); else setTimeout(done, 2200);
      })();
    }
    (function loop() {
      mi = (mi + 1) % models.length;
      modelEl.style.opacity = 0;
      setTimeout(function () { modelEl.textContent = models[mi]; modelEl.style.opacity = 1; }, 250);
      typePrompt(prompts[mi % prompts.length], loop);
    })();
  }

  /* ---------- Use-case carousel dots (mobile) ---------- */
  var car = root.querySelector('[data-nx-carousel]');
  var dots = root.querySelectorAll('.nx-uses__dots i');
  if (car && dots.length) {
    var items = car.children;
    var setDot = function () {
      var c = car.getBoundingClientRect(), best = 0, bestD = Infinity;
      for (var i = 0; i < items.length; i++) {
        var r = items[i].getBoundingClientRect();
        var d = Math.abs((isRTL ? c.right - r.right : r.left - c.left));
        if (d < bestD) { bestD = d; best = i; }
      }
      dots.forEach(function (dt, k) { dt.classList.toggle('is-on', k === best); });
    };
    car.addEventListener('scroll', function () { window.requestAnimationFrame(setDot); }, { passive: true });
  }

  /* ---------- Consult form: client-side validation (server handler unchanged) ---------- */
  var form = root.querySelector('[data-nx-consult]');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var wrap = input.closest('.nx-field-in');
        var err = wrap && wrap.querySelector('.nx-field-in__err');
        var valid = input.value.trim() !== '';
        if (input.type === 'tel') {
          var v = input.value.replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/\D/g, '');
          valid = /^(0|98)?9\d{9}$/.test(v);
        }
        if (wrap) wrap.toggleAttribute('data-invalid', !valid);
        if (err) err.hidden = valid;
        input.setAttribute('aria-invalid', valid ? 'false' : 'true');
        if (!valid && ok) { input.focus(); ok = false; }
      });
      if (!ok) e.preventDefault();
    });
  }
})();
