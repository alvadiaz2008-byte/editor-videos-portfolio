(function () {
  var style = document.createElement('style');
  style.textContent = [
    '#proyectos .slide-media{cursor:pointer}',
    '.video-lightbox{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:4vh 4vw;background:rgba(0,0,0,.9)}',
    '.video-lightbox[hidden]{display:none}',
    '.video-lightbox-frame{position:relative;height:min(92vh,92dvh);width:auto;max-width:92vw;aspect-ratio:9/16;border-radius:16px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.28)}',
    '.video-lightbox-player{width:100%;height:100%;object-fit:contain;background:#000;display:block}',
    '.video-lightbox-frame::after{content:"";position:absolute;inset:0;z-index:2;border-radius:inherit;padding:1px;background:linear-gradient(155deg,rgba(255,255,255,.75),rgba(255,255,255,.1) 36%,rgba(255,255,255,.04) 64%,rgba(255,255,255,.4));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;pointer-events:none}',
    '.video-lightbox-close{position:absolute;top:1rem;right:1rem;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:1.7rem;line-height:1;cursor:pointer}',
    '.video-lightbox-close:hover{background:rgba(255,255,255,.22)}',
    'html.lightbox-open,html.lightbox-open body{overflow:hidden}',
    'html.lightbox-open #sitio{overflow:hidden}',
    '.glass-field{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none}',
    '.glass-field-site{position:fixed;z-index:0}',
    '.site-panel>section,.site-panel>footer{position:relative;z-index:1}',
    '.projects-stage{background:transparent}',
    '.glass-bit{position:absolute;display:block;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.34),rgba(255,255,255,.07) 34%,rgba(255,255,255,.03) 58%,rgba(0,0,0,.15) 100%);border:1px solid rgba(255,255,255,.34);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset -16px -22px 36px rgba(0,0,0,.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:glassFloat 22s ease-in-out infinite}',
    '.g1{width:min(680px,62vw);height:min(680px,62vw);right:-22vw;top:-18vw}',
    '.g2{width:min(560px,52vw);height:min(560px,52vw);left:-20vw;bottom:-18vw;animation-duration:26s;animation-delay:-6s}',
    '.g3{width:min(320px,30vw);height:min(320px,30vw);right:-8vw;bottom:6%;animation-duration:18s;animation-delay:-4s}',
    '.g4{width:min(520px,48vw);height:min(760px,78vh);right:-10vw;top:14%;border-radius:48px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 30px 70px rgba(0,0,0,.25);animation:glassTilt 24s ease-in-out infinite}',
    '.g5{width:min(180px,18vw);height:min(180px,18vw);left:5%;top:10%;animation-duration:16s;animation-delay:-8s}',
    '.g6{display:none}',
    '.g7{width:min(520px,48vw);height:min(520px,48vw);left:-18vw;top:6%}',
    '.g8{width:min(440px,40vw);height:min(440px,40vw);right:-16vw;bottom:4%;animation-duration:20s;animation-delay:-5s}',
    '.g9{width:min(260px,24vw);height:min(260px,24vw);right:10%;top:-8%;animation-duration:17s;animation-delay:-3s}',
    '.g10{width:min(420px,46vw);height:min(640px,70vh);left:-16vw;top:22%;border-radius:46px;background:rgba(255,255,255,.04);box-shadow:inset 0 1px 0 rgba(255,255,255,.45);animation:glassTilt 26s ease-in-out infinite}',
    '@keyframes glassFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(12px,-18px,0)}}',
    '@keyframes glassTilt{0%,100%{transform:translate3d(0,0,0) rotate(-16deg)}50%{transform:translate3d(-10px,-16px,0) rotate(-12deg)}}',
    '@media (prefers-reduced-motion:reduce){.glass-bit{animation:none}}'
  ].join('');
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'video-lightbox';
  overlay.hidden = true;
  overlay.innerHTML = '<button type="button" class="video-lightbox-close" aria-label="Cerrar">\u00d7</button><div class="video-lightbox-frame"><video class="video-lightbox-player" controls playsinline autoplay loop></video></div>';
  document.body.appendChild(overlay);

  var player = overlay.querySelector('video');
  var closeBtn = overlay.querySelector('button');
  var sourceVid = null;

  function playNow(video, withSound) {
    if (!video) return;
    video.muted = !withSound;
    if (withSound) video.volume = 1;
    var pending = video.play();
    if (pending && pending.catch) pending.catch(function () {
      if (!withSound) return;
      video.muted = true;
      var retry = video.play();
      if (retry && retry.then) {
        retry.then(function () { video.muted = false; }).catch(function () {});
      }
    });
  }

  function closeLightbox() {
    var back = sourceVid;
    sourceVid = null;
    player.pause();
    player.removeAttribute('src');
    player.load();
    overlay.hidden = true;
    document.documentElement.classList.remove('lightbox-open');
    if (back && back.getAttribute('src')) {
      back.muted = true;
      playNow(back, false);
    }
  }

  function openLightbox(src, fromVid) {
    sourceVid = fromVid || null;
    if (sourceVid) sourceVid.pause();
    player.loop = true;
    player.muted = false;
    player.volume = 1;
    if (player.getAttribute('src') !== src) player.src = src;
    try { player.currentTime = 0; } catch (err) {}
    overlay.hidden = false;
    document.documentElement.classList.add('lightbox-open');
    playNow(player, true);
    player.addEventListener('canplay', function once() {
      if (!overlay.hidden) playNow(player, true);
    }, { once: true });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.video-lightbox-close')) return;
    var media = e.target.closest ? e.target.closest('#proyectos .slide-media') : null;
    if (!media) return;
    var vid = media.querySelector('video');
    var src = vid && (vid.currentSrc || vid.getAttribute('src'));
    if (!src) return;
    e.preventDefault();
    e.stopPropagation();
    openLightbox(src, vid);
  });

  document.addEventListener('play', function (e) {
    var node = e.target;
    if (!document.documentElement.classList.contains('lightbox-open')) return;
    if (node && node.classList && node.classList.contains('slide-vid')) node.pause();
  }, true);

  closeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeLightbox();
  });
})();
