/**
 * admin.js — Portfolio Admin Panel
 * Manages projects.json and config.json via import/export.
 * No server required. Run locally with: npx serve . (from project root)
 */

// ══════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════

const State = {
  projects: [],
  tags: {},
  config: _defaultConfig(),
  editingProjectIdx: null, // null = new project
  jsonMode: 'projects',    // 'projects' | 'config'
};

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  await loadDefaultData();
  setupNavigation();
  setupProjectsPanel();
  setupTagsPanel();
  setupConfigPanel();
  setupJsonPanel();
  setupLangTabs();
  renderProjectList();
  renderTagsList();
  populateConfigForm();
});

async function loadDefaultData() {
  // Try to load from repo (only works if served, not from file://)
  try {
    const [pRes, cRes] = await Promise.all([
      fetch('../data/projects.json'),
      fetch('../data/config.json'),
    ]);
    if (pRes.ok) {
      const pd = await pRes.json();
      State.projects = pd.projects || [];
      State.tags     = pd.tags     || {};
    }
    if (cRes.ok) {
      State.config = await cRes.json();
    }
    showToast('Dades carregades del repositori.');
  } catch {
    showToast('Servei local no detectat. Usa Importar JSON per carregar dades.', true);
  }
}

// ══════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      const panelId = 'panel-' + item.dataset.panel;
      document.getElementById(panelId)?.classList.add('active');
    });
  });
}

function showPanel(panelId) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(panelId)?.classList.add('active');
}

// ══════════════════════════════════════════════════════
// LANG TABS (shared)
// ══════════════════════════════════════════════════════

function setupLangTabs() {
  document.addEventListener('click', e => {
    const tab = e.target.closest('.lang-tab');
    if (!tab) return;
    const group = tab.dataset.langTab;
    const lang  = tab.dataset.lang;
    // Deactivate other tabs in same group
    document.querySelectorAll(`.lang-tab[data-lang-tab="${group}"]`).forEach(t => t.classList.remove('active'));
    document.querySelectorAll(`[data-lang-pane="${group}"]`).forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-lang-pane="${group}"][data-lang="${lang}"]`)?.classList.add('active');
  });
}

// ══════════════════════════════════════════════════════
// PROJECTS PANEL
// ══════════════════════════════════════════════════════

function setupProjectsPanel() {
  document.getElementById('btn-new-project').addEventListener('click', () => openProjectForm(null));
  document.getElementById('btn-export-projects').addEventListener('click', exportProjects);
  document.getElementById('btn-import-projects').addEventListener('click', () => {
    document.getElementById('input-import-projects').click();
  });
  document.getElementById('input-import-projects').addEventListener('change', e => {
    importJson(e.target.files[0], data => {
      if (!data.projects) { showToast('JSON invàlid: falta "projects"', true); return; }
      State.projects = data.projects;
      State.tags     = data.tags || State.tags;
      renderProjectList();
      renderTagsList();
      showToast('projects.json importat correctament.');
    });
  });
}

function renderProjectList() {
  const list = document.getElementById('project-list');
  if (!list) return;

  if (State.projects.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted);font-size:0.82rem;padding:1rem 0">
      Cap projecte encara. Clica "+ Nou projecte" per afegir-ne un.</p>`;
    return;
  }

  list.innerHTML = State.projects.map((p, idx) => `
    <div class="project-list-item ${p.visible === false ? 'hidden-project' : ''}" data-idx="${idx}">
      <span class="item-drag-handle" aria-hidden="true">⠿</span>
      <div class="item-info">
        <div class="item-title">${p.title?.ca || p.title?.en || p.id}</div>
        <div class="item-meta">${p.id} · ${p.date || '—'}</div>
      </div>
      <div style="display:flex;gap:0.3rem;align-items:center">
        ${p.featured ? `<span class="badge badge-featured">⭐ Destacat</span>` : ''}
        ${p.visible === false ? `<span class="badge badge-hidden">Ocult</span>` : ''}
      </div>
      <div class="item-actions">
        <button class="btn btn-sm" data-edit="${idx}">✏ Editar</button>
        <button class="btn btn-sm" data-toggle-visible="${idx}"
                title="${p.visible === false ? 'Fer visible' : 'Ocultar'}">
          ${p.visible === false ? '👁' : '🙈'}
        </button>
      </div>
    </div>`).join('');

  list.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openProjectForm(parseInt(btn.dataset.edit)));
  });
  list.querySelectorAll('[data-toggle-visible]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.toggleVisible);
      State.projects[idx].visible = State.projects[idx].visible === false ? true : false;
      renderProjectList();
    });
  });

  const statusEl = document.getElementById('projects-status');
  if (statusEl) statusEl.textContent = `${State.projects.length} projecte${State.projects.length !== 1 ? 's' : ''}`;
}

// ══════════════════════════════════════════════════════
// PROJECT FORM
// ══════════════════════════════════════════════════════

function openProjectForm(idx) {
  State.editingProjectIdx = idx;
  const isNew = idx === null;
  const p = isNew ? _emptyProject() : State.projects[idx];

  document.getElementById('form-title').textContent    = isNew ? 'Nou projecte' : 'Editar projecte';
  document.getElementById('form-subtitle').textContent = isNew ? 'Omple les dades del projecte.' : `ID: ${p.id}`;
  document.getElementById('btn-delete-project').style.display = isNew ? 'none' : '';

  // Fill form fields
  document.getElementById('f-id').value       = p.id || '';
  document.getElementById('f-date').value     = p.date || '';
  document.getElementById('f-visible').checked  = p.visible !== false;
  document.getElementById('f-featured').checked = !!p.featured;

  // Project languages
  document.querySelectorAll('#proj-lang-select .tag-toggle').forEach(btn => {
    btn.classList.toggle('selected', (p.projectLanguages || []).includes(btn.dataset.lang));
  });

  // Title
  document.getElementById('f-title-ca').value = p.title?.ca || '';
  document.getElementById('f-title-es').value = p.title?.es || '';
  document.getElementById('f-title-en').value = p.title?.en || '';

  // Short desc
  document.getElementById('f-short-ca').value = p.shortDescription?.ca || '';
  document.getElementById('f-short-es').value = p.shortDescription?.es || '';
  document.getElementById('f-short-en').value = p.shortDescription?.en || '';

  // Full desc
  document.getElementById('f-full-ca').value = p.fullDescription?.ca || '';
  document.getElementById('f-full-es').value = p.fullDescription?.es || '';
  document.getElementById('f-full-en').value = p.fullDescription?.en || '';

  // Tags
  renderTagsMultiselect('project-tags-select', p.tags || []);

  // Images
  renderImageList(p.images || []);

  // Links
  document.getElementById('f-link-github').value = p.links?.github || '';
  document.getElementById('f-link-demo').value   = p.links?.demo   || '';
  document.getElementById('f-link-docs').value   = p.links?.docs   || '';

  // Show form panel
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  showPanel('panel-project-form');
}

// Setup project form actions
document.getElementById('btn-back-to-projects').addEventListener('click', () => {
  showPanel('panel-projects');
  document.querySelector('[data-panel="projects"]').classList.add('active');
});

document.getElementById('btn-cancel-project').addEventListener('click', () => {
  document.getElementById('btn-back-to-projects').click();
});

document.getElementById('btn-delete-project').addEventListener('click', () => {
  if (State.editingProjectIdx === null) return;
  if (!confirm('Segur que vols eliminar aquest projecte?')) return;
  State.projects.splice(State.editingProjectIdx, 1);
  renderProjectList();
  document.getElementById('btn-back-to-projects').click();
  showToast('Projecte eliminat.');
});

document.getElementById('project-form').addEventListener('submit', e => {
  e.preventDefault();
  const project = collectProjectForm();
  if (!project.id) { showToast('L\'ID és obligatori.', true); return; }

  if (State.editingProjectIdx === null) {
    State.projects.unshift(project);
  } else {
    State.projects[State.editingProjectIdx] = project;
  }

  renderProjectList();
  document.getElementById('btn-back-to-projects').click();
  showToast('Projecte guardat. Exporta el JSON per persistir els canvis.');
});

document.getElementById('btn-add-image').addEventListener('click', () => {
  const path = prompt('Ruta de la imatge (ex: projects/my-project/img/screenshot-01.webp):');
  if (!path) return;
  const list = _getImageList();
  list.push(path.trim());
  renderImageList(list);
});

function collectProjectForm() {
  const langBtns = document.querySelectorAll('#proj-lang-select .tag-toggle.selected');
  const selectedLangs = [...langBtns].map(b => b.dataset.lang);

  const tagBtns = document.querySelectorAll('#project-tags-select .tag-toggle.selected');
  const selectedTags = [...tagBtns].map(b => b.dataset.tagId);

  return {
    id:      document.getElementById('f-id').value.trim().replace(/\s+/g, '-'),
    visible: document.getElementById('f-visible').checked,
    featured: document.getElementById('f-featured').checked,
    date:    document.getElementById('f-date').value,
    projectLanguages: selectedLangs,
    title: {
      ca: document.getElementById('f-title-ca').value,
      es: document.getElementById('f-title-es').value,
      en: document.getElementById('f-title-en').value,
    },
    shortDescription: {
      ca: document.getElementById('f-short-ca').value,
      es: document.getElementById('f-short-es').value,
      en: document.getElementById('f-short-en').value,
    },
    fullDescription: {
      ca: document.getElementById('f-full-ca').value,
      es: document.getElementById('f-full-es').value,
      en: document.getElementById('f-full-en').value,
    },
    tags: selectedTags,
    images: _getImageList(),
    links: {
      github: document.getElementById('f-link-github').value || null,
      demo:   document.getElementById('f-link-demo').value   || null,
      docs:   document.getElementById('f-link-docs').value   || null,
    },
  };
}

function renderTagsMultiselect(containerId, selected = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  Object.entries(State.tags).forEach(([id, labels]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag-toggle' + (selected.includes(id) ? ' selected' : '');
    btn.dataset.tagId = id;
    btn.textContent = labels.ca || labels.en || id;
    btn.addEventListener('click', () => btn.classList.toggle('selected'));
    container.appendChild(btn);
  });
  if (container.children.length === 0) {
    container.innerHTML = '<span style="font-size:0.78rem;color:var(--text-muted)">Cap etiqueta definida. Ve al panell Etiquetes.</span>';
  }
}

function renderImageList(images) {
  const list = document.getElementById('image-list');
  if (!list) return;
  list.innerHTML = images.map((src, i) => `
    <div class="image-item" data-img-idx="${i}">
      <span>${src}</span>
      <button type="button" class="btn btn-sm btn-danger" data-remove-img="${i}">✕</button>
    </div>`).join('') || '<p style="font-size:0.75rem;color:var(--text-muted)">Sense imatges.</p>';

  list.querySelectorAll('[data-remove-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgs = _getImageList();
      imgs.splice(parseInt(btn.dataset.removeImg), 1);
      renderImageList(imgs);
    });
  });
}

function _getImageList() {
  return [...document.querySelectorAll('#image-list .image-item')].map(el => el.querySelector('span').textContent.trim());
}

// Project lang toggle
document.querySelectorAll('#proj-lang-select .tag-toggle').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('selected'));
});

// ══════════════════════════════════════════════════════
// TAGS PANEL
// ══════════════════════════════════════════════════════

function setupTagsPanel() {
  document.getElementById('btn-new-tag').addEventListener('click', () => {
    const id = prompt('ID de l\'etiqueta (ex: tool, game, education):');
    if (!id || !id.trim()) return;
    const slug = id.trim().toLowerCase().replace(/\s+/g, '-');
    if (State.tags[slug]) { showToast('Aquesta etiqueta ja existeix.', true); return; }
    State.tags[slug] = { ca: slug, es: slug, en: slug };
    renderTagsList();
  });
}

function renderTagsList() {
  const container = document.getElementById('tags-list');
  if (!container) return;

  if (Object.keys(State.tags).length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.82rem">Cap etiqueta definida.</p>';
    return;
  }

  container.innerHTML = Object.entries(State.tags).map(([id, labels]) => `
    <div class="project-list-item" style="flex-wrap:wrap;gap:0.5rem">
      <span style="font-family:monospace;font-size:0.8rem;color:var(--accent);min-width:120px">${id}</span>
      <input type="text" value="${labels.ca || ''}" placeholder="CA" data-tag-id="${id}" data-lang="ca"
             style="width:120px" class="tag-label-input">
      <input type="text" value="${labels.es || ''}" placeholder="ES" data-tag-id="${id}" data-lang="es"
             style="width:120px" class="tag-label-input">
      <input type="text" value="${labels.en || ''}" placeholder="EN" data-tag-id="${id}" data-lang="en"
             style="width:120px" class="tag-label-input">
      <button class="btn btn-sm btn-danger" data-delete-tag="${id}" style="margin-left:auto">✕</button>
    </div>`).join('');

  container.querySelectorAll('.tag-label-input').forEach(input => {
    input.addEventListener('input', () => {
      const { tagId, lang } = input.dataset;
      if (!State.tags[tagId]) State.tags[tagId] = {};
      State.tags[tagId][lang] = input.value;
    });
  });

  container.querySelectorAll('[data-delete-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm(`Eliminar etiqueta "${btn.dataset.deleteTag}"?`)) return;
      delete State.tags[btn.dataset.deleteTag];
      renderTagsList();
      showToast('Etiqueta eliminada.');
    });
  });
}

// ══════════════════════════════════════════════════════
// CONFIG PANEL
// ══════════════════════════════════════════════════════

function setupConfigPanel() {
  // Sync color pickers with text inputs
  _syncColorPair('c-accent-color');
  _syncColorPair('c-dark-bg');
  _syncColorPair('c-dark-surface');
  _syncColorPair('c-dark-text');
  _syncColorPair('c-light-bg');
  _syncColorPair('c-light-surface');
  _syncColorPair('c-light-text');

  document.getElementById('btn-import-config').addEventListener('click', () => {
    document.getElementById('input-import-config').click();
  });
  document.getElementById('input-import-config').addEventListener('change', e => {
    importJson(e.target.files[0], data => {
      State.config = data;
      populateConfigForm();
      showToast('config.json importat.');
    });
  });

  document.getElementById('config-form').addEventListener('submit', e => {
    e.preventDefault();
    State.config = collectConfigForm();
    downloadJson(State.config, 'config.json');
    showToast('config.json exportat correctament.');
  });

  document.getElementById('btn-export-config').addEventListener('click', () => {
    State.config = collectConfigForm();
    downloadJson(State.config, 'config.json');
    showToast('config.json exportat.');
  });
}

function _syncColorPair(baseId) {
  const picker = document.getElementById(baseId);
  const text   = document.getElementById(baseId + '-text');
  if (!picker || !text) return;
  picker.addEventListener('input', () => { text.value = picker.value; });
  text.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(text.value)) picker.value = text.value;
  });
}

function populateConfigForm() {
  const c = State.config;
  const s = c.site || {};
  const a = c.appearance || {};
  const h = c.header || {};
  const f = c.footer || {};

  _set('c-author',          s.author        || '');
  _set('c-github-user',     s.githubUser    || '');
  _set('c-default-lang',    s.defaultLang   || 'ca');
  _set('c-default-theme',   s.defaultTheme  || 'dark');

  _set('c-accent-color',      a.accentColor  || '#22c55e');
  _set('c-accent-color-text', a.accentColor  || '#22c55e');
  _set('c-border-radius',     a.borderRadius || '12px');
  _set('c-font-heading',      a.fontHeading  || 'Inter');
  _set('c-font-body',         a.fontBody     || 'Inter');
  _set('c-font-mono',         a.fontMono     || 'JetBrains Mono');

  const dark  = a.themes?.dark  || {};
  const light = a.themes?.light || {};
  _setColor('c-dark-bg',      dark.bg       || '#0a0f0a');
  _setColor('c-dark-surface', dark.surface  || '#111811');
  _setColor('c-dark-text',    dark.text     || '#e2ece2');
  _setColor('c-light-bg',     light.bg      || '#f0f7f0');
  _setColor('c-light-surface',light.surface || '#ffffff');
  _setColor('c-light-text',   light.text    || '#0f1f0f');

  _set('c-header-title-ca',    h.title?.ca    || '');
  _set('c-header-title-es',    h.title?.es    || '');
  _set('c-header-title-en',    h.title?.en    || '');
  _set('c-header-subtitle-ca', h.subtitle?.ca || '');
  _set('c-header-subtitle-es', h.subtitle?.es || '');
  _set('c-header-subtitle-en', h.subtitle?.en || '');
  _setChecked('c-show-avatar', h.showAvatar || false);
  _set('c-avatar-url',         h.avatarUrl  || '');

  _setChecked('c-show-license', f.showLicense !== false);
  _setChecked('c-show-github',  f.showGithubLink !== false);
  _set('c-footer-text-ca', f.customText?.ca || '');
  _set('c-footer-text-es', f.customText?.es || '');
  _set('c-footer-text-en', f.customText?.en || '');
}

function collectConfigForm() {
  return {
    site: {
      author:       _get('c-author'),
      githubUser:   _get('c-github-user'),
      defaultLang:  _get('c-default-lang'),
      defaultTheme: _get('c-default-theme'),
    },
    appearance: {
      fontHeading:  _get('c-font-heading') || 'Inter',
      fontBody:     _get('c-font-body')    || 'Inter',
      fontMono:     _get('c-font-mono')    || 'JetBrains Mono',
      borderRadius: _get('c-border-radius') || '12px',
      accentColor:  _get('c-accent-color-text') || '#22c55e',
      themes: {
        dark: {
          bg:      _get('c-dark-bg-text'),
          surface: _get('c-dark-surface-text'),
          text:    _get('c-dark-text-text'),
        },
        light: {
          bg:      _get('c-light-bg-text'),
          surface: _get('c-light-surface-text'),
          text:    _get('c-light-text-text'),
        },
      },
    },
    header: {
      title:    { ca: _get('c-header-title-ca'),    es: _get('c-header-title-es'),    en: _get('c-header-title-en') },
      subtitle: { ca: _get('c-header-subtitle-ca'), es: _get('c-header-subtitle-es'), en: _get('c-header-subtitle-en') },
      showAvatar: _getChecked('c-show-avatar'),
      avatarUrl:  _get('c-avatar-url'),
    },
    footer: {
      showLicense:    _getChecked('c-show-license'),
      showGithubLink: _getChecked('c-show-github'),
      customText: {
        ca: _get('c-footer-text-ca'),
        es: _get('c-footer-text-es'),
        en: _get('c-footer-text-en'),
      },
    },
  };
}

// ══════════════════════════════════════════════════════
// JSON RAW PANEL
// ══════════════════════════════════════════════════════

function setupJsonPanel() {
  const editor = document.getElementById('json-editor');
  const errEl  = document.getElementById('json-error');

  function loadEditor() {
    const data = State.jsonMode === 'projects'
      ? { projects: State.projects, tags: State.tags }
      : State.config;
    editor.value = JSON.stringify(data, null, 2);
    errEl.style.display = 'none';
  }

  document.getElementById('btn-json-projects').addEventListener('click', () => {
    State.jsonMode = 'projects';
    document.getElementById('btn-json-projects').style.cssText = 'border-color:var(--accent);color:var(--accent)';
    document.getElementById('btn-json-config').style.cssText = '';
    loadEditor();
  });

  document.getElementById('btn-json-config').addEventListener('click', () => {
    State.jsonMode = 'config';
    document.getElementById('btn-json-config').style.cssText = 'border-color:var(--accent);color:var(--accent)';
    document.getElementById('btn-json-projects').style.cssText = '';
    loadEditor();
  });

  document.getElementById('btn-json-apply').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(editor.value);
      errEl.style.display = 'none';
      if (State.jsonMode === 'projects') {
        State.projects = parsed.projects || [];
        State.tags     = parsed.tags     || {};
        renderProjectList();
        renderTagsList();
        downloadJson({ projects: State.projects, tags: State.tags }, 'projects.json');
      } else {
        State.config = parsed;
        populateConfigForm();
        downloadJson(State.config, 'config.json');
      }
      showToast('JSON aplicat i exportat correctament.');
    } catch (err) {
      errEl.textContent = 'JSON invàlid: ' + err.message;
      errEl.style.display = '';
    }
  });

  // Load initial
  loadEditor();
}

// ══════════════════════════════════════════════════════
// IMPORT / EXPORT HELPERS
// ══════════════════════════════════════════════════════

function exportProjects() {
  downloadJson({ projects: State.projects, tags: State.tags }, 'projects.json');
  showToast('projects.json exportat. Reemplaça l\'arxiu al repositori.');
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function importJson(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      callback(data);
    } catch {
      showToast('Error llegint el JSON. Verifica el format.', true);
    }
  };
  reader.readAsText(file);
}

// ══════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════

function showToast(message, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  if (isError) {
    toast.style.borderColor = '#dc2626';
    toast.style.color = '#dc2626';
  }
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ══════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════

function _get(id) {
  return document.getElementById(id)?.value || '';
}
function _set(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
function _setColor(id, value) {
  _set(id, value);
  _set(id + '-text', value);
  const picker = document.getElementById(id);
  if (picker && picker.type === 'color') picker.value = value;
}
function _getChecked(id) {
  return document.getElementById(id)?.checked || false;
}
function _setChecked(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = !!value;
}

function _emptyProject() {
  return {
    id: '', visible: true, featured: false, date: new Date().toISOString().split('T')[0],
    projectLanguages: [],
    title: { ca: '', es: '', en: '' },
    shortDescription: { ca: '', es: '', en: '' },
    fullDescription: { ca: '', es: '', en: '' },
    tags: [], images: [],
    links: { github: null, demo: null, docs: null },
  };
}

function _defaultConfig() {
  return {
    site: { author: '', githubUser: '', defaultLang: 'ca', defaultTheme: 'dark' },
    appearance: {
      fontHeading: 'Inter', fontBody: 'Inter', fontMono: 'JetBrains Mono',
      borderRadius: '12px', accentColor: '#22c55e',
      themes: {
        dark:  { bg: '#0a0f0a', surface: '#111811', text: '#e2ece2' },
        light: { bg: '#f0f7f0', surface: '#ffffff',  text: '#0f1f0f' },
      },
    },
    header: {
      title:    { ca: 'Projectes', es: 'Proyectos', en: 'Projects' },
      subtitle: { ca: '', es: '', en: '' },
      showAvatar: false, avatarUrl: '',
    },
    footer: {
      showLicense: true, showGithubLink: true,
      customText: { ca: '', es: '', en: '' },
    },
  };
}
