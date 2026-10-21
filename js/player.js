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
    '.glass-bit{position:absolute;display:block;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 16px 40px rgba(0,0,0,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:glassFloat 18s ease-in-out infinite}',
    '.g1{width:170px;height:230px;left:7%;top:16%;border-radius:34px}',
    '.g2{width:86px;height:86px;right:11%;top:20%;border-radius:50%;animation-duration:14s;animation-delay:-4s}',
    '.g3{width:150px;height:64px;left:14%;bottom:14%;border-radius:24px;animation-duration:21s;animation-delay:-8s}',
    '.g4{width:58px;height:58px;right:20%;bottom:22%;border-radius:16px;animation-duration:13s;animation-delay:-2s}',
    '.g5{width:210px;height:110px;right:-48px;top:40%;border-radius:40px;animation-duration:23s}',
    '.g6{width:42px;height:42px;left:44%;top:11%;border-radius:50%;animation-duration:12s;animation-delay:-6s}',
    '.g7{width:120px;height:160px;left:4%;top:18%;border-radius:30px;animation-duration:19s}',
    '.g8{width:72px;height:72px;right:8%;top:30%;border-radius:50%;animation-duration:15s;animation-delay:-5s}',
    '.g9{width:180px;height:78px;right:6%;bottom:12%;border-radius:28px;animation-duration:22s;animation-delay:-3s}',
    '.g10{width:48px;height:48px;left:38%;bottom:20%;border-radius:14px;animation-duration:13s;animation-delay:-7s}',
    '@keyframes glassFloat{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(14px,-24px,0) rotate(7deg)}}',
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
