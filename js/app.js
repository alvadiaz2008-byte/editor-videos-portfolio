function bindProjectScroller(stage, track) {
  const slides = () => [...track.querySelectorAll('.project-slide')];
  const pin = stage.querySelector('.projects-sticky');
  const scroller = document.getElementById('sitio') || window;
  const panel = scroller === window ? null : scroller;
  let locking = false;
  let snapTimer = 0;

  const scrollPos = () => (panel ? panel.scrollTop : window.scrollY);

  const metrics = () => {
    const n = slides().length;
    const pinH = pin ? pin.offsetHeight : (panel ? panel.clientHeight : window.innerHeight);
    const total = Math.max(stage.offsetHeight - pinH, 1);
    const stageTop = panel ? stage.offsetTop : stage.getBoundingClientRect().top + window.scrollY;
    const scrolled = Math.min(Math.max(scrollPos() - stageTop, 0), total);
    const pos = n <= 1 ? 0 : (scrolled / total) * (n - 1);
    return { n, total, stageTop, pos };
  };

  const update = () => {
    const items = slides();
    const { n, pos } = metrics();
    if (!n) return;
    const shift = window.innerWidth < 768 ? 54 : 46;

    items.forEach((slide, i) => {
      const delta = i - pos;
      const ad = Math.abs(delta);
      let opacity = 0;
      let scale = 0.62;
      let blur = 0;
      if (ad < 1.25) {
        const t = Math.max(0, 1 - ad);
        opacity = 0.55 + 0.45 * t;
        scale = 0.68 + 0.38 * t;
        blur = (1 - t) * 4;
      }
      slide.style.opacity = String(opacity);
      slide.style.filter = blur > 0.3 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
      slide.style.transform = 'translate3d(' + (delta * shift) + '%, 0, 0) scale(' + scale + ')';
      slide.style.zIndex = String(20 - Math.round(ad * 8));
      slide.style.visibility = ad > 1.25 ? 'hidden' : 'visible';
      const vid = slide.querySelector('video');
      if (vid && vid.getAttribute('src')) {
        if (ad < 0.45) vid.play().catch(() => {});
        else vid.pause();
      }
    });
  };

  const snapTo = (index) => {
    const { n, total, stageTop } = metrics();
    if (n < 2) return;
    const clamped = Math.min(n - 1, Math.max(0, index));
    const step = total / (n - 1);
    locking = true;
    const top = stageTop + clamped * step;
    if (panel) panel.scrollTo({ top: top, behavior: 'smooth' });
    else window.scrollTo({ top: top, behavior: 'smooth' });
    setTimeout(() => {
      locking = false;
      update();
    }, 520);
  };

  const snapToNearest = () => {
    if (locking) return;
    const rect = stage.getBoundingClientRect();
    const pinH = pin ? pin.offsetHeight : window.innerHeight;
    if (rect.top > 24 || rect.bottom < pinH - 24) return;
    const { n, pos } = metrics();
    if (n < 2) return;
    const nearest = Math.round(pos);
    if (Math.abs(pos - nearest) < 0.04) return;
    snapTo(nearest);
  };

  let ticking = false;
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  const onScroll = () => {
    request();
    if (locking) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToNearest, 140);
  };

  (panel || window).addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', request);

  let startX = 0;
  let startY = 0;
  stage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    clearTimeout(snapTimer);
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
    const { pos } = metrics();
    snapTo(Math.round(pos) + (dx < 0 ? 1 : -1));
  }, { passive: true });

  update();
}
