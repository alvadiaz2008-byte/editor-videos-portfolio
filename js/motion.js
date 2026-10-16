(function () {
  const scenes = [
    document.querySelector('.hero-content'),
    document.querySelector('.before-after .wide'),
    document.querySelector('.about .wide'),
    document.querySelector('.contact .wide')
  ].filter(Boolean);

  scenes.forEach((el) => el.classList.add('motion'));

  const heroBg = document.querySelector('.hero-bg');
  const hero = document.querySelector('.hero');
  const links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  const ids = ['inicio', 'proyectos', 'antes-despues', 'sobre', 'contacto'];

  function tick() {
    const vh = window.innerHeight || 1;
    const mid = vh * 0.46;

    scenes.forEach((el) => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height * 0.5;
      const dist = (center - mid) / vh;
      const ad = Math.min(Math.abs(dist), 1.15);
      const t = Math.max(0, 1 - ad);
      const scale = 0.9 + 0.12 * t;
      const opacity = 0.34 + 0.66 * t;
      const blur = (1 - t) * 5;
      const y = dist * 36;
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
      el.style.opacity = String(opacity.toFixed(3));
      el.style.filter = blur > 0.35 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
    });

    if (hero && heroBg) {
      const r = hero.getBoundingClientRect();
      const leave = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
      heroBg.style.transform = 'scale(' + (1 + leave * 0.06).toFixed(3) + ')';
    }

    let current = ids[0];
    ids.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      const r = section.getBoundingClientRect();
      if (r.top < vh * 0.42 && r.bottom > vh * 0.42) current = id;
    });
    links.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  let ticking = false;
  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      tick();
    });
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  tick();
})();
