      const narrow = window.innerWidth < 768;
      const shift = narrow ? 54 : 46;
      slide.style.opacity = String(opacity);
      slide.style.filter = blur > 0.3 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
      slide.style.transform = 'translate3d(' + (delta * shift) + '%, 0, 0) scale(' + scale + ')';
