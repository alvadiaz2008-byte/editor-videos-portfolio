(function () {
  var btn = document.querySelector('.hero-ctas .btn-primary');
  var hero = document.getElementById('inicio');
  if (!btn || !hero) return;

  btn.addEventListener('click', function (e) {
    var stage = document.getElementById('proyectos');
    if (!stage) return;
    e.preventDefault();

    if (document.body.classList.contains('bridging')) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.scrollIntoView();
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

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ghost.style.transition = 'left 1.05s cubic-bezier(.77,0,.18,1), top 1.05s cubic-bezier(.77,0,.18,1), width 1.05s cubic-bezier(.77,0,.18,1), height 1.05s cubic-bezier(.77,0,.18,1), border-radius 1s cubic-bezier(.77,0,.18,1), background .7s ease, color .55s ease, font-size .9s cubic-bezier(.77,0,.18,1), padding .8s ease, box-shadow .5s ease, opacity .45s ease, letter-spacing .8s ease';
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
      ghost.textContent = 'Mis Proyectos';
    }, 460);

    setTimeout(function () {
      [title, hint, view].forEach(function (el) {
        if (!el) return;
        el.classList.remove('assembling');
        el.classList.add('assemble');
      });
      ghost.style.opacity = '0';
      hero.classList.add('bridge-fade');
    }, 1080);

    setTimeout(function () {
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      hero.classList.remove('is-bridge', 'bridge-fade');
      document.body.classList.remove('bridging');
      btn.style.visibility = '';
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      window.scrollTo(0, stage.offsetTop);
      [title, hint, view].forEach(function (el) {
        if (!el) return;
        el.classList.remove('assembling', 'assemble');
      });
    }, 2000);
  });
})();
