(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targets = [
    '.projects-head',
    '.before-after .wide',
    '.about .wide',
    '.contact .wide',
    '.footer .wide'
  ];

  var nodes = [];
  targets.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      nodes.push(el);
    });
  });

  document.querySelectorAll('.badge').forEach(function (badge, i) {
    badge.style.transitionDelay = (i * 40) + 'ms';
    nodes.push(badge);
  });

  if (reduce) {
    nodes.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  nodes.forEach(function (el) { el.classList.add('reveal'); });

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  nodes.forEach(function (el) { io.observe(el); });
})();
