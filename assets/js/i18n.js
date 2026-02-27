/**
 * i18n.js — Internationalization module
 * Loads UI translation JSON and applies to data-i18n elements.
 */

const I18n = (() => {
  let _strings = {};
  let _lang = 'ca';

  /**
   * Load a language file and apply to DOM.
   * @param {string} lang - 'ca' | 'es' | 'en'
   */
  async function load(lang) {
    _lang = lang;
    try {
      const res = await fetch(`i18n/${lang}.json`);
      if (!res.ok) throw new Error(`i18n/${lang}.json not found`);
      _strings = await res.json();
    } catch (e) {
      console.warn('[i18n] Failed to load language:', lang, e);
      _strings = {};
    }
    apply();
  }

  /**
   * Apply translations to all elements with data-i18n attribute.
   * Format: data-i18n="section.key"
   * Optional: data-i18n-attr="placeholder" to set an attribute instead of textContent
   */
  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const value = get(key);
      if (value === null) return;
      const attr = el.dataset.i18nAttr;
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    });
  }

  /**
   * Get a translation string by dot-path key.
   * @param {string} dotPath - e.g. "modal.close"
   * @returns {string|null}
   */
  function get(dotPath) {
    const parts = dotPath.split('.');
    let obj = _strings;
    for (const part of parts) {
      if (obj == null || typeof obj !== 'object') return null;
      obj = obj[part];
    }
    return typeof obj === 'string' ? obj : null;
  }

  /**
   * Current active language code.
   */
  function current() {
    return _lang;
  }

  return { load, apply, get, current };
})();
