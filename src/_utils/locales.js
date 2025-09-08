const fs = require('fs');
const path = require('path');
const { readJsonFile, getFilesByExtension } = require('./file-utils');

/**
 * Load all locale files
 * @returns {Object} Locales object
 */
function loadLocales() {
  const localesDir = path.join(__dirname, '../_data/locales');
  const locales = {};

  if (!fs.existsSync(localesDir)) {
    console.warn('Locales directory not found:', localesDir);
    return locales;
  }

  const localeFiles = getFilesByExtension(localesDir, '.json');

  for (const file of localeFiles) {
    try {
      const langCode = file.replace('.json', '');
      const filePath = path.join(localesDir, file);
      const content = readJsonFile(filePath);
      
      if (content) {
        locales[langCode] = content;
      }
    } catch (error) {
      console.warn(`Warning: Could not load locale file ${file}:`, error.message);
    }
  }

  return locales;
}

/**
 * Get a specific locale by language code
 * @param {string} langCode - Language code (e.g., 'it', 'en')
 * @returns {Object|null} Locale object or null
 */
function getLocale(langCode) {
  const locales = loadLocales();
  return locales[langCode] || null;
}

/**
 * Get all available language codes
 * @returns {Array} Array of language codes
 */
function getAvailableLanguageCodes() {
  const locales = loadLocales();
  return Object.keys(locales);
}

/**
 * Check if a language code is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if language is supported
 */
function isLanguageSupported(langCode) {
  const locales = loadLocales();
  return langCode in locales;
}

module.exports = {
  loadLocales,
  getLocale,
  getAvailableLanguageCodes,
  isLanguageSupported
};
