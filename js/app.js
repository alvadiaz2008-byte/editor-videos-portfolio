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

// Probe if a video URL exists
function probeVideo(src) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    const done = (ok) => {
      v.onloadeddata = null;
      v.onerror = null;
      resolve(ok ? src : null);
    };
    v.onloadeddata = () => done(true);
    v.onerror = () => done(false);
    v.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
  });
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
  for (const src of videoCandidates(label)) {
    const found = await probeVideo(src);
    if (found) return found;
  }
  return null;
}

// Main + extra videos for a project id (e.g. "02" → 02, 02.1, 02.2 ...)
async function findProjectVideos(id) {
  const found = [];
  const main = await findVideo(id);
  if (main) found.push(main);

  for (let i = 1; i <= 8; i++) {
    const extra = await findVideo(`${id}.${i}`);
    if (extra) found.push(extra);
    else break;
  }
  return found;
}

// Auto-load grid/hero videos
function loadVideos() {
  document.querySelectorAll('[data-video]').forEach(slot => {
    const num = String(slot.dataset.video).padStart(2, '0');
    const videoEl = slot.querySelector('.slot-video, .hero-video');
    if (!videoEl) return;

    findVideo(num).then(src => {
      if (!src) return;
      videoEl.src = src;
      videoEl.hidden = false;
      slot.classList.add('has-video');
      const numberEl = slot.querySelector('.slot-number');
      if (numberEl) numberEl.style.display = 'none';
      if (videoEl.classList.contains('hero-video')) {
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      }
    });
  });
}

loadVideos();

// Before / After
function loadBeforeAfter() {
  const beforeEl = document.getElementById('beforeImg');
  const afterEl = document.getElementById('afterImg');
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
        v.autoplay = true;
        v.onloadeddata = () => {
          targetImg.replaceWith(v);
          v.play().catch(() => {});
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

// Projects data from JSON
let projectsData = [];

fetch('data/projects.json')
  .then(r => r.json())
  .then(data => {
    projectsData = data;
    // Update card titles/descriptions from JSON if present
    data.forEach(p => {
      const card = document.querySelector(`.project-card[data-video="${p.id}"]`);
      if (!card) return;
      const h3 = card.querySelector('h3');
      const pEl = card.querySelector('.card-info p');
      const cat = card.querySelector('.category');
      if (h3) h3.textContent = p.titulo;
      if (pEl) pEl.textContent = p.descripcion.split('\n')[0].slice(0, 90) + (p.descripcion.length > 90 ? '…' : '');
      if (cat) cat.textContent = p.categoria;
    });
  })
  .catch(() => {});

// Modal
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

projectCards.forEach(card => {
  card.addEventListener('click', async () => {
    const id = String(card.dataset.video).padStart(2, '0');
    const fromJson = projectsData.find(p => p.id === id);

    const title = fromJson?.titulo || card.querySelector('h3')?.textContent || '';
    const desc = fromJson?.descripcion || card.querySelector('p')?.textContent || '';
    const cat = fromJson?.categoria || card.querySelector('.category')?.textContent || '';

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

    container.innerHTML = videos.map((src, i) =>
      `<div class="modal-video-wrap"><video src="${src}" controls ${i === 0 ? 'autoplay' : ''} playsinline></video></div>`
    ).join('');
  });
});

function closeModal() {
  modal.hidden = true;
  modalBody.querySelectorAll('video').forEach(v => v.pause());
}

if (modalClose) modalClose.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

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

  baHandle.addEventListener('mousedown', () => isDragging = true);
  baHandle.addEventListener('touchstart', () => isDragging = true, { passive: true });
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('touchend', () => isDragging = false);
  window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
  }, { passive: true });
  baSlider.addEventListener('click', (e) => updateSlider(e.clientX));
}
