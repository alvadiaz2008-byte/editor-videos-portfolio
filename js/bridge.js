(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.hero-ctas .btn-primary');
  var hero = document.getElementById('inicio');
  var sitio = document.getElementById('sitio');
  if (!btn || !hero || !sitio) return;

  root.classList.add('locked');
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  sitio.scrollTop = 0;

  function blockScroll(e) {
    if (root.classList.contains('locked')) e.preventDefault();
  }
  window.addEventListener('wheel', blockScroll, { passive: false });
  window.addEventListener('touchmove', blockScroll, { passive: false });
  window.addEventListener('keydown', function (e) {
    if (!root.classList.contains('locked')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].indexOf(e.key) !== -1) e.preventDefault();
  });

  function copyEls() {
    return hero.querySelectorAll('.hero-content h1, .hero-content .subtitle');
  }

  function resetCopy() {
    copyEls().forEach(function (el) {
      el.style.transition = 'none';
      el.style.transform = '';
      el.style.animation = '';
    });
    hero.style.zIndex = '';
    hero.classList.remove('bridge-lift');
    requestAnimationFrame(function () {
      copyEls().forEach(function (el) { el.style.transition = ''; });
    });
  }

  function showHero() {
    resetCopy();
    document.body.classList.remove('bridging');
    root.classList.remove('entered', 'opening');
    root.classList.add('locked');
    sitio.scrollTop = 0;
    var video = hero.querySelector('video');
    if (video && video.getAttribute('src')) video.play().catch(function () {});
  }

  function openProjects(thenId) {
    if (document.body.classList.contains('bridging')) return;
    if (root.classList.contains('entered')) {
      if (thenId) {
        var el = document.getElementById(thenId);
        if (el) sitio.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      }
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.remove('locked');
      root.classList.add('entered');
      window.dispatchEvent(new Event('projects-enter'));
      if (thenId) {
        var jump = document.getElementById(thenId);
        if (jump) sitio.scrollTop = jump.offsetTop;
      }
      return;
    }

    var title = sitio.querySelector('.projects-head h2');
    var hint = sitio.querySelector('.projects-hint');
    var view = sitio.querySelector('.projects-viewport');
    var from = btn.getBoundingClientRect();

    document.body.classList.add('bridging');
    root.classList.add('opening');
    hero.style.zIndex = '130';
    sitio.scrollTop = 0;

    copyEls().forEach(function (el) {
      el.style.animation = 'none';
      el.style.transition = 'none';
      el.style.transform = 'translateY(0px)';
    });
    void hero.offsetWidth;

    [title, hint, view].forEach(function (el) {
      if (el) el.classList.add('assembling');
    });

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
      copyEls().forEach(function (el) {
        el.style.transition = 'transform 1.7s cubic-bezier(.77,0,.18,1)';
        el.style.transform = 'translateY(-120vh)';
      });
      requestAnimationFrame(function () {
        ghost.style.transition = 'left ' + move + ', top ' + move + ', width ' + move + ', height ' + move + ', border-radius 1.5s cubic-bezier(.77,0,.18,1), background 1.1s ease, color .9s ease, font-size 1.4s cubic-bezier(.77,0,.18,1), padding 1.2s ease, box-shadow .8s ease, opacity .55s ease, letter-spacing 1.2s ease';
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
      root.classList.add('entered');
      root.classList.remove('locked');
      window.dispatchEvent(new Event('projects-enter'));
      var video = hero.querySelector('video');
      if (video) video.pause();
      if (thenId && thenId !== 'proyectos') {
        var dest = document.getElementById(thenId);
        if (dest) sitio.scrollTop = dest.offsetTop;
      }
    }, 1750);

    setTimeout(function () {
      document.body.classList.remove('bridging');
      resetCopy();
      btn.style.visibility = '';
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      [title, hint, view].forEach(function (el) {
        if (el) el.classList.remove('assembling', 'assemble');
      });
    }, 3100);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href === '#inicio') {
      e.preventDefault();
      showHero();
      return;
    }
    if (href.charAt(0) !== '#') return;
    e.preventDefault();
    openProjects(href.slice(1));
  });
})();
