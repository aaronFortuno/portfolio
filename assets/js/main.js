/**
 * main.js — Application orchestrator
 * Initializes all modules in order and wires up global interactions.
 */

const App = (() => {
  let _projectsData = null;

  async function init() {
    // 1. Load theme + config (applies CSS vars, reads defaultLang)
    const config = await Theme.init();

    // 2. Determine initial language
    const savedLang = localStorage.getItem('portfolio-lang');
    const lang = savedLang || config.site?.defaultLang || 'ca';

    // 3. Load i18n strings
    await I18n.load(lang);

    // 4. Load project data
    try {
      const res = await fetch('data/projects.json');
      if (!res.ok) throw new Error('projects.json not found');
      _projectsData = await res.json();
    } catch (e) {
      console.error('[App] Failed to load projects.json', e);
      _showLoadError();
      return;
    }

    const projects = _projectsData.projects || [];
    const tags     = _projectsData.tags     || {};

    // 5. Apply header/footer from config
    _applyHeaderFooter(config, lang);

    // 6. Setup lang selector
    _setupLangSelector(lang, config, projects, tags);

    // 7. Setup theme toggle
    _setupThemeToggle();

    // 8. Init about section
    _setupAbout();

    // 9. Init modal
    Modal.init(tags);

    // 10. Init renderer
    Renderer.setData(projects, tags);

    // 11. Init filters → on change → re-render grid
    Filters.init(projects, tags, () => renderGrid());

    // 12. Initial render
    renderGrid();
  }

  function renderGrid() {
    const all      = Renderer.allProjects().filter(p => p.visible !== false);
    const filtered = Filters.apply(all);
    Renderer.render(filtered);
  }

  function _applyHeaderFooter(config, lang) {
    const h = config.header || {};
    const f = config.footer || {};
    const t = (obj) => obj?.[lang] || obj?.ca || obj?.es || obj?.en || '';

    // Title
    const titleEl = document.getElementById('header-title');
    if (titleEl) titleEl.textContent = t(h.title) || 'Projectes';

    // Subtitle
    const subEl = document.getElementById('header-subtitle');
    if (subEl) subEl.textContent = t(h.subtitle) || '';

    // Avatar
    const avatarEl = document.getElementById('header-avatar');
    if (avatarEl) {
      if (h.showAvatar && h.avatarUrl) {
        avatarEl.src = h.avatarUrl;
        avatarEl.style.display = '';
      } else {
        avatarEl.style.display = 'none';
      }
    }

    // Footer
    const licenseEl = document.getElementById('footer-license');
    if (licenseEl) licenseEl.style.display = f.showLicense ? '' : 'none';

    const githubLinkEl = document.getElementById('footer-github');
    if (githubLinkEl) {
      if (f.showGithubLink && config.site?.githubUser) {
        githubLinkEl.href = `https://github.com/${config.site.githubUser}`;
        githubLinkEl.style.display = '';
      } else {
        githubLinkEl.style.display = 'none';
      }
    }

    const customTextEl = document.getElementById('footer-custom');
    if (customTextEl) {
      const ct = t(f.customText);
      customTextEl.textContent = ct || '';
      customTextEl.style.display = ct ? '' : 'none';
    }
  }

  function _setupAbout() {
    const toggle = document.getElementById('about-toggle');
    const content = document.getElementById('about-content');
    if (!toggle || !content) return;

    // Render about content with markdown
    _renderAboutContent();

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      content.hidden = expanded;
    });
  }

  function _renderAboutContent() {
    const textEl = document.getElementById('about-text');
    const v4vEl = document.getElementById('about-v4v');
    if (textEl) {
      const raw = I18n.get('about.text') || '';
      textEl.innerHTML = (typeof marked !== 'undefined') ? marked.parse(raw) : raw.replace(/\n/g, '<br>');
    }
    if (v4vEl) {
      v4vEl.textContent = I18n.get('about.v4v') || '';
    }
  }

  function _setupLangSelector(currentLang, config, projects, tags) {
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.value = currentLang;
    sel.addEventListener('change', async () => {
      const newLang = sel.value;
      localStorage.setItem('portfolio-lang', newLang);
      await I18n.load(newLang);
      _applyHeaderFooter(config, newLang);
      _renderAboutContent();
      Filters.refresh();
      renderGrid();
    });
  }

  function _setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => Theme.toggle());
  }

  function _showLoadError() {
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = `<div class="empty-state">
        <p style="color:var(--accent)">⚠ No s'ha pogut carregar projects.json</p>
      </div>`;
    }
  }

  return { init, renderGrid };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', () => App.init());
