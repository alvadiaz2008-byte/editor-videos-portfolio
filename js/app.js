// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
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

// Auto-load videos from /videos/ folder
// Naming: "video 01.mp4", "video 02.mp4", etc.
function loadVideos() {
  const slots = document.querySelectorAll('[data-video]');

  slots.forEach(slot => {
    const num = String(slot.dataset.video).padStart(2, '0');
    const videoEl = slot.querySelector('.slot-video, .hero-video');
    if (!videoEl) return;

    const candidates = [
      `videos/${encodeURIComponent(`video ${num}.mp4`)}`,
      `videos/${encodeURIComponent(`video ${num}.webm`)}`,
      `videos/video-${num}.mp4`,
      `videos/video${num}.mp4`,
      `videos/video ${num}.mp4`
    ];

    let loaded = false;

    const tryNext = (index) => {
      if (index >= candidates.length || loaded) return;

      const src = candidates[index];
      const testVideo = document.createElement('video');
      testVideo.preload = 'metadata';

      const onSuccess = () => {
        if (loaded) return;
        loaded = true;
        videoEl.src = src;
        videoEl.hidden = false;
        slot.classList.add('has-video');
        const numberEl = slot.querySelector('.slot-number');
        if (numberEl) numberEl.style.display = 'none';
        // Autoplay hero background
        if (videoEl.classList.contains('hero-video')) {
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        }
      };

      testVideo.addEventListener('loadeddata', onSuccess);
      testVideo.addEventListener('canplay', onSuccess);

      testVideo.onerror = () => {
        tryNext(index + 1);
      };

      testVideo.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
    };

    tryNext(0);
  });
}

loadVideos();

// Modal for projects
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

projectCards.forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.querySelector('p')?.textContent || '';
    const cat = card.querySelector('.category')?.textContent || '';
    const videoNum = card.dataset.video;
    const videoSrc = card.querySelector('.slot-video')?.src || '';

    let videoHtml = `<div style="aspect-ratio:16/9;background:#17171a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--muted);">Video ${videoNum} no disponible</div>`;

    if (videoSrc) {
      videoHtml = `<video src="${videoSrc}" controls autoplay style="width:100%;border-radius:8px;"></video>`;
    }

    modalBody.innerHTML = `
      <span class="category">${cat}</span>
      <h3 style="margin:0.5rem 0 1rem;font-size:1.4rem;">${title}</h3>
      <p style="color:var(--muted);margin-bottom:1.5rem;">${desc}</p>
      ${videoHtml}
    `;
    modal.hidden = false;
  });
});

if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.hidden = true;
    modalBody.querySelector('video')?.pause();
  });
}

modal?.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.hidden = true;
    modalBody.querySelector('video')?.pause();
  }
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

  baHandle.addEventListener('mousedown', () => isDragging = true);
  baHandle.addEventListener('touchstart', () => isDragging = true, { passive: true });

  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('touchend', () => isDragging = false);

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateSlider(e.clientX);
  });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
  }, { passive: true });

  baSlider.addEventListener('click', (e) => updateSlider(e.clientX));
}