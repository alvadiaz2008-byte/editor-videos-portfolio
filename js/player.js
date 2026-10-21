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
    '.glass-bit{position:absolute;display:block;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.34),rgba(255,255,255,.07) 34%,rgba(255,255,255,.03) 58%,rgba(0,0,0,.15) 100%);border:1px solid rgba(255,255,255,.34);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset -16px -22px 36px rgba(0,0,0,.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}',
    '.g1{width:min(520px,48vw);height:min(520px,48vw);right:10%;top:6%;animation:glassInTR 1.7s cubic-bezier(.77,0,.18,1) both,glassFloat 22s ease-in-out 1.7s infinite}',
    '.g2{width:min(440px,42vw);height:min(440px,42vw);left:8%;bottom:8%;animation:glassInBL 1.7s cubic-bezier(.77,0,.18,1) .12s both,glassFloat 24s ease-in-out 1.82s infinite}',
    '.g3{width:min(220px,22vw);height:min(220px,22vw);right:24%;bottom:16%;animation:glassInR 1.7s cubic-bezier(.77,0,.18,1) .2s both,glassFloat 18s ease-in-out 1.9s infinite}',
    '.g4{width:min(340px,34vw);height:min(560px,62vh);left:30%;top:18%;border-radius:46px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 30px 70px rgba(0,0,0,.25);animation:glassInPanel 1.7s cubic-bezier(.77,0,.18,1) .06s both,glassTilt 26s ease-in-out 1.76s infinite}',
    '.g5{width:min(150px,16vw);height:min(150px,16vw);left:22%;top:16%;animation:glassInT 1.7s cubic-bezier(.77,0,.18,1) .16s both,glassFloat 16s ease-in-out 1.86s infinite}',
    '@keyframes glassInTR{from{transform:translate3d(80vw,-70vh,0)}to{transform:none}}',
    '@keyframes glassInBL{from{transform:translate3d(-80vw,70vh,0)}to{transform:none}}',
    '@keyframes glassInR{from{transform:translate3d(90vw,20vh,0)}to{transform:none}}',
    '@keyframes glassInT{from{transform:translate3d(-20vw,-80vh,0)}to{transform:none}}',
    '@keyframes glassInPanel{from{transform:translate3d(90vw,30vh,0) rotate(-16deg)}to{transform:rotate(-16deg)}}',
    '@keyframes glassFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(10px,-14px,0)}}',
    '@keyframes glassTilt{0%,100%{transform:translate3d(0,0,0) rotate(-16deg)}50%{transform:translate3d(-8px,-12px,0) rotate(-12deg)}}',
    '@media (prefers-reduced-motion:reduce){.glass-bit{animation:none}.g4{transform:rotate(-16deg)}}'
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
