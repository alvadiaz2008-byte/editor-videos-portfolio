items.forEach((slide, i) => {
      const delta = i - pos;
      const ad = Math.abs(delta);
      let opacity = 0;
      let scale = 0.62;
      let blur = 0;
      if (ad < 1.25) {
        const t = Math.max(0, 1 - ad);
        opacity = 0.5 + 0.5 * t;
        scale = 0.62 + 0.44 * t;
        blur = (1 - t) * 5;
      }
      slide.style.opacity = String(opacity);
      slide.style.filter = blur > 0.3 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
      slide.style.transform = 'translate3d(' + (delta * 64) + '%, 0, 0) scale(' + scale + ')';
      slide.style.zIndex = String(20 - Math.round(ad * 8));
      slide.style.visibility = ad > 1.25 ? 'hidden' : 'visible';
      const vid = slide.querySelector('video');
      if (vid && vid.getAttribute('src')) {
        if (ad < 0.45) vid.play().catch(() => {});
        else vid.pause();
      }
    });