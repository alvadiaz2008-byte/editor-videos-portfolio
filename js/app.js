function bindProjectScroller(stage, track) {
  const slides = () => [...track.querySelectorAll('.project-slide')];
  const pin = stage.querySelector('.projects-sticky');
  let locking = false;
  let snapTimer = 0;

  const metrics = () => {
    const n = slides().length;
    const pinH = pin ? pin.offsetHeight : window.innerHeight;
    const total = Math.max(stage.offsetHeight - pinH, 1);
    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const scrolled = Math.min(Math.max(window.scrollY - stageTop, 0), total);
    const pos = n <= 1 ? 0 : (scrolled / total) * (n - 1);
    return { n, total, stageTop, pos };
  };

  const update = () => {
    const items = slides();
    const { n, pos } = metrics();
    if (!n) return;
    track.style.transform = 'none';

    items.forEach((slide, i) => {
      const delta = i - pos;
      const ad = Math.abs(delta);
      let opacity = 0;
      let scale = 0.72;
      if (ad < 1) {
        const t = 1 - ad;
        opacity = t * t;
        scale = 0.72 + 0.34 * t;
      }
      slide.style.opacity = String(opacity);
      slide.style.transform = `translate3d(${delta * 100}%, 0, 0) scale(${scale})`;
      slide.style.zIndex = String(10 - Math.round(ad * 5));
      slide.style.visibility = opacity < 0.04 ? 'hidden' : 'visible';
      const vid = slide.querySelector('video');
      if (vid && vid.getAttribute('src')) {
        if (ad < 0.35) vid.play().catch(() => {});
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
    window.scrollTo({ top: stageTop + clamped * step, behavior: 'smooth' });
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

  window.addEventListener('scroll', () => {
    request();
    if (locking) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToNearest, 140);
  }, { passive: true });
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
