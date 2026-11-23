/* Member Jungle theme motion (Revamp Digital, Nov 2026)
   Shared by every theme. Two jobs, both switched on from the theme CSS:

   1. Scroll reveal. Does nothing unless the active theme sets
      --t-motion: 1 on :root, and nothing when the visitor has asked for
      reduced motion. Adds .t-motion to <html>, marks each top level widget
      with .t-reveal and adds .is-in as it scrolls into view. The theme CSS
      decides what those classes look like.

   2. Scroller arrows (added 17 Nov 2026). A theme can turn a quicklink row
      into a sideways scroller with CSS alone. Where it also sets
      --t-scroll: 1 on that row (a quicklink row, or since 23 Nov 2026 a photo strip), this adds a previous and a next button
      straight after the row (div.t-scroll-nav > button.t-scroll-btn), marks
      the row .t-scroll-on and its parent .t-scroll-wrap, and keeps the
      buttons' disabled state in step with the scroll position. The theme
      styles and places the buttons. The row still scrolls by touch,
      trackpad and keyboard without this.

   3. Turning by itself and looping (added 23 Nov 2026). A scroller row
      that also sets --t-scroll-auto: <milliseconds> moves on by one card
      at that interval, and one that sets --t-scroll-loop: 1 goes back to
      the start after the last card (and to the end before the first), so
      its arrows are never switched off. Turning by itself always loops. It
      stops while the pointer is over the row or its arrows, while anything
      in them has keyboard focus, while the row is off screen and while the
      tab is hidden, and restarts its wait after every click or swipe. It
      never runs for a visitor who has asked for reduced motion.

   4. Slideshow opacity: the widget's Opacity is moved from the whole
      slideshow onto its photos (--t-slide-opacity, .t-slide-faded).

   Safe to leave installed when a theme uses none of these. */
(function () {
  /* 2. scroller arrows: independent of the motion switch */
  function initScrollers() {
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var rows = document.querySelectorAll('.row.cb_quicklink, .des-photostrip');
    Array.prototype.forEach.call(rows, function (row) {
      if (row.className.indexOf('t-scroll-on') > -1) return;
      var cs = getComputedStyle(row);
      var flag = cs.getPropertyValue('-' + '-t-scroll').trim();
      if (flag !== '1') return;
      var auto = parseInt(cs.getPropertyValue('-' + '-t-scroll-auto'), 10) || 0;
      if (auto > 0 && auto < 2000) auto = 2000;
      var loop = auto > 0 || cs.getPropertyValue('-' + '-t-scroll-loop').trim() === '1';

      function make(cls, label, arrow) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 't-scroll-btn ' + cls;
        b.setAttribute('aria-label', label);
        var s = document.createElement('span');
        s.setAttribute('aria-hidden', 'true');
        s.appendChild(document.createTextNode(arrow));
        b.appendChild(s);
        return b;
      }
      var nav = document.createElement('div');
      nav.className = 't-scroll-nav';
      var prev = make('t-scroll-prev', 'Previous', '\u2190');
      var next = make('t-scroll-next', 'Next', '\u2192');
      nav.appendChild(prev);
      nav.appendChild(next);
      row.parentNode.insertBefore(nav, row.nextSibling);
      row.classList.add('t-scroll-on');
      row.parentNode.classList.add('t-scroll-wrap');

      /* one card and its gap, measured from the first two cards */
      function step() {
        var cards = [];
        Array.prototype.forEach.call(row.children, function (c) {
          if ((c.tagName === 'DIV' || c.tagName === 'A') && c.offsetWidth) cards.push(c);
        });
        if (cards.length > 1) {
          var d = Math.abs(cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left);
          if (d > 0) return d;
        }
        return cards.length ? cards[0].offsetWidth : row.clientWidth * 0.8;
      }
      function sync() {
        var max = row.scrollWidth - row.clientWidth;
        nav.hidden = max < 2;
        prev.disabled = !loop && row.scrollLeft < 2;
        next.disabled = !loop && row.scrollLeft > max - 2;
      }
      function to(x) {
        if (row.scrollTo) row.scrollTo({ left: x, behavior: reduce ? 'auto' : 'smooth' });
        else row.scrollLeft = x;
      }
      function go(dir) {
        var max = row.scrollWidth - row.clientWidth;
        if (loop && dir > 0 && row.scrollLeft > max - 2) return to(0);
        if (loop && dir < 0 && row.scrollLeft < 2) return to(max);
        var by = dir * step();
        if (row.scrollBy) row.scrollBy({ left: by, behavior: reduce ? 'auto' : 'smooth' });
        else row.scrollLeft += by;
      }
      /* 3. turning by itself */
      var timer = null, held = false, seen = true;
      function wait() {
        if (!(auto > 0) || reduce) return;
        clearTimeout(timer);
        timer = setTimeout(function () {
          timer = null;
          if (!held && seen && !document.hidden && !nav.hidden) go(1);
          wait();
        }, auto);
      }
      if (auto > 0 && !reduce) {
        var hold = function () { held = true; };
        var release = function () { held = false; wait(); };
        [row, nav].forEach(function (el) {
          el.addEventListener('mouseenter', hold);
          el.addEventListener('mouseleave', release);
          el.addEventListener('focusin', hold);
          el.addEventListener('focusout', release);
        });
        row.addEventListener('touchstart', wait, { passive: true });
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries) {
            seen = entries[entries.length - 1].isIntersecting;
          }, { threshold: 0.25 }).observe(row);
        }
        wait();
      }
      prev.addEventListener('click', function () { go(-1); wait(); });
      next.addEventListener('click', function () { go(1); wait(); });
      var waiting = false;
      function later() {
        if (waiting) return;
        waiting = true;
        setTimeout(function () { waiting = false; sync(); }, 80);
      }
      row.addEventListener('scroll', later, { passive: true });
      window.addEventListener('resize', later);
      window.addEventListener('load', sync);
      sync();
    });
  }

  /* 4. slideshow opacity (23 Nov 2026): the widget's Opacity setting fades the
     whole slideshow, text and colour panels included. Move it onto the photos:
     the slideshow is set back to full strength and its value is handed to the
     theme as --t-slide-opacity on the carousel, marked .t-slide-faded. */
  function initSlideOpacity() {
    var shows = document.querySelectorAll('.module.output.slideshow .carousel');
    Array.prototype.forEach.call(shows, function (c) {
      if (c.className.indexOf('t-slide-faded') > -1) return;
      var o = parseFloat(getComputedStyle(c).opacity);
      if (!(o < 1)) return;
      c.style.setProperty('-' + '-t-slide-opacity', String(o));
      c.style.setProperty('opacity', '1', 'important');
      c.classList.add('t-slide-faded');
      /* a theme that does not put the value on its photos (no rule for
         .t-slide-faded) keeps the platform's fade as it was */
      var img = c.querySelector('.carousel-inner > .item img');
      if (!img || parseFloat(getComputedStyle(img).opacity) >= 1) {
        c.style.removeProperty('opacity');
        c.style.removeProperty('-' + '-t-slide-opacity');
        c.classList.remove('t-slide-faded');
      }
    });
  }

  function init() {
    try { initScrollers(); } catch (e) { /* never let the arrows stop the reveal */ }
    try { initSlideOpacity(); } catch (e) { /* leave the platform's fade as it is */ }
    var root = document.documentElement;
    var flag = getComputedStyle(root).getPropertyValue('-' + '-t-motion').trim();
    if (flag !== '1') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    root.classList.add('t-motion');

    var targets = document.querySelectorAll(
      '#page-content-article > .page-content-container > .module.output,' +
      '#page-content-article > .page-content-container > h1.pageheading,' +
      '#post-page-content > .module.output,' +
      '#left-sidebar-aside > .sidebar-module,' +
      '#right-sidebar-aside > .sidebar-module'
    );

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    var vh = window.innerHeight;
    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('t-reveal');
      var top = el.getBoundingClientRect().top;
      if (top < vh * 0.85) {
        /* already on screen: reveal in sequence rather than waiting on scroll */
        setTimeout(function () { el.classList.add('is-in'); }, 60 + i * 90);
      } else {
        io.observe(el);
      }
    });

    /* belt and braces: a cheap scroll check as well as the observer, so a
       block can never stay hidden if the observer is late or unavailable */
    var pending = false;
    function sweep() {
      pending = false;
      var left = document.querySelectorAll('.t-reveal:not(.is-in)');
      if (!left.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        return;
      }
      var h = window.innerHeight;
      Array.prototype.forEach.call(left, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) el.classList.add('is-in');
      });
    }
    function onScroll() {
      if (pending) return;
      pending = true;
      setTimeout(sweep, 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    setTimeout(sweep, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
