/* Member Jungle theme motion (Revamp Digital, Nov 2026)
   Shared by every theme. Does nothing unless the active theme sets
   --t-motion: 1 on :root, and nothing when the visitor has asked for
   reduced motion. Adds .t-motion to <html>, marks each top level widget
   with .t-reveal and adds .is-in as it scrolls into view. The theme CSS
   decides what those classes look like. Safe to leave installed when a
   theme without motion is active. */
(function () {
  function init() {
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
      (window.requestAnimationFrame || setTimeout)(sweep);
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
