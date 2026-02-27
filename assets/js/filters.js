/**
 * filters.js — Tag and project-language filter system
 */

const Filters = (() => {
  let _activeTagFilters   = new Set(); // tag IDs
  let _activeLangFilters  = new Set(); // 'ca'|'es'|'en'|'agnostic'
  let _onChangeCallback   = null;
  let _allTags            = {};        // { tagId: { ca, es, en } }
  let _allProjects        = [];

  /**
   * Initialize filters from projects data.
   * @param {object[]} projects
   * @param {object} tags - tags dictionary from projects.json
   * @param {function} onChange - called when filters change
   */
  function init(projects, tags, onChange) {
    _allProjects = projects;
    _allTags = tags;
    _onChangeCallback = onChange;
    _render();
  }

  function _render() {
    const container = document.getElementById('filters-section');
    if (!container) return;

    // Collect available tag IDs and language codes present in current projects
    const tagCounts = {};
    const langCounts = {};

    _allProjects.filter(p => p.visible !== false).forEach(p => {
      (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
      (p.projectLanguages || []).forEach(l => { langCounts[l] = (langCounts[l] || 0) + 1; });
    });

    const lang = I18n.current();

    container.innerHTML = `
      <div class="filters-row">
        <div class="filter-group">
          <span class="filter-group-label" data-i18n="filters.tags">${I18n.get('filters.tags') || 'Tags'}</span>
          <div class="filter-chips" id="tag-chips"></div>
        </div>
        <div class="filter-group filter-group-right">
          <span class="filter-group-label" data-i18n="filters.languages">${I18n.get('filters.languages') || 'Idioma'}</span>
          <div class="filter-chips" id="lang-chips"></div>
        </div>
      </div>
      <div class="filters-footer">
        <div class="active-filters-bar" id="active-filters-bar"></div>
        <button class="btn filters-clear" id="filters-clear" data-i18n="filters.clearAll"
                style="display:none">${I18n.get('filters.clearAll') || 'Netejar filtres'}</button>
      </div>`;

    // Tag chips
    const tagChipsEl = container.querySelector('#tag-chips');
    _makeChip(tagChipsEl, 'tag', '__all__', I18n.get('nav.filterAll') || 'Tots', null, true);
    Object.entries(tagCounts).forEach(([tagId, count]) => {
      const label = _allTags[tagId]?.[lang] || _allTags[tagId]?.en || tagId;
      _makeChip(tagChipsEl, 'tag', tagId, label, count);
    });

    // Lang chips
    const langChipsEl = container.querySelector('#lang-chips');
    const LANG_LABELS = {
      ca: I18n.get('projectLang.ca') || 'Català',
      es: I18n.get('projectLang.es') || 'Castellà',
      en: I18n.get('projectLang.en') || 'Anglès',
      agnostic: I18n.get('projectLang.agnostic') || 'Sense idioma',
    };
    _makeChip(langChipsEl, 'lang', '__all__', I18n.get('nav.filterAll') || 'Tots', null, true);
    Object.entries(langCounts).forEach(([code, count]) => {
      _makeChip(langChipsEl, 'lang', code, LANG_LABELS[code] || code, count);
    });

    // Clear button
    const clearBtn = container.querySelector('#filters-clear');
    clearBtn.addEventListener('click', clearAll);

    _syncChipStates();
    _renderActiveBadges();
  }

  function _makeChip(parent, type, id, label, count, isAll = false) {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (isAll ? ' active' : '');
    btn.dataset.filterType = type;
    btn.dataset.filterId   = id;
    btn.innerHTML = label + (count != null ? ` <span class="chip-count">(${count})</span>` : '');
    btn.addEventListener('click', () => _onChipClick(type, id, isAll));
    parent.appendChild(btn);
  }

  function _onChipClick(type, id, isAll) {
    if (isAll && id === '__all__') {
      if (type === 'tag')  _activeTagFilters.clear();
      if (type === 'lang') _activeLangFilters.clear();
    } else {
      const set = type === 'tag' ? _activeTagFilters : _activeLangFilters;
      if (set.has(id)) set.delete(id); else set.add(id);
    }
    _syncChipStates();
    _renderActiveBadges();
    _updateClearButton();
    _onChangeCallback?.();
  }

  function _syncChipStates() {
    document.querySelectorAll('.filter-chip').forEach(btn => {
      const type = btn.dataset.filterType;
      const id   = btn.dataset.filterId;
      const set  = type === 'tag' ? _activeTagFilters : _activeLangFilters;

      if (id === '__all__') {
        btn.classList.toggle('active', set.size === 0);
      } else {
        btn.classList.toggle('active', set.has(id));
      }
    });
  }

  function _renderActiveBadges() {
    const bar = document.getElementById('active-filters-bar');
    if (!bar) return;
    bar.innerHTML = '';
    const lang = I18n.current();

    const allActive = [..._activeTagFilters].concat([..._activeLangFilters]);
    bar.classList.toggle('visible', allActive.length > 0);

    _activeTagFilters.forEach(tagId => {
      const label = _allTags[tagId]?.[lang] || tagId;
      _makeActiveBadge(bar, label, () => { _activeTagFilters.delete(tagId); _refresh(); });
    });

    const LANG_LABELS = {
      ca: I18n.get('projectLang.ca') || 'Català',
      es: I18n.get('projectLang.es') || 'Castellà',
      en: I18n.get('projectLang.en') || 'Anglès',
      agnostic: I18n.get('projectLang.agnostic') || 'Sense idioma',
    };
    _activeLangFilters.forEach(code => {
      _makeActiveBadge(bar, LANG_LABELS[code] || code, () => { _activeLangFilters.delete(code); _refresh(); });
    });
  }

  function _makeActiveBadge(parent, label, onRemove) {
    const span = document.createElement('span');
    span.className = 'active-filter-tag';
    span.innerHTML = `${label} <button aria-label="Remove filter">×</button>`;
    span.querySelector('button').addEventListener('click', onRemove);
    parent.appendChild(span);
  }

  function _updateClearButton() {
    const btn = document.getElementById('filters-clear');
    if (!btn) return;
    const hasFilters = _activeTagFilters.size > 0 || _activeLangFilters.size > 0;
    btn.style.display = hasFilters ? '' : 'none';
  }

  function _refresh() {
    _syncChipStates();
    _renderActiveBadges();
    _updateClearButton();
    _onChangeCallback?.();
  }

  /**
   * Filter an array of projects based on active filters.
   * @param {object[]} projects
   * @returns {object[]}
   */
  function apply(projects) {
    return projects.filter(p => {
      if (p.visible === false) return false;
      const passTag  = _activeTagFilters.size === 0
        || (p.tags || []).some(t => _activeTagFilters.has(t));
      const passLang = _activeLangFilters.size === 0
        || (p.projectLanguages || []).some(l => _activeLangFilters.has(l));
      return passTag && passLang;
    });
  }

  function clearAll() {
    _activeTagFilters.clear();
    _activeLangFilters.clear();
    _refresh();
  }

  /** Re-render filter UI (after language change). */
  function refresh() { _render(); }

  /** Programmatically activate a tag filter (from card tag click). */
  function activateTag(tagId) {
    _activeTagFilters.add(tagId);
    _refresh();
  }

  return { init, apply, clearAll, refresh, activateTag };
})();
