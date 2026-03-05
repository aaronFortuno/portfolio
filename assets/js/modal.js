/**
 * modal.js — Project detail overlay
 * Image mosaic, Markdown description, links, tags.
 */

const Modal = (() => {
  let _backdrop   = null;
  let _panel      = null;
  let _inner      = null;
  let _allTags    = {};
  let _isOpen     = false;

  function init(tags) {
    _allTags = tags || {};

    // Build DOM once — panel and inner must be nested INSIDE backdrop
    // so that the CSS selector .modal-backdrop.open .modal-inner works.
    _backdrop = document.getElementById('modal-backdrop');

    if (!_backdrop) {
      _backdrop = document.createElement('div');
      _backdrop.id = 'modal-backdrop';
      _backdrop.className = 'modal-backdrop';

      _panel = document.createElement('div');
      _panel.className = 'modal-panel';
      _panel.setAttribute('role', 'dialog');
      _panel.setAttribute('aria-modal', 'true');
      _panel.setAttribute('aria-labelledby', 'modal-title');

      _inner = document.createElement('div');
      _inner.id = 'modal-inner';
      _inner.className = 'modal-inner';

      _panel.appendChild(_inner);
      _backdrop.appendChild(_panel);   // panel inside backdrop
      document.body.appendChild(_backdrop);
    } else {
      _panel = _backdrop.querySelector('.modal-panel');
      _inner = _backdrop.querySelector('.modal-inner');
    }

    // Close only when clicking the backdrop area (outside the inner panel)
    _backdrop.addEventListener('click', e => {
      if (!_inner.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _isOpen) close();
    });
  }

  /**
   * Open the modal with a project's data.
   * @param {object} project
   */
  function open(entry) {
    const lang = I18n.current();
    const type = entry.type || 'project';
    const isNote = type === 'note';

    const title       = _t(entry.title, lang);
    const fullDesc    = _t(entry.fullDescription, lang) || _t(entry.shortDescription, lang) || '';
    const images      = entry.images || [];
    const links       = entry.links  || {};
    const tags        = entry.tags   || [];
    const projectLangs = entry.projectLanguages || [];
    const date        = entry.date ? _formatDate(entry.date, lang) : '';

    // Render Markdown
    const descHtml = (typeof marked !== 'undefined')
      ? marked.parse(fullDesc)
      : fullDesc.replace(/\n/g, '<br>');

    // Build image mosaic — show for projects always, for notes only if they have images
    const imgCount = images.length;
    const mosaicClass = imgCount === 0 ? '' :
      imgCount === 1 ? 'count-1' :
      imgCount === 2 ? 'count-2' :
      imgCount === 3 ? 'count-3' :
      imgCount === 4 ? 'count-4' : 'count-more';

    const imagesHtml = imgCount > 0 ? `
      <div class="modal-section">
        <div class="modal-images ${mosaicClass}">
          ${images.map((src, i) => `
            <div class="modal-img-wrap" data-lightbox-src="${src}" role="button" tabindex="0"
                 aria-label="Image ${i+1}">
              <img src="${src}" alt="Screenshot ${i+1}" loading="lazy"
                   onerror="this.src='assets/img/placeholder.svg'">
            </div>`).join('')}
        </div>
      </div>` : '';

    // Build links HTML — hide for notes
    const linkEntries = Object.entries(links).filter(([, v]) => v);
    const linksHtml = (!isNote && linkEntries.length > 0) ? `
      <div class="modal-section">
        <p class="modal-section-label" data-i18n="modal.links">${I18n.get('modal.links') || 'Enllaços'}</p>
        <div class="modal-links">
          ${linkEntries.map(([key, url]) => `
            <a href="${url}" target="_blank" rel="noopener noreferrer"
               class="modal-link ${key === 'demo' ? 'primary' : ''}"
               data-i18n="modal.${key}">
              ${_linkIcon(key)} ${I18n.get(`modal.${key}`) || key}
            </a>`).join('')}
        </div>
      </div>` : '';

    // Build related projects HTML — for notes only
    const relatedHtml = (isNote && entry.relatedProjects?.length > 0) ? `
      <div class="modal-section">
        <p class="modal-section-label" data-i18n="modal.relatedProjects">${I18n.get('modal.relatedProjects') || 'Projectes relacionats'}</p>
        <div class="modal-links">
          ${entry.relatedProjects.map(id => {
            const related = _findProject(id);
            if (!related) return '';
            const relTitle = _t(related.title, lang);
            return `<button class="modal-link modal-related-project" data-project-id="${id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
              ${relTitle}
            </button>`;
          }).join('')}
        </div>
      </div>` : '';

    // Build tags HTML
    const tagsHtml = tags.length > 0 ? `
      <div class="modal-section">
        <div class="modal-tags">
          ${tags.map(t => {
            const label = _allTags[t]?.[lang] || _allTags[t]?.en || t;
            return `<span class="tag-chip">${label}</span>`;
          }).join('')}
        </div>
      </div>` : '';

    // Project language pills
    const LANG_LABELS = {
      ca: I18n.get('projectLang.ca') || 'Català',
      es: I18n.get('projectLang.es') || 'Castellà',
      en: I18n.get('projectLang.en') || 'Anglès',
      agnostic: I18n.get('projectLang.agnostic') || 'Sense idioma',
    };
    const langPillsHtml = projectLangs.length > 0
      ? `<span class="modal-proj-langs">
           <span>${I18n.get('projectLang.available') || 'Disponible en'}:</span>
           ${projectLangs.map(l => `<span class="card-lang-pill">${LANG_LABELS[l] || l}</span>`).join('')}
         </span>`
      : '';

    _inner.innerHTML = `
      <div class="modal-header">
        <div class="modal-title-block">
          <h2 class="modal-title" id="modal-title">${title}</h2>
          <div class="modal-meta">
            ${date ? `<span class="modal-date">${date}</span>` : ''}
            ${langPillsHtml}
          </div>
        </div>
        <button class="modal-close" id="modal-close-btn"
                aria-label="${I18n.get('aria.closeModal') || 'Tancar'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        ${imagesHtml}
        ${fullDesc ? `
          <div class="modal-section">
            <p class="modal-section-label" data-i18n="modal.description">${I18n.get('modal.description') || 'Descripció'}</p>
            <div class="modal-description">${descHtml}</div>
          </div>` : ''}
        ${linksHtml}
        ${relatedHtml}
        ${tagsHtml}
      </div>`;

    // Close button
    _inner.querySelector('#modal-close-btn').addEventListener('click', close);

    // Lightbox on image click
    _inner.querySelectorAll('.modal-img-wrap').forEach(wrap => {
      const handler = () => openLightbox(wrap.dataset.lightboxSrc);
      wrap.addEventListener('click', handler);
      wrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });

    // Related project click → open that project's modal
    _inner.querySelectorAll('.modal-related-project').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const related = _findProject(btn.dataset.projectId);
        if (related) {
          close();
          setTimeout(() => open(related), 400);
        }
      });
    });

    // Show
    _backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    _isOpen = true;

    // Focus trap — focus close button
    requestAnimationFrame(() => {
      _inner.querySelector('#modal-close-btn')?.focus();
    });
  }

  function close() {
    _backdrop.classList.remove('open');
    document.body.style.overflow = '';
    _isOpen = false;
    // Clear content after transition
    setTimeout(() => { if (!_isOpen) _inner.innerHTML = ''; }, 400);
  }

  function openLightbox(src) {
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.innerHTML = '<img id="lightbox-img" src="" alt="">';
      lb.addEventListener('click', () => lb.classList.remove('open'));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
      document.body.appendChild(lb);
    }
    lb.querySelector('#lightbox-img').src = src;
    requestAnimationFrame(() => lb.classList.add('open'));
  }

  function _findProject(id) {
    return (typeof Renderer !== 'undefined') ? Renderer.allProjects().find(p => p.id === id) : null;
  }

  function _t(obj, lang) {
    if (!obj || typeof obj === 'string') return obj || '';
    return obj[lang] || obj.ca || obj.es || obj.en || '';
  }

  function _formatDate(isoDate, lang) {
    try {
      const localeMap = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };
      return new Date(isoDate + 'T00:00:00').toLocaleDateString(localeMap[lang] || 'ca-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return isoDate; }
  }

  function _linkIcon(key) {
    const icons = {
      github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>`,
      demo:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
      docs:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    };
    return icons[key] || '';
  }

  return { init, open, close };
})();
