(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.hero-ctas .btn-primary');
  var hero = document.getElementById('inicio');
  if (!btn || !hero) return;

  root.classList.add('locked');
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  function blockScroll(e) {
    if (root.classList.contains('locked')) e.preventDefault();
  }
  window.addEventListener('wheel', blockScroll, { passive: false });
  window.addEventListener('touchmove', blockScroll, { passive: false });
  window.addEventListener('keydown', function (e) {
    if (!root.classList.contains('locked')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  });

  function openProjects() {
    var stage = document.getElementById('proyectos');
    if (!stage || document.body.classList.contains('bridging') || root.classList.contains('entered')) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.remove('locked');
      root.classList.add('entered');
      window.scrollTo(0, stage.offsetTop);
      return;
    }

    var title = stage.querySelector('.projects-head h2');
    var hint = stage.querySelector('.projects-hint');
    var view = stage.querySelector('.projects-viewport');
    var from = btn.getBoundingClientRect();
    var heroH = hero.offsetHeight;

    var placeholder = document.createElement('div');
    placeholder.style.height = heroH + 'px';
    hero.parentNode.insertBefore(placeholder, hero);

    hero.classList.add('is-bridge');
    document.body.classList.add('bridging');
    root.classList.add('opening');
    root.classList.remove('locked');

    [title, hint, view].forEach(function (el) {
      if (el) el.classList.add('assembling');
    });

    window.scrollTo(0, stage.offsetTop);

    var to = title.getBoundingClientRect();
    var ghost = btn.cloneNode(true);
    ghost.className = 'btn btn-primary bridge-ghost';
    ghost.style.transition = 'none';
    ghost.style.left = from.left + 'px';
    ghost.style.top = from.top + 'px';
    ghost.style.width = from.width + 'px';
    ghost.style.height = from.height + 'px';
    document.body.appendChild(ghost);
    btn.style.visibility = 'hidden';

    var move = '1.7s cubic-bezier(.77,0,.18,1)';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ghost.style.transition = 'left ' + move + ', top ' + move + ', width ' + move + ', height ' + move + ', border-radius 1.5s cubic-bezier(.77,0,.18,1), background 1.1s ease, color .9s ease, font-size 1.4s cubic-bezier(.77,0,.18,1), padding 1.2s ease, box-shadow .8s ease, opacity .6s ease, letter-spacing 1.2s ease';
        ghost.style.left = to.left + 'px';
        ghost.style.top = to.top + 'px';
        ghost.style.width = Math.max(to.width, 160) + 'px';
        ghost.style.height = to.height + 'px';
        ghost.style.borderRadius = '0px';
        ghost.style.background = 'transparent';
        ghost.style.color = '#f3f1ec';
        ghost.style.boxShadow = 'none';
        ghost.style.padding = '0px';
        ghost.style.fontSize = getComputedStyle(title).fontSize;
        ghost.style.fontWeight = '600';
        ghost.style.letterSpacing = '-0.3px';
        ghost.style.justifyContent = 'flex-start';
        ghost.style.textAlign = 'left';
      });
    });

    setTimeout(function () {
      [title, hint, view].forEach(function (el) {
        if (!el) return;
        el.classList.remove('assembling');
        el.classList.add('assemble');
      });
      ghost.style.opacity = '0';
      hero.classList.add('bridge-fade');
    }, 1750);

    setTimeout(function () {
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      hero.classList.remove('is-bridge', 'bridge-fade');
      document.body.classList.remove('bridging');
      btn.style.visibility = '';
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      root.classList.add('entered');
      root.classList.remove('opening');
      window.scrollTo(0, stage.offsetTop);
      [title, hint, view].forEach(function (el) {
        if (!el) return;
        el.classList.remove('assembling', 'assemble');
      });
    }, 3100);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link || root.classList.contains('entered')) return;
    var href = link.getAttribute('href');
    if (href === '#proyectos') {
      e.preventDefault();
      openProjects();
      return;
    }
    if (href !== '#inicio') e.preventDefault();
  });
})();
