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
    '.glass-field{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;contain:paint}',
    '.glass-bit{position:absolute;inset:0;width:auto;height:auto;border:0;border-radius:0;background:rgba(255,255,255,.07);box-shadow:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
    '.g1{clip-path:polygon(3.7% 9.6%,2.9% 6.7%,2.7% 4.4%,3.2% 2.8%,4.4% 1.8%,6.2% 1.4%,70% .8%,73% 1.2%,74.7% 2.3%,75.1% 4.2%,74.1% 6.9%,71.7% 10.4%,27.9% 67%,26.9% 68%,26% 68.3%,25.1% 68%,24.3% 67.1%,23.6% 65.5%);animation:glassInT 1.7s cubic-bezier(.77,0,.18,1) both}',
    '.g2{clip-path:polygon(87.9% 2%,88.3% 1.5%,88.7% 1.2%,89.1% 1%,89.5% .9%,90% .9%,96.4% 1.8%,97.4% 2.1%,98.2% 2.9%,98.7% 3.9%,99% 5.4%,99.1% 7.2%,98.2% 85.8%,97.9% 90.3%,97.2% 92.9%,96.2% 93.6%,94.8% 92.3%,92.9% 89.2%,67.3% 37.8%,66.7% 36.2%,66.4% 34.6%,66.4% 33%,66.9% 31.5%,67.7% 30.1%);animation:glassInR 1.7s cubic-bezier(.77,0,.18,1) .08s both}',
    '.g3{clip-path:polygon(39.6% 99.7%,39% 99.6%,38.5% 99.4%,38% 99%,37.6% 98.4%,37.2% 97.6%,31.7% 85.1%,31.2% 83.4%,31% 81.8%,31.1% 80.3%,31.5% 78.9%,32.3% 77.6%,56.8% 44.6%,57.7% 43.6%,58.5% 43.2%,59.4% 43.4%,60.2% 44.1%,60.9% 45.5%,77.9% 83.5%,78.5% 85.2%,78.7% 86.8%,78.6% 88.4%,78.1% 89.8%,77.3% 91.2%,71.4% 98.7%,71.1% 99.1%,70.7% 99.3%,70.4% 99.5%,70% 99.7%,69.6% 99.7%);animation:glassInB 1.7s cubic-bezier(.77,0,.18,1) .12s both}',
    '.g4{clip-path:polygon(.6% 56.8%,.7% 55.6%,.8% 54.6%,1.1% 53.7%,1.5% 52.9%,2% 52.2%,4.8% 49.1%,5.7% 48.3%,6.6% 48%,7.4% 48.3%,8.2% 49.2%,8.8% 50.5%,24.7% 90.5%,25.6% 93.6%,25.9% 95.9%,25.4% 97.6%,24.1% 98.6%,22.2% 98.9%,3.8% 98.7%,2.8% 98.5%,2% 97.9%,1.4% 96.8%,1% 95.3%,.9% 93.5%);animation:glassInL 1.7s cubic-bezier(.77,0,.18,1) .16s both}',
    '.g5,.g6{display:none}',
    '@keyframes glassInT{from{transform:translate3d(0,-110%,0)}to{transform:none}}',
    '@keyframes glassInR{from{transform:translate3d(110%,0,0)}to{transform:none}}',
    '@keyframes glassInB{from{transform:translate3d(0,110%,0)}to{transform:none}}',
    '@keyframes glassInL{from{transform:translate3d(-110%,0,0)}to{transform:none}}',
    '@media (prefers-reduced-motion:reduce){.glass-bit{animation:none;backdrop-filter:none;-webkit-backdrop-filter:none}}'
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
