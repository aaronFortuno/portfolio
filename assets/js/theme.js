/**
 * theme.js — Theme and appearance module
 * Loads config.json, applies CSS custom properties, manages dark/light toggle.
 */

const Theme = (() => {
  let _config = null;
  let _current = 'dark';

  /**
   * Load config.json and apply appearance.
   * @returns {Promise<object>} config
   */
  async function init() {
    try {
      const res = await fetch('data/config.json');
      if (!res.ok) throw new Error('config.json not found');
      _config = await res.json();
    } catch (e) {
      console.warn('[Theme] Failed to load config.json, using defaults.', e);
      _config = _defaults();
    }

    // Determine initial theme: localStorage > config default
    _current = localStorage.getItem('portfolio-theme')
      || _config.site?.defaultTheme
      || 'dark';

    apply(_current);
    applyAppearance();
    return _config;
  }

  /**
   * Apply a theme (dark|light) to the document root.
   */
  function apply(theme) {
    _current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    _applyThemeColors(theme);
    _updateToggleButton(theme);
  }

  /**
   * Toggle between dark and light.
   */
  function toggle() {
    apply(_current === 'dark' ? 'light' : 'dark');
  }

  /**
   * Apply all appearance variables from config.json to :root.
   */
  function applyAppearance() {
    if (!_config?.appearance) return;
    const a = _config.appearance;
    const root = document.documentElement;
    if (a.fontHeading) root.style.setProperty('--font-heading', `'${a.fontHeading}', system-ui, sans-serif`);
    if (a.fontBody)    root.style.setProperty('--font-body',    `'${a.fontBody}', system-ui, sans-serif`);
    if (a.fontMono)    root.style.setProperty('--font-mono',    `'${a.fontMono}', monospace`);
    if (a.borderRadius) root.style.setProperty('--radius', a.borderRadius);
    if (a.cardShadow)   root.style.setProperty('--shadow', a.cardShadow);
    if (a.accentColor) {
      root.style.setProperty('--accent', a.accentColor);
      root.style.setProperty('--accent-glow', _hexToRgba(a.accentColor, 0.15));
    }
  }

  function _applyThemeColors(theme) {
    const colors = _config?.appearance?.themes?.[theme];
    if (!colors) return;
    const root = document.documentElement;
    if (colors.bg)           root.style.setProperty('--bg',            colors.bg);
    if (colors.surface)      root.style.setProperty('--surface',       colors.surface);
    if (colors.surfaceHover) root.style.setProperty('--surface-hover', colors.surfaceHover);
    if (colors.text)         root.style.setProperty('--text',          colors.text);
    if (colors.textMuted)    root.style.setProperty('--text-muted',    colors.textMuted);
    if (colors.border)       root.style.setProperty('--border',        colors.border);
  }

  function _updateToggleButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☽';
    btn.setAttribute('aria-label', I18n.get('aria.themeToggle') || 'Toggle theme');
    btn.title = theme === 'dark'
      ? (I18n.get('theme.light') || 'Light mode')
      : (I18n.get('theme.dark')  || 'Dark mode');
  }

  function _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function _defaults() {
    return {
      site: { defaultTheme: 'dark', defaultLang: 'ca', author: '', githubUser: '' },
      appearance: { accentColor: '#22c55e', borderRadius: '12px' },
      header: { title: { ca: 'Projectes', es: 'Proyectos', en: 'Projects' }, subtitle: {}, showAvatar: false },
      footer: { showLicense: true, showGithubLink: true, customText: {} }
    };
  }

  function config() { return _config; }
  function current() { return _current; }

  return { init, apply, toggle, applyAppearance, config, current };
})();
