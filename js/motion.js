(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = [];
  ['.projects-head', '.before-after .wide', '.about .wide', '.contact .wide', '.footer .wide'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { nodes.push(el); });
  });

  if (reduce || !('IntersectionObserver' in window)) return;

  nodes.forEach(function (el) { el.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

  nodes.forEach(function (el) { io.observe(el); });
})();
