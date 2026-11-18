/* Member Jungle theme motion (Revamp Digital, Nov 2026)
   Shared by every theme. Two jobs, both switched on from the theme CSS:

   1. Scroll reveal. Does nothing unless the active theme sets
      --t-motion: 1 on :root, and nothing when the visitor has asked for
      reduced motion. Adds .t-motion to <html>, marks each top level widget
      with .t-reveal and adds .is-in as it scrolls into view. The theme CSS
      decides what those classes look like.

   2. Scroller arrows (added 17 Nov 2026). A theme can turn a quicklink row
      into a sideways scroller with CSS alone. Where it also sets
      --t-scroll: 1 on that row, this adds a previous and a next button
      straight after the row (div.t-scroll-nav > button.t-scroll-btn), marks
      the row .t-scroll-on and its parent .t-scroll-wrap, and keeps the
      buttons' disabled state in step with the scroll position. The theme
      styles and places the buttons. The row still scrolls by touch,
      trackpad and keyboard without this.

   Safe to leave installed when a theme uses neither. */
(function () {
  /* 2. scroller arrows: independent of the motion switch */
  function initScrollers() {
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var rows = document.querySelectorAll('.row.cb_quicklink');
    Array.prototype.forEach.call(rows, function (row) {
      if (row.className.indexOf('t-scroll-on') > -1) return;
      var flag = getComputedStyle(row).getPropertyValue('-' + '-t-scroll').trim();
      if (flag !== '1') return;

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
          if (c.tagName === 'DIV' && c.offsetWidth) cards.push(c);
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
        prev.disabled = row.scrollLeft < 2;
        next.disabled = row.scrollLeft > max - 2;
      }
      function go(dir) {
        var by = dir * step();
        if (row.scrollBy) row.scrollBy({ left: by, behavior: reduce ? 'auto' : 'smooth' });
        else row.scrollLeft += by;
      }
      prev.addEventListener('click', function () { go(-1); });
      next.addEventListener('click', function () { go(1); });
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

  function init() {
    try { initScrollers(); } catch (e) { /* never let the arrows stop the reveal */ }
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
