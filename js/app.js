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

// Modal for projects
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

projectCards.forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.querySelector('p')?.textContent || '';
    const cat = card.querySelector('.category')?.textContent || '';

    modalBody.innerHTML = `
      <span class="category">${cat}</span>
      <h3 style="margin:0.5rem 0 1rem;font-size:1.4rem;">${title}</h3>
      <p style="color:var(--muted);margin-bottom:1.5rem;">${desc}</p>
      <div style="aspect-ratio:16/9;background:#17171a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--muted);">
        Reproductor de video próximamente
      </div>
    `;
    modal.hidden = false;
  });
});

if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.hidden = true;
  });
}

modal?.addEventListener('click', (e) => {
  if (e.target === modal) modal.hidden = true;
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

  baSlider.addEventListener('click', (e) => {
    updateSlider(e.clientX);
  });
}