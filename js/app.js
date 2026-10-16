// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

function observeVideoVisibility(video, rootEl) {
  if (!video || !rootEl) return;
  video.dataset.autoPlay = '1';
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        video.dataset.shouldPlay = '1';
        video.play().catch(() => {});
      } else {
        video.dataset.shouldPlay = '0';
        video.pause();
      }
    },
    { threshold: 0.2, rootMargin: '40px' }
  );
  io.observe(rootEl);
}

async function urlExists(src) {
  try {
    const r = await fetch(src, { method: 'HEAD' });
    if (r.ok) return true;
  } catch (_) {}
  try {
    const r = await fetch(src, { method: 'GET', headers: { Range: 'bytes=0-1' } });
    return r.ok || r.status === 206;
  } catch (_) {
    return false;
  }
}

function videoCandidates(label) {
  return [
    `videos/${encodeURIComponent('video ' + label + '.mp4')}`,
    'videos/video ' + label + '.mp4',
    'videos/video-' + label + '.mp4',
    'videos/video' + label + '.mp4'
  ];
}

async function findVideo(label) {
  const candidates = videoCandidates(label);
  const checks = await Promise.all(
    candidates.map(async (src) => ((await urlExists(src)) ? src : null))
  );
  return checks.find(Boolean) || null;
}

function thumbCandidates(num) {
  const label = String(num).padStart(2, '0');
  const bases = [
    'imagenes/' + encodeURIComponent('imagen ' + label),
    'imagenes/imagen ' + label,
    'imagenes/imagen-' + label,
    'imagenes/imagen' + label
  ];
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  const list = [];
  bases.forEach((b) => exts.forEach((e) => list.push(b + e)));
  return list;
}

function findThumbnail(num) {
  return new Promise((resolve) => {
    const candidates = thumbCandidates(num);
    let i = 0;
    const next = () => {
      if (i >= candidates.length) {
        resolve(null);
        return;
      }
      const src = candidates[i++];
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = next;
      img.src = src;
    };
    next();
  });
}

function loadHero() {
  const el = document.querySelector('.hero-bg[data-video]');
  if (!el) return;
  const num = String(el.dataset.video).padStart(2, '0');
  const videoEl = el.querySelector('.hero-video');
  if (!videoEl) return;
  videoEl.preload = 'metadata';
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.loop = true;
  findVideo(num).then((src) => {
    if (!src) return;
    videoEl.src = src;
    videoEl.hidden = false;
    el.classList.add('has-video');
    const numberEl = el.querySelector('.slot-number');
    if (numberEl) numberEl.style.display = 'none';
    observeVideoVisibility(videoEl, el.closest('.hero') || el);
  });
}

loadHero();

function loadBeforeAfter() {
  const beforeEl = document.getElementById('beforeImg');
  const afterEl = document.getElementById('afterImg');
  const slider = document.getElementById('baSlider');
  if (!beforeEl || !afterEl) return;

  const beforeNames = [
    'videos/antes.jpg', 'videos/antes.png', 'videos/antes.webp',
    'videos/before.jpg', 'videos/before.png', 'videos/before.webp',
    'videos/antes.mp4', 'videos/before.mp4'
  ];
  const afterNames = [
    'videos/despues.jpg', 'videos/despues.png', 'videos/despues.webp',
    'videos/after.jpg', 'videos/after.png', 'videos/after.webp',
    'videos/despues.mp4', 'videos/after.mp4'
  ];

  const tryLoad = (names, targetImg) => {
    let i = 0;
    const next = () => {
      if (i >= names.length) return;
      const src = names[i++];
      const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');
      if (isVideo) {
        const v = document.createElement('video');
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.onloadeddata = () => {
          targetImg.replaceWith(v);
          if (slider) observeVideoVisibility(v, slider);
        };
        v.onerror = next;
        v.src = src;
      } else {
        const img = new Image();
        img.onload = () => { targetImg.src = src; };
        img.onerror = next;
        img.src = src;
      }
    };
    next();
  };

  tryLoad(beforeNames, beforeEl);
  tryLoad(afterNames, afterEl);
}

loadBeforeAfter();

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

const FALLBACK_PROJECTS = [
  { id: '02', categoria: 'Shorts / Reels', titulo: 'Reel Dinamico Marca X', descripcion: 'Edicion rapida, ritmo y texto impactante.' },
  { id: '03', categoria: 'Promocionales', titulo: 'Spot Comercial', descripcion: 'Color grading y narrativa persuasiva.' },
  { id: '04', categoria: 'YouTube / Largo', titulo: 'Documental Corto', descripcion: 'Storytelling y postproduccion completa.' },
  { id: '05', categoria: 'Shorts / Reels', titulo: 'Serie de Reels', descripcion: 'Consistencia visual y engagement.' }
];

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
      slide.style.transform = 'translate3d(' + (delta * 100) + '%, 0, 0) scale(' + scale + ')';
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

async function initProjects() {
  const stage = document.getElementById('proyectos');
  const track = document.getElementById('projectsTrack');
  if (!stage || !track) return;

  let data = FALLBACK_PROJECTS;
  try {
    const r = await fetch('data/projects.json');
    if (r.ok) {
      const json = await r.json();
      if (Array.isArray(json) && json.length) data = json;
    }
  } catch (_) {}

  const steps = Math.max(data.length - 1, 1);
  stage.style.height = 'calc(' + (steps + 1) + ' * 100dvh)';

  track.innerHTML = data.map((p) => {
    const id = String(p.id).padStart(2, '0');
    return (
      '<article class="project-slide" data-video="' + id + '">' +
        '<div class="slide-video"><div class="slide-media">' +
          '<span class="slot-number">' + id + '</span>' +
          '<video class="slide-vid" muted playsinline loop preload="metadata"></video>' +
        '</div></div>' +
        '<div class="slide-copy">' +
          '<span class="proj-num">' + id + '</span>' +
          '<div class="proj-desc-box">' +
            '<span class="category">' + escapeHtml(p.categoria) + '</span>' +
            '<h3>' + escapeHtml(p.titulo) + '</h3>' +
            '<p>' + escapeHtml(p.descripcion) + '</p>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  track.querySelectorAll('.project-slide').forEach((slide) => {
    const id = slide.dataset.video;
    const media = slide.querySelector('.slide-media');
    const videoEl = slide.querySelector('video');
    findVideo(id).then((src) => {
      if (!src || !videoEl) return;
      videoEl.src = src;
      const thumb = media.querySelector('.slot-thumb');
      if (thumb) thumb.remove();
      const num = media.querySelector('.slot-number');
      if (num) num.style.display = 'none';
    });
    findThumbnail(id).then((thumb) => {
      if (!thumb || videoEl.getAttribute('src') || media.querySelector('.slot-thumb')) return;
      const img = document.createElement('img');
      img.className = 'slot-thumb';
      img.alt = '';
      img.src = thumb;
      media.appendChild(img);
      const num = media.querySelector('.slot-number');
      if (num) num.style.display = 'none';
    });
  });

  bindProjectScroller(stage, track);
}

initProjects();

const baSlider = document.getElementById('baSlider');
const baHandle = document.getElementById('baHandle');
const baAfter = document.querySelector('.ba-after');

if (baSlider && baHandle && baAfter) {
  let isDragging = false;
  const updateSlider = (clientX) => {
    const rect = baSlider.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percent = (x / rect.width) * 100;
    baHandle.style.left = percent + '%';
    baAfter.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
  };
  baHandle.addEventListener('mousedown', () => (isDragging = true));
  baHandle.addEventListener('touchstart', () => (isDragging = true), { passive: true });
  window.addEventListener('mouseup', () => (isDragging = false));
  window.addEventListener('touchend', () => (isDragging = false));
  window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
  }, { passive: true });
  baSlider.addEventListener('click', (e) => updateSlider(e.clientX));
}
