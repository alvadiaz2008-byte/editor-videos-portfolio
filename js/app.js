// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// Project filters
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ---- Performance helpers ----
function pauseAllPageVideos() {
  document.querySelectorAll('video').forEach(v => {
    if (!v.closest('#modal')) {
      try { v.pause(); } catch (_) {}
    }
  });
}

function resumeVisibleVideos() {
  document.querySelectorAll('video[data-auto-play]').forEach(v => {
    if (v.dataset.shouldPlay === '1') {
      v.play().catch(() => {});
    }
  });
}

function observeVideoVisibility(video, rootEl) {
  if (!video || !rootEl) return;
  video.dataset.autoPlay = '1';
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !modalOpen) {
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
  // fallback: lightweight range check
  try {
    const r = await fetch(src, {
      method: 'GET',
      headers: { Range: 'bytes=0-1' }
    });
    return r.ok || r.status === 206;
  } catch (_) {
    return false;
  }
}

function videoCandidates(label) {
  return [
    `videos/${encodeURIComponent(`video ${label}.mp4`)}`,
    `videos/video ${label}.mp4`,
    `videos/video-${label}.mp4`,
    `videos/video${label}.mp4`
  ];
}

async function findVideo(label) {
  const candidates = videoCandidates(label);
  // parallel checks — faster load
  const checks = await Promise.all(
    candidates.map(async (src) => ((await urlExists(src)) ? src : null))
  );
  return checks.find(Boolean) || null;
}

async function findProjectVideos(id) {
  const found = [];
  const main = await findVideo(id);
  if (main) found.push(main);

  // check extras in parallel batches of 3
  for (let i = 1; i <= 8; i += 3) {
    const batch = [];
    for (let j = i; j < i + 3 && j <= 8; j++) {
      batch.push(findVideo(`${id}.${j}`));
    }
    const results = await Promise.all(batch);
    let stop = false;
    results.forEach((src) => {
      if (stop) return;
      if (src) found.push(src);
      else stop = true;
    });
    if (stop) break;
  }
  return found;
}

function thumbCandidates(num) {
  const label = String(num).padStart(2, '0');
  const bases = [
    `imagenes/${encodeURIComponent(`imagen ${label}`)}`,
    `imagenes/imagen ${label}`,
    `imagenes/imagen-${label}`,
    `imagenes/imagen${label}`
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

function loadVideos() {
  document.querySelectorAll('[data-video]').forEach((el) => {
    const num = String(el.dataset.video).padStart(2, '0');
    const isHero = el.classList.contains('hero-bg');

    if (isHero) {
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
      return;
    }

    const mediaBox = el.querySelector('.video-slot');
    if (!mediaBox) return;

    const videoEl = mediaBox.querySelector('.slot-video');
    if (videoEl) {
      videoEl.removeAttribute('src');
      videoEl.hidden = true;
      try {
        videoEl.load();
      } catch (_) {}
    }

    el.querySelectorAll(':scope > .slot-thumb').forEach((n) => n.remove());

    findThumbnail(num).then((thumb) => {
      if (!thumb) return;
      let img = mediaBox.querySelector('.slot-thumb');
      if (!img) {
        img = document.createElement('img');
        img.className = 'slot-thumb';
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        mediaBox.appendChild(img);
      }
      img.src = thumb;
      mediaBox.classList.add('has-thumb');
      const numberEl = mediaBox.querySelector('.slot-number');
      if (numberEl) numberEl.style.display = 'none';
    });
  });
}

loadVideos();

function loadBeforeAfter() {
  const beforeEl = document.getElementById('beforeImg');
  const afterEl = document.getElementById('afterImg');
  const slider = document.getElementById('baSlider');
  if (!beforeEl || !afterEl) return;

  const beforeNames = [
    'videos/antes.jpg',
    'videos/antes.png',
    'videos/antes.webp',
    'videos/before.jpg',
    'videos/before.png',
    'videos/before.webp',
    'videos/antes.mp4',
    'videos/before.mp4'
  ];
  const afterNames = [
    'videos/despues.jpg',
    'videos/despues.png',
    'videos/despues.webp',
    'videos/after.jpg',
    'videos/after.png',
    'videos/after.webp',
    'videos/despues.mp4',
    'videos/after.mp4'
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
        img.onload = () => {
          targetImg.src = src;
        };
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

let projectsData = [];
let modalOpen = false;

fetch('data/projects.json')
  .then((r) => r.json())
  .then((data) => {
    projectsData = data;
    data.forEach((p) => {
      const card = document.querySelector(`.project-card[data-video="${p.id}"]`);
      if (!card) return;
      const h3 = card.querySelector('h3');
      const pEl = card.querySelector('.card-info p');
      const cat = card.querySelector('.category');
      if (h3) h3.textContent = p.titulo;
      if (pEl)
        pEl.textContent =
          p.descripcion.split('\n')[0].slice(0, 90) +
          (p.descripcion.length > 90 ? '…' : '');
      if (cat) cat.textContent = p.categoria;
    });
  })
  .catch(() => {});

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

projectCards.forEach((card) => {
  card.addEventListener('click', async () => {
    const id = String(card.dataset.video).padStart(2, '0');
    const fromJson = projectsData.find((p) => p.id === id);

    const title = fromJson?.titulo || card.querySelector('h3')?.textContent || '';
    const desc =
      fromJson?.descripcion || card.querySelector('p')?.textContent || '';
    const cat =
      fromJson?.categoria || card.querySelector('.category')?.textContent || '';

    // pause background media while modal is open
    modalOpen = true;
    pauseAllPageVideos();

    modalBody.innerHTML = `
      <div class="modal-layout">
        <div class="modal-videos" id="modalVideos">
          <div class="modal-video-wrap" style="color:var(--muted);font-size:0.9rem;">Cargando…</div>
        </div>
        <div class="modal-info">
          <span class="category">${cat}</span>
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>
      </div>
    `;
    modal.hidden = false;

    const videos = await findProjectVideos(id);
    const container = document.getElementById('modalVideos');
    if (!container) return;

    if (videos.length === 0) {
      container.innerHTML = `<div class="modal-video-wrap" style="color:var(--muted);font-size:0.9rem;">Sin videos para este proyecto</div>`;
      return;
    }

    container.innerHTML = videos
      .map(
        (src, i) => `
      <div class="modal-video-wrap">
        <video
          src="${src}"
          controls
          playsinline
          preload="${i === 0 ? 'auto' : 'none'}"
          ${i === 0 ? 'autoplay' : ''}
        ></video>
      </div>`
      )
      .join('');
  });
});

function closeModal() {
  modalOpen = false;
  modal.hidden = true;
  modalBody.querySelectorAll('video').forEach((v) => {
    v.pause();
    v.removeAttribute('src');
    try {
      v.load();
    } catch (_) {}
  });
  modalBody.innerHTML = '';
  resumeVisibleVideos();
}

if (modalClose) modalClose.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Before/After slider
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
    baHandle.style.left = `${percent}%`;
    baAfter.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
  };

  baHandle.addEventListener('mousedown', () => (isDragging = true));
  baHandle.addEventListener('touchstart', () => (isDragging = true), {
    passive: true
  });
  window.addEventListener('mouseup', () => (isDragging = false));
  window.addEventListener('touchend', () => (isDragging = false));
  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateSlider(e.clientX);
  });
  window.addEventListener(
    'touchmove',
    (e) => {
      if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
    },
    { passive: true }
  );
  baSlider.addEventListener('click', (e) => updateSlider(e.clientX));
}
