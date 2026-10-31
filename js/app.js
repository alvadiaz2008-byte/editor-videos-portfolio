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
    'videos/' + encodeURIComponent('video ' + label + '.mp4'),
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
  { id: '01', categoria: 'Shorts / Reels', titulo: 'Reel Dinamico Marca X', descripcion: 'Edicion rapida, ritmo y texto impactante.' },
  { id: '02', categoria: 'Promocionales', titulo: 'Spot Comercial', descripcion: 'Color grading y narrativa persuasiva.' },
  { id: '03', categoria: 'YouTube / Largo', titulo: 'Documental Corto', descripcion: 'Storytelling y postproduccion completa.' },
  { id: '04', categoria: 'Shorts / Reels', titulo: 'Serie de Reels', descripcion: 'Consistencia visual y engagement.' }
];

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
    const open = document.documentElement.classList.contains('entered');

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
      slide.style.pointerEvents = 'none';
      const media = slide.querySelector('.slide-media');
      const copy = slide.querySelector('.slide-copy');
      if (media) media.style.pointerEvents = 'auto';
      if (copy) copy.style.pointerEvents = ad < 0.45 ? 'auto' : 'none';
      const vid = slide.querySelector('video');
      if (vid && vid.getAttribute('src')) {
        if (open && ad < 0.45) vid.play().catch(() => {});
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

  track.addEventListener('click', (e) => {
    const media = e.target.closest ? e.target.closest('.slide-media') : null;
    if (!media) return;
    const slide = media.closest('.project-slide');
    const index = slides().indexOf(slide);
    if (index < 0) return;
    if (index === Math.round(metrics().pos)) return;
    e.preventDefault();
    e.stopPropagation();
    snapTo(index);
  });

  window.addEventListener('projects-enter', () => {
    update();
    const first = slides()[0];
    const vid = first && first.querySelector('video');
    if (!vid) return;
    vid.muted = true;
    const start = () => {
      if (!vid.getAttribute('src')) return;
      try { vid.currentTime = 0; } catch (_) {}
      vid.play().catch(() => {});
    };
    start();
    vid.addEventListener('canplay', start, { once: true });
  });

  update();
}


const TRAITS = {
  audio: ['Audio', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m18,7.5v9c0,.276-.224.5-.5.5s-.5-.224-.5-.5V7.5c0-.276.224-.5.5-.5s.5.224.5.5ZM13.5,0c-.276,0-.5.224-.5.5v23c0,.276.224.5.5.5s.5-.224.5-.5V.5c0-.276-.224-.5-.5-.5Zm8,4c-.276,0-.5.224-.5.5v15c0,.276.224.5.5.5s.5-.224.5-.5V4.5c0-.276-.224-.5-.5-.5Zm-12,0c-.276,0-.5.224-.5.5v15c0,.276.224.5.5.5s.5-.224.5-.5V4.5c0-.276-.224-.5-.5-.5Zm-4,3c-.276,0-.5.224-.5.5v9c0,.276.224.5.5.5s.5-.224.5-.5V7.5c0-.276-.224-.5-.5-.5Zm-4,2c-.276,0-.5.224-.5.5v5c0,.276.224.5.5.5s.5-.224.5-.5v-5c0-.276-.224-.5-.5-.5Z"/></svg>'],
  texto: ['Texto', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24,14v1h-1v-1c0-.55-.45-1-1-1h-3v10h-1V13h-3c-.55,0-1,.45-1,1v1h-1v-1c0-1.1,.9-2,2-2h7c1.1,0,2,.9,2,2ZM16.5,2c.83,0,1.5,.67,1.5,1.5v1.5h1v-1.5c0-1.38-1.12-2.5-2.5-2.5H2.5C1.12,1,0,2.12,0,3.5v1.5H1v-1.5c0-.83,.67-1.5,1.5-1.5h6.5V23h1V2h6.5Z"/></svg>'],
  subtitulos: ['Subtítulos', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.5,1.987H4.5C2.019,1.987,0,4.006,0,6.487v11c0,2.481,2.019,4.5,4.5,4.5h15c2.481,0,4.5-2.019,4.5-4.5V6.487c0-2.481-2.019-4.5-4.5-4.5Zm3.5,15.5c0,1.93-1.57,3.5-3.5,3.5H4.5c-1.93,0-3.5-1.57-3.5-3.5V6.487c0-1.93,1.57-3.5,3.5-3.5h15c1.93,0,3.5,1.57,3.5,3.5v11Zm-3-4.987c0,.276-.224,.5-.5,.5H9.5c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5h10c.276,0,.5,.224,.5,.5Zm0,4c0,.276-.224,.5-.5,.5h-2c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5h2c.276,0,.5,.224,.5,.5ZM4,12.5c0-.276,.224-.5,.5-.5h2c.276,0,.5,.224,.5,.5s-.224,.5-.5,.5h-2c-.276,0-.5-.224-.5-.5Zm11,4c0,.276-.224,.5-.5,.5H4.5c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5H14.5c.276,0,.5,.224,.5,.5Z"/></svg>']
};

function traitsHtml(list) {
  if (!Array.isArray(list) || !list.length) return '';
  const seen = {};
  const items = [];
  list.forEach((name) => {
    const key = String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const alias = key;
    if (!TRAITS[alias] || seen[alias]) return;
    seen[alias] = true;
    const pair = TRAITS[alias];
    items.push('<span class="trait" title="' + pair[0] + '">' + pair[1] + '</span>');
  });
  if (!items.length) return '';
  return '<div class="proj-traits">' + items.join('') + '</div>';
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
      const list = Array.isArray(json) ? json : (json && json.proyectos);
      if (Array.isArray(list) && list.length) data = list;
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
          '<video class="slide-vid" muted playsinline loop preload="auto"></video>' +
        '</div></div>' +
        '<div class="slide-copy">' +
          '<div class="proj-desc-box">' +
            '<span class="proj-num">' + id + '</span>' +
            '<span class="category">' + escapeHtml(p.categoria) + '</span>' +
            '<h3>' + escapeHtml(p.titulo) + '</h3>' +
            '<p>' + escapeHtml(p.descripcion) + '</p>' +
            traitsHtml(p.caracteristicas) +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  track.querySelectorAll('.project-slide').forEach((slide) => {
    const id = slide.dataset.video;
    const media = slide.querySelector('.slide-media');
    const videoEl = slide.querySelector('video');
    const isFirst = slide === track.querySelector('.project-slide');
    findVideo(id).then((src) => {
      if (!src || !videoEl) return;
      videoEl.src = src;
      videoEl.muted = true;
      const thumb = media.querySelector('.slot-thumb');
      if (thumb) thumb.remove();
      const num = media.querySelector('.slot-number');
      if (num) num.style.display = 'none';
      if (isFirst && document.documentElement.classList.contains('entered')) {
        videoEl.play().catch(() => {});
      }
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
    let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
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
