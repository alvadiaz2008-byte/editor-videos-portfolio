function showHero() {
    var bits = hero.querySelectorAll('h1, .subtitle');
    bits.forEach(function (el) { el.style.transition = 'none'; });
    hero.classList.remove('bridge-lift');
    document.body.classList.remove('bridging');
    root.classList.remove('entered', 'opening');
    root.classList.add('locked');
    sitio.scrollTop = 0;
    requestAnimationFrame(function () {
      bits.forEach(function (el) { el.style.transition = ''; });
    });
    var video = hero.querySelector('video');
    if (video && video.getAttribute('src')) video.play().catch(function () {});
  }