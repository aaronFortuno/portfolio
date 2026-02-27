/**
 * renderer.js — Renders project cards into the grid
 */

const Renderer = (() => {
  let _projects = [];
  let _tags     = {};

  /**
   * Set project data (called once on load).
   */
  function setData(projects, tags) {
    _projects = projects;
    _tags     = tags;
  }

  /**
   * Render filtered projects into the grid.
   * @param {object[]} visibleProjects - already filtered list
   */
  function render(visibleProjects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    _updateCount(visibleProjects.length, _projects.filter(p => p.visible !== false).length);

    if (visibleProjects.length === 0) {
      _renderEmpty(grid);
      return;
    }

    // Featured first, then by date desc
    const sorted = [...visibleProjects].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

    sorted.forEach((project, idx) => {
      const card = _buildCard(project);
      card.style.animationDelay = `${idx * 40}ms`;
      grid.appendChild(card);
    });
  }

  function _buildCard(project) {
    const lang   = I18n.current();
    const title  = _t(project.title, lang);
    const desc   = _t(project.shortDescription, lang) || _t(project.fullDescription, lang) || '';
    const date   = project.date ? _formatDate(project.date, lang) : '';
    const tags   = project.tags || [];
    const langs  = project.projectLanguages || [];

    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', title);

    // Featured badge
    const featuredBadge = project.featured
      ? `<span class="card-featured-badge" data-i18n="card.featured">${I18n.get('card.featured') || 'Destacat'}</span>`
      : '';

    // Language pills
    const LANG_LABELS = {
      ca: 'CA', es: 'ES', en: 'EN', agnostic: '∅'
    };
    const langPills = langs.map(l =>
      `<span class="card-lang-pill" title="${_projLangLabel(l)}">${LANG_LABELS[l] || l.toUpperCase()}</span>`
    ).join('');

    // Tag chips
    const tagChips = tags.map(t => {
      const label = _tags[t]?.[lang] || _tags[t]?.en || t;
      return `<button class="tag-chip" data-tag-id="${t}" aria-label="Filter by ${label}">${label}</button>`;
    }).join('');

    card.innerHTML = `
      ${featuredBadge}
      <div class="card-carousel" id="carousel-${project.id}"></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-date">${date}</span>
          <div class="card-lang-pills">${langPills}</div>
        </div>
        <h3 class="card-title">${title}</h3>
        <p class="card-description">${_escapeHtml(desc)}</p>
        <div class="card-tags">${tagChips}</div>
      </div>
      <div class="card-footer">
        <span class="card-view-more">
          <span data-i18n="card.viewMore">${I18n.get('card.viewMore') || 'Veure més'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </span>
      </div>`;

    // Init carousel
    Carousel.init(card.querySelector(`#carousel-${project.id}`), project.images || []);

    // Card click → open modal (but not on tag chip click)
    card.addEventListener('click', e => {
      if (e.target.closest('.tag-chip')) return;
      if (e.target.closest('.carousel-btn')) return;
      if (e.target.closest('.carousel-dot')) return;
      Modal.open(project);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        Modal.open(project);
      }
    });

    // Tag chip click → activate filter
    card.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', e => {
        e.stopPropagation();
        Filters.activateTag(chip.dataset.tagId);
        // Re-render after filter change is triggered by Filters._onChangeCallback
      });
    });

    return card;
  }

  function _renderEmpty(grid) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
      <div class="empty-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
             style="opacity:0.25">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <p data-i18n="empty.noResults">${I18n.get('empty.noResults') || 'Cap resultat.'}</p>
      <button class="btn btn-accent" onclick="Filters.clearAll(); App.renderGrid();"
              data-i18n="empty.clearFilters">${I18n.get('empty.clearFilters') || 'Netejar filtres'}</button>`;
    grid.appendChild(div);
  }

  function _updateCount(visible, total) {
    const el = document.getElementById('project-count');
    if (!el) return;
    el.textContent = visible === total
      ? `${total} projecte${total !== 1 ? 's' : ''}`
      : `${visible} / ${total}`;
  }

  function _t(obj, lang) {
    if (!obj || typeof obj === 'string') return obj || '';
    return obj[lang] || obj.ca || obj.es || obj.en || '';
  }

  function _formatDate(iso, lang) {
    try {
      const localeMap = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };
      return new Date(iso + 'T00:00:00').toLocaleDateString(localeMap[lang] || 'ca-ES', {
        year: 'numeric', month: 'short'
      });
    } catch { return iso; }
  }

  function _projLangLabel(code) {
    const map = {
      ca: I18n.get('projectLang.ca') || 'Català',
      es: I18n.get('projectLang.es') || 'Castellà',
      en: I18n.get('projectLang.en') || 'Anglès',
      agnostic: I18n.get('projectLang.agnostic') || 'Sense idioma',
    };
    return map[code] || code;
  }

  function _escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function allProjects() { return _projects; }

  return { setData, render, allProjects };
})();
