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
    '.glass-bit{position:absolute;display:block;border-radius:28px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.3);box-shadow:inset 0 1px 0 rgba(255,255,255,.5);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}',
    '.g1{width:min(190px,17vw);height:min(400px,46vh);left:5%;top:24%;animation:glassInL 1.7s cubic-bezier(.77,0,.18,1) both}',
    '.g2{width:min(280px,24vw);height:min(140px,16vh);right:6%;top:11%;animation:glassInTR 1.7s cubic-bezier(.77,0,.18,1) .08s both}',
    '.g3{width:min(170px,15vw);height:min(230px,26vh);right:6%;bottom:13%;animation:glassInR 1.7s cubic-bezier(.77,0,.18,1) .16s both}',
    '.g4{width:min(250px,22vw);height:min(120px,14vh);left:5%;bottom:13%;border-radius:24px;animation:glassInB 1.7s cubic-bezier(.77,0,.18,1) .12s both}',
    '.g5{width:min(148px,13vw);height:min(148px,13vw);left:27%;top:10%;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.32),rgba(255,255,255,.06) 42%,rgba(255,255,255,.03) 70%);animation:glassInT 1.7s cubic-bezier(.77,0,.18,1) .1s both}',
    '.g6{width:min(168px,15vw);height:min(168px,15vw);right:26%;top:40%;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.32),rgba(255,255,255,.06) 42%,rgba(255,255,255,.03) 70%);animation:glassInR 1.7s cubic-bezier(.77,0,.18,1) .2s both}',
    '@keyframes glassInL{from{transform:translate3d(-110%,0,0)}to{transform:none}}',
    '@keyframes glassInTR{from{transform:translate3d(70vw,-60vh,0)}to{transform:none}}',
    '@keyframes glassInR{from{transform:translate3d(80vw,0,0)}to{transform:none}}',
    '@keyframes glassInB{from{transform:translate3d(0,70vh,0)}to{transform:none}}',
    '@keyframes glassInT{from{transform:translate3d(0,-80vh,0)}to{transform:none}}',
    '@media (max-width:768px){.g1{width:28vw;height:16vh;left:4%;top:12%}.g2{width:32vw;height:11vh;right:4%;top:11%}.g3{width:24vw;height:14vh;right:4%;bottom:10%}.g4{width:30vw;height:10vh;left:4%;bottom:10%}.g5{width:16vw;height:16vw;left:30%;top:9%}.g6{width:15vw;height:15vw;right:22%;top:46%}}',
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
