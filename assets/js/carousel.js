/**
 * carousel.js — Image carousel for project cards
 * Lightweight, no dependencies, touch-swipe supported.
 */

const Carousel = (() => {
  /**
   * Initialize a carousel inside a .card-carousel element.
   * @param {HTMLElement} container - the .card-carousel element
   * @param {string[]} images - array of image paths
   */
  function init(container, images) {
    if (!container) return;
    if (!images || images.length === 0) {
      _renderNoImage(container);
      return;
    }
    if (images.length === 1) {
      _renderSingle(container, images[0]);
      return;
    }
    _renderMultiple(container, images);
  }

  function _renderNoImage(container) {
    container.innerHTML = `
      <div class="carousel-no-image">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
        <span data-i18n="card.noImage">Sense imatge</span>
      </div>`;
  }

  function _renderSingle(container, src) {
    const track = document.createElement('div');
    track.className = 'carousel-track';
    const slide = _makeSlide(src);
    track.appendChild(slide);
    container.appendChild(track);
  }

  function _renderMultiple(container, images) {
    let current = 0;

    const track = document.createElement('div');
    track.className = 'carousel-track';

    images.forEach(src => track.appendChild(_makeSlide(src)));
    container.appendChild(track);

    // Buttons
    const prev = _makeBtn('prev', '‹');
    const next = _makeBtn('next', '›');
    container.appendChild(prev);
    container.appendChild(next);

    // Dots
    const dotsEl = document.createElement('div');
    dotsEl.className = 'carousel-dots';
    const dots = images.map((_, i) => {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      dotsEl.appendChild(d);
      return d;
    });
    container.appendChild(dotsEl);

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, images.length - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      prev.disabled = current === 0;
      next.disabled = current === images.length - 1;
    }

    prev.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    next.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });

    // Touch swipe
    let touchStartX = 0;
    container.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    goTo(0);
  }

  function _makeSlide(src) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { img.src = 'assets/img/placeholder.svg'; };
    slide.appendChild(img);
    return slide;
  }

  function _makeBtn(cls, label) {
    const btn = document.createElement('button');
    btn.className = `carousel-btn ${cls}`;
    btn.innerHTML = label;
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
    return btn;
  }

  return { init };
})();
