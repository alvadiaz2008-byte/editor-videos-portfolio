(function () {
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  var tc = document.getElementById('timecode');
  if (tc && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var started = performance.now();
    var ticking = true;
    document.addEventListener('visibilitychange', function () { ticking = !document.hidden; });
    (function frame(now) {
      if (ticking) {
        var frames = Math.floor(((now - started) / 1000) * 24);
        var ff = frames % 24;
        var total = Math.floor(frames / 24);
        var ss = total % 60;
        var mm = Math.floor(total / 60) % 60;
        var hh = Math.floor(total / 3600);
        tc.textContent = [hh, mm, ss, ff].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
      }
      requestAnimationFrame(frame);
    })(started);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  async function urlExists(src) {
    try {
      var r = await fetch(src, { method: 'HEAD' });
      if (r.ok) return true;
    } catch (e) {}
    try {
      var ranged = await fetch(src, { method: 'GET', headers: { Range: 'bytes=0-1' } });
      return ranged.ok || ranged.status === 206;
    } catch (e2) {
      return false;
    }
  }

  function videoCandidates(label) {
    return [
      'videos/' + encodeURIComponent('video ' + label + '.mp4'),
      'videos/video ' + label + '.mp4',
      'videos/video-' + label + '.mp4',
      'videos/video' + label + '.mp4'
    ];
  }

  async function findVideo(label) {
    var candidates = videoCandidates(label);
    var checks = await Promise.all(candidates.map(async function (src) {
      return (await urlExists(src)) ? src : null;
    }));
    return checks.find(Boolean) || null;
  }

  function findThumbnail(num) {
    var label = String(num).padStart(2, '0');
    var bases = [
      'imagenes/' + encodeURIComponent('imagen ' + label),
      'imagenes/imagen ' + label,
      'imagenes/imagen-' + label,
      'imagenes/imagen' + label
    ];
    var list = [];
    bases.forEach(function (b) { ['.jpg', '.jpeg', '.png', '.webp'].forEach(function (ext) { list.push(b + ext); }); });
    return new Promise(function (resolve) {
      var i = 0;
      var next = function () {
        if (i >= list.length) { resolve(null); return; }
        var src = list[i++];
        var img = new Image();
        img.onload = function () { resolve(src); };
        img.onerror = next;
        img.src = src;
      };
      next();
    });
  }

  var FALLBACK = [
    { id: '01', categoria: 'Shorts / Reels', titulo: 'Reel', descripcion: 'Edición rápida, ritmo y texto.' },
    { id: '02', categoria: 'Promocionales', titulo: 'Spot', descripcion: 'Color y narrativa.' },
    { id: '03', categoria: 'YouTube / Largo', titulo: 'Pieza larga', descripcion: 'Storytelling y postproducción.' },
    { id: '04', categoria: 'Shorts / Reels', titulo: 'Serie', descripcion: 'Una serie con la misma mirada.' }
  ];

  function mountMedia(frame, src, thumb) {
    var video = frame.querySelector('video');
    var empty = frame.querySelector('.shot-empty');
    if (src && video) {
      video.src = src;
      video.muted = true;
      frame.setAttribute('data-src', src);
      if (empty) empty.remove();
      return;
    }
    if (thumb) {
      var img = document.createElement('img');
      img.alt = '';
      img.src = thumb;
      frame.appendChild(img);
      if (empty) empty.remove();
    }
  }

  function watchPlayback(track) {
    var frames = function () { return track.querySelectorAll('.shot-media'); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target.querySelector('video');
        if (!video || !video.getAttribute('src')) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.55) video.play().catch(function () {});
        else video.pause();
      });
    }, { threshold: [0, 0.55, 0.8] });
    frames().forEach(function (frame) { io.observe(frame); });
  }

  async function initProjects() {
    var track = document.getElementById('projectsTrack');
    if (!track) return;
    var data = FALLBACK;
    try {
      var r = await fetch('data/projects.json');
      if (r.ok) {
        var json = await r.json();
        if (Array.isArray(json) && json.length) data = json;
      }
    } catch (e) {}

    track.innerHTML = data.map(function (p) {
      var id = String(p.id).padStart(2, '0');
      return (
        '<article class="shot">' +
          '<button class="shot-media" type="button" aria-label="Ver ' + escapeHtml(p.titulo) + '">' +
            '<span class="shot-empty">' + id + '</span>' +
            '<video muted playsinline loop preload="metadata"></video>' +
          '</button>' +
          '<div class="shot-copy">' +
            '<span class="slate">' + id + '</span>' +
            '<p class="shot-cat">' + escapeHtml(p.categoria) + '</p>' +
            '<h2>' + escapeHtml(p.titulo) + '</h2>' +
            '<p class="shot-desc">' + escapeHtml(p.descripcion) + '</p>' +
            '<div class="cuts" data-cuts="' + id + '"></div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    var shots = track.querySelectorAll('.shot');
    await Promise.all(Array.prototype.map.call(shots, async function (shot, index) {
      var id = String(data[index].id).padStart(2, '0');
      var frame = shot.querySelector('.shot-media');
      var cuts = shot.querySelector('.cuts');
      var main = await findVideo(id);
      var thumb = await findThumbnail(id);
      mountMedia(frame, main, thumb);
      var extras = await Promise.all([1, 2, 3].map(function (n) { return findVideo(id + '.' + n); }));
      extras.filter(Boolean).forEach(function (src) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cut';
        btn.setAttribute('data-src', src);
        btn.setAttribute('aria-label', 'Ver otro corte de ' + id);
        var v = document.createElement('video');
        v.muted = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.src = src;
        btn.appendChild(v);
        cuts.appendChild(btn);
      });
      if (!cuts.children.length) cuts.remove();
    }));

    watchPlayback(track);
  }

  initProjects();
})();
