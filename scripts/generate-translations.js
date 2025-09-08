#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script per generare automaticamente translations.js dai file JSON delle locales
 * Questo elimina la duplicazione manuale e garantisce la sincronizzazione
 */

function generateTranslationsJS() {
  console.log('🔄 Generating translations.js from locale files...');
  
  const localesDir = path.join(__dirname, '../src/_data/locales');
  const outputFile = path.join(__dirname, '../src/js/translations.js');
  const locales = {};
  
  // Verifica che la directory delle locales esista
  if (!fs.existsSync(localesDir)) {
    console.error('❌ Locales directory not found:', localesDir);
    process.exit(1);
  }
  
  // Carica tutti i file JSON delle locales
  const localeFiles = fs.readdirSync(localesDir).filter(file => file.endsWith('.json'));
  
  if (localeFiles.length === 0) {
    console.error('❌ No locale files found in:', localesDir);
    process.exit(1);
  }
  
  console.log(`📁 Found ${localeFiles.length} locale files:`, localeFiles.join(', '));
  
  // Carica ogni file JSON
  for (const file of localeFiles) {
    try {
      const langCode = file.replace('.json', '');
      const filePath = path.join(localesDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      locales[langCode] = content;
      console.log(`✅ Loaded ${langCode} translations`);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
      process.exit(1);
    }
  }
  
  // Genera il contenuto del file JavaScript
  const jsContent = `// Multilingual System for Privacy Center
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}
// Source: src/_data/locales/*.json

const translations = ${JSON.stringify(locales, null, 2)};

// Language detection and management
class LanguageManager {
  constructor() {
    this.translations = translations;
    this.currentLang = this.detectLanguage();
    this.observers = new Set();
  }

  detectLanguage() {
    try {
      // For project/notice pages, always respect sessionStorage
      const currentPath = window.location.pathname;
      const isProjectOrNoticePage = currentPath.includes('/notices/');
      
      if (isProjectOrNoticePage) {
        const sessionLang = sessionStorage.getItem('selectedLanguage');
        if (sessionLang && this.translations[sessionLang]) {
          return sessionLang;
        }
      }

      // Check sessionStorage first (user's selected language)
      const sessionLang = sessionStorage.getItem('selectedLanguage');
      if (sessionLang && this.translations[sessionLang]) {
        return sessionLang;
      }

      // Check URL path
      const pathLang = window.location.pathname.split('/')[1];
      if (pathLang && this.translations[pathLang]) {
        return pathLang;
      }

      // Check localStorage
      const storedLang = localStorage.getItem('privacy-center-lang');
      if (storedLang && this.translations[storedLang]) {
        return storedLang;
      }

      // Check browser language
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.split('-')[0];
        if (this.translations[browserLang]) {
          return browserLang;
        }
      }

      // Default to Italian
      return 'it';
    } catch (error) {
      console.error('Error detecting language:', error);
      return 'it'; // Fallback to default
    }
  }

  setLanguage(lang) {
    try {
      if (this.translations[lang]) {
        this.currentLang = lang;

        // Safely store in localStorage
        if (typeof Storage !== 'undefined') {
          try {
            localStorage.setItem('privacy-center-lang', lang);
          } catch (storageError) {
            console.warn('Error storing language in localStorage:', storageError);
          }
        }

        // Store in sessionStorage for immediate use
        sessionStorage.setItem('selectedLanguage', lang);

        // Notify all observers
        this.observers.forEach(callback => {
          try {
            callback(lang);
          } catch (error) {
            console.error('Error in language change observer:', error);
          }
        });

        // Update URL if not already correct (only in production)
        if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
          const currentPath = window.location.pathname;
          const pathLang = currentPath.split('/')[1];

          if (pathLang !== lang) {
            const newPath = currentPath.replace(/^\\\/[^\\\/]*/, \`/\${lang}\`);
            window.location.href = newPath;
          }
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting language:', error);
      return false;
    }
  }

  getTranslation(key, fallback = '') {
    try {
      if (!key || typeof key !== 'string') {
        console.warn('Invalid translation key:', key);
        return fallback;
      }

      // For project/notice pages, always check sessionStorage first
      const currentPath = window.location.pathname;
      const isProjectOrNoticePage = currentPath.includes('/notices/');
      
      let targetLang = this.currentLang;
      if (isProjectOrNoticePage) {
        const sessionLang = sessionStorage.getItem('selectedLanguage');
        if (sessionLang && this.translations[sessionLang]) {
          targetLang = sessionLang;
        }
      }

      const keys = key.split('.');
      let value = this.translations[targetLang];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      return (typeof value === 'string') ? value : fallback;
    } catch (error) {
      console.error('Error getting translation for key:', key, error);
      return fallback;
    }
  }

  getCurrentTranslations() {
    try {
      return this.translations[this.currentLang] || {};
    } catch (error) {
      console.error('Error getting current translations:', error);
      return {};
    }
  }

  getAvailableLanguages() {
    try {
      return Object.keys(this.translations);
    } catch (error) {
      console.error('Error getting available languages:', error);
      return ['it']; // Fallback to default
    }
  }

  // Pattern Observer per aggiornamenti automatici
  subscribe(callback) {
    this.observers.add(callback);
  }

  unsubscribe(callback) {
    this.observers.delete(callback);
  }

  // Genera chiavi dinamiche per le lingue
  getViewInLanguageKey(langCode) {
    const langMap = { it: 'It', en: 'En', fr: 'Fr', de: 'De', sl: 'Sl' };
    return \`viewIn\${langMap[langCode] || langCode.toUpperCase()}\`;
  }

  // Sostituisce parametri in una stringa di traduzione
  replaceParams(translation, params = {}) {
    if (typeof translation !== 'string' || !params) {
      return translation;
    }

    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(\`{\${param}}\`, 'g'), params[param]);
    });
    return result;
  }
}

// Global language manager instance
const langManager = new LanguageManager();

// Export for global use
window.LanguageManager = LanguageManager;
window.langManager = langManager;

// Auto-update translatable elements when language changes
langManager.subscribe((newLang) => {
  console.log('Language changed to:', newLang);
  
  // Update all elements with data-translate attribute
  const translatableElements = document.querySelectorAll('[data-translate]');
  translatableElements.forEach(element => {
    try {
      const key = element.getAttribute('data-translate');
      const paramsAttr = element.getAttribute('data-translate-params');
      
      let translation = langManager.getTranslation(key);
      
      // Handle special cases
      if (key === 'ui.chooseLanguage' || key === 'chooseLanguage') {
        const appName = element.closest('.notice-placeholder')?.querySelector('h1')?.textContent?.split(' - ')[0];
        if (appName) {
          translation = langManager.replaceParams(translation, { app: appName });
        }
      }
      
      // Handle parameters from data attribute
      if (paramsAttr) {
        try {
          const params = JSON.parse(paramsAttr);
          translation = langManager.replaceParams(translation, params);
        } catch (error) {
          console.warn('Invalid data-translate-params:', paramsAttr);
        }
      }
      
      if (translation && translation !== key) {
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
          element.placeholder = translation;
        } else if (element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    } catch (error) {
      console.error('Error updating translatable element:', error);
    }
  });
  
  // Update elements with data-translate-title attribute
  const titleElements = document.querySelectorAll('[data-translate-title]');
  titleElements.forEach(element => {
    try {
      const key = element.getAttribute('data-translate-title');
      const translation = langManager.getTranslation(key);
      if (translation && translation !== key) {
        element.title = translation;
      }
    } catch (error) {
      console.error('Error updating title element:', error);
    }
  });
});

// Initialize translations on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing translations...');
  
  // Wait a bit to ensure all scripts are loaded
  setTimeout(() => {
    try {
      // Update all translatable elements immediately
      const translatableElements = document.querySelectorAll('[data-translate]');
      translatableElements.forEach(element => {
        try {
          const key = element.getAttribute('data-translate');
          const paramsAttr = element.getAttribute('data-translate-params');
          
          let translation = langManager.getTranslation(key);
          
          // Handle special cases
          if (key === 'ui.chooseLanguage' || key === 'chooseLanguage') {
            const appName = element.closest('.notice-placeholder')?.querySelector('h1')?.textContent?.split(' - ')[0];
            if (appName) {
              translation = langManager.replaceParams(translation, { app: appName });
            }
          }
          
          // Handle parameters from data attribute
          if (paramsAttr) {
            try {
              const params = JSON.parse(paramsAttr);
              translation = langManager.replaceParams(translation, params);
            } catch (error) {
              console.warn('Invalid data-translate-params:', paramsAttr);
            }
          }
          
          if (translation && translation !== key) {
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
              element.placeholder = translation;
            } else if (element.tagName === 'TEXTAREA') {
              element.placeholder = translation;
            } else {
              element.textContent = translation;
            }
          }
        } catch (error) {
          console.error('Error updating translatable element:', error);
        }
      });
      
      // Update elements with data-translate-title attribute
      const titleElements = document.querySelectorAll('[data-translate-title]');
      titleElements.forEach(element => {
        try {
          const key = element.getAttribute('data-translate-title');
          const translation = langManager.getTranslation(key);
          if (translation && translation !== key) {
            element.title = translation;
          }
        } catch (error) {
          console.error('Error updating title element:', error);
        }
      });
      
      console.log('Initial translations applied');
    } catch (error) {
      console.error('Error applying initial translations:', error);
    }
  }, 100);
});

// Global function to update all translatable elements (for compatibility with main.js)
window.updateAllTranslatableElements = function() {
  try {
    // Update all translatable elements immediately
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
      try {
        const key = element.getAttribute('data-translate');
        const paramsAttr = element.getAttribute('data-translate-params');
        
        let translation = langManager.getTranslation(key);
        
        // Handle special cases
        if (key === 'ui.chooseLanguage' || key === 'chooseLanguage') {
          const appName = element.closest('.notice-placeholder')?.querySelector('h1')?.textContent?.split(' - ')[0];
          if (appName) {
            translation = langManager.replaceParams(translation, { app: appName });
          }
        }
        
        // Handle parameters from data attribute
        if (paramsAttr) {
          try {
            const params = JSON.parse(paramsAttr);
            translation = langManager.replaceParams(translation, params);
          } catch (error) {
            console.warn('Invalid data-translate-params:', paramsAttr);
          }
        }
        
        if (translation && translation !== key) {
          if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
            element.placeholder = translation;
          } else if (element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
          } else {
            element.textContent = translation;
          }
        }
      } catch (error) {
        console.error('Error updating translatable element:', error);
      }
    });
    
    // Update elements with data-translate-title attribute
    const titleElements = document.querySelectorAll('[data-translate-title]');
    titleElements.forEach(element => {
      try {
        const key = element.getAttribute('data-translate-title');
        const translation = langManager.getTranslation(key);
        if (translation && translation !== key) {
          element.title = translation;
        }
      } catch (error) {
        console.error('Error updating title element:', error);
      }
    });
    
    console.log('All translatable elements updated');
  } catch (error) {
    console.error('Error updating all translatable elements:', error);
  }
};

console.log('✅ Language system initialized with', Object.keys(translations).length, 'languages');
`;

  // Scrivi il file
  try {
    fs.writeFileSync(outputFile, jsContent, 'utf8');
    console.log(`✅ Generated translations.js with ${Object.keys(locales).length} languages`);
    console.log(`📄 Output file: ${outputFile}`);
    
    // Verifica che il file sia stato scritto correttamente
    const stats = fs.statSync(outputFile);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error writing translations.js:', error.message);
    process.exit(1);
  }
}

// Esegui la generazione se chiamato direttamente
if (require.main === module) {
  generateTranslationsJS();
}

module.exports = { generateTranslationsJS };
