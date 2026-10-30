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

  function cleanUrl() {
    return location.pathname + location.search;
  }

  function pushSite(id) {
    id = id || 'proyectos';
    var s = history.state || { i: 0 };
    if (s.screen === 'site' && s.section === id && !s.lightbox) return;
    history.pushState({ screen: 'site', section: id, i: (s.i || 0) + 1 }, '', cleanUrl() + '#' + id);
  }

  function showHero() {
    if (!root.classList.contains('entered') && !root.classList.contains('opening')) return;
    resetCopy();
    document.body.classList.remove('bridging');
    root.classList.remove('entered', 'opening', 'move-in');
    root.classList.add('locked');
    sitio.scrollTop = 0;
    window.scrollTo(0, 0);
    var video = hero.querySelector('video');
    if (video && video.getAttribute('src')) video.play().catch(function () {});
  }

  function openProjects(thenId, fromPop) {
    thenId = thenId || 'proyectos';
    if (document.body.classList.contains('bridging') && !fromPop) return;
    if (!fromPop) pushSite(thenId);

    if (root.classList.contains('entered')) {
      if (thenId) {
        var el = document.getElementById(thenId);
        if (el) sitio.scrollTo({ top: el.offsetTop, behavior: fromPop ? 'auto' : 'smooth' });
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
    var from = btn.getBoundingClientRect();

    document.body.classList.add('bridging');
    root.classList.add('opening');
    hero.style.zIndex = '120';
    sitio.scrollTop = 0;

    copyEls().forEach(function (el) {
      el.style.animation = 'none';
      el.style.transition = 'none';
      el.style.transform = 'translateY(0px)';
    });
    void hero.offsetWidth;

    if (hint) hint.classList.add('assembling');
    if (title) {
      title.classList.add('assembling');
      title.style.transition = 'none';
      title.style.opacity = '0';
    }

    var to = title.getBoundingClientRect();
    var ghost = btn.cloneNode(true);
    ghost.className = 'btn btn-primary bridge-ghost';
    ghost.style.transition = 'none';
    ghost.style.left = from.left + 'px';
    ghost.style.top = from.top + 'px';
    ghost.style.width = from.width + 'px';
    ghost.style.height = from.height + 'px';
    ghost.style.opacity = '1';
    document.body.appendChild(ghost);
    btn.style.visibility = 'hidden';

    var move = '1.7s cubic-bezier(.77,0,.18,1)';
    requestAnimationFrame(function () {
      root.classList.add('move-in');
      copyEls().forEach(function (el) {
        el.style.transition = move;
        el.style.transitionProperty = 'transform';
        el.style.transform = 'translateY(-120vh)';
      });
      ghost.style.transition = 'left ' + move + ', top ' + move + ', width ' + move + ', height ' + move + ', border-radius ' + move + ', background ' + move + ', color ' + move + ', font-size ' + move + ', padding ' + move + ', box-shadow ' + move + ', letter-spacing ' + move;
      ghost.style.left = to.left + 'px';
      ghost.style.top = to.top + 'px';
      ghost.style.width = Math.max(to.width, 160) + 'px';
      ghost.style.height = to.height + 'px';
      ghost.style.borderRadius = '0px';
      ghost.style.background = 'transparent';
      ghost.style.color = '#f3f1ec';
      ghost.style.boxShadow = 'none';
      ghost.style.padding = '0px';
      var titleStyle = getComputedStyle(title);
      ghost.style.fontSize = titleStyle.fontSize;
      ghost.style.fontFamily = titleStyle.fontFamily;
      ghost.style.fontWeight = titleStyle.fontWeight;
      ghost.style.letterSpacing = titleStyle.letterSpacing;
      ghost.style.justifyContent = 'flex-start';
      ghost.style.textAlign = 'left';
    });

    setTimeout(function () {
      if (title) {
        title.classList.remove('assembling', 'assemble');
        title.style.transition = 'none';
        title.style.opacity = '1';
      }
      if (hint) {
        hint.classList.remove('assembling');
        hint.classList.add('assemble');
      }
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      root.classList.add('entered');
      root.classList.remove('locked');
      window.dispatchEvent(new Event('projects-enter'));
      var video = hero.querySelector('video');
      if (video) video.pause();
      if (thenId && thenId !== 'proyectos') {
        var dest = document.getElementById(thenId);
        if (dest) sitio.scrollTop = dest.offsetTop;
      }
    }, 1700);

    setTimeout(function () {
      document.body.classList.remove('bridging');
      root.classList.remove('move-in');
      resetCopy();
      btn.style.visibility = '';
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      if (hint) hint.classList.remove('assembling', 'assemble');
      if (title) title.classList.remove('assembling', 'assemble');
    }, 2300);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href === '#inicio') {
      e.preventDefault();
      var depth = (history.state && history.state.i) || 0;
      if (depth > 0) history.go(-depth);
      else showHero();
      return;
    }
    if (href.charAt(0) !== '#') return;
    e.preventDefault();
    openProjects(href.slice(1));
  });

  window.addEventListener('popstate', function (e) {
    var s = e.state || { screen: 'hero' };
    if (s.lightbox) return;
    if (s.screen === 'site') openProjects(s.section || 'proyectos', true);
    else showHero();
  });

  var start = (location.hash || '').replace(/^#/, '');
  if (start && start !== 'inicio') {
    history.replaceState({ screen: 'site', section: start, i: 0 }, '', cleanUrl() + '#' + start);
    openProjects(start, true);
  } else {
    history.replaceState({ screen: 'hero', i: 0 }, '', cleanUrl());
  }
})();
