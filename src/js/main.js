// Main JavaScript for Privacy Center
function safeQuerySelector(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`Error querying selector "${selector}":`, error);
    return null;
  }
}

function safeQuerySelectorAll(selector) {
  try {
    return document.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Error querying selector "${selector}":`, error);
    return [];
  }
}

function safeGetElementById(id) {
  try {
    return document.getElementById(id);
  } catch (error) {
    console.warn(`Error getting element by ID "${id}":`, error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    initializeRedirects();
    initializeLanguageSystem();
    initializeVersionSelector();
    initializeSearch();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});

function initializeRedirects() {
  const redirectElements = safeQuerySelectorAll('[data-redirect-to]');
  redirectElements.forEach(element => {
    if (element) {
      const redirectUrl = element.getAttribute('data-redirect-to');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  });
}

function initializeLanguageSystem() {
  if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
    updatePageTranslations();
    updateLanguageDropdownDisplay();
  } else {
    setTimeout(initializeLanguageSystem, 10);
  }
}

function updatePageTranslations() {
  try {
    const translatableElements = safeQuerySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
      if (element) {
        const key = element.getAttribute('data-translate');
        let translation = window.langManager.getTranslation(key);
        if (translation) {
          if (key === 'chooseLanguage') {
            const appName = element.closest('.notice-placeholder').querySelector('h1').textContent.split(' - ')[0];
            translation = translation.replace('{app}', appName);
          }

          if (element.tagName === 'INPUT' && element.type === 'placeholder') {
            element.placeholder = translation;
          } else {
            element.textContent = translation;
          }
        }
      }
    });

    const titleElements = safeQuerySelectorAll('[data-translate-title]');
    titleElements.forEach(element => {
      if (element) {
        const key = element.getAttribute('data-translate-title');
        const translation = window.langManager.getTranslation(key);
        if (translation) {
          element.title = translation;
        }
      }
    });
  } catch (error) {
    console.error('Error updating page translations:', error);
  }
}



function initializeSearch() {
  try {
    const searchInput = safeGetElementById('search-input');
    const searchButton = safeGetElementById('search-button');

    if (searchInput && searchButton) {
      if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
        const placeholderText = window.langManager.getTranslation('searchPlaceholder');
        const buttonText = window.langManager.getTranslation('search');
        if (placeholderText) searchInput.placeholder = placeholderText;
        if (buttonText) searchButton.textContent = buttonText;
      }

      searchButton.addEventListener('click', performSearch);
      searchInput.addEventListener('input', performSearch);
    }
  } catch (error) {
    console.error('Error initializing search:', error);
  }
}

function performSearch() {
  try {
    const searchInput = safeGetElementById('search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const cards = safeQuerySelectorAll('.notice-card');

    cards.forEach(card => {
      if (card) {
        const titleElement = card.querySelector('h3');
        const descriptionElement = card.querySelector('p');

        if (titleElement && descriptionElement) {
          const title = titleElement.textContent.toLowerCase();
          const description = descriptionElement.textContent.toLowerCase();

          if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
  }
}

function initializeVersionSelector(retryCount = 0) {
  const versionSelects = safeQuerySelectorAll('#version-select');
  
  if (versionSelects.length === 0) {
    const maxRetries = 10;
    if (retryCount < maxRetries) {
      const delay = Math.min(100 * Math.pow(1.5, retryCount), 1000);
      setTimeout(() => initializeVersionSelector(retryCount + 1), delay);
    }
    return;
  }
  
  versionSelects.forEach(select => {
    if (select) {
      select.addEventListener('change', function(e) {
        const version = e.target.value;
        loadVersionContent(version);
      });
    }
  });
}

function loadVersionContent(version) {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/').filter(part => part);
  
  const noticesIndex = pathParts.indexOf('notices');
  if (noticesIndex === -1 || pathParts.length < noticesIndex + 3) {
    console.error('Invalid URL structure for version navigation');
    return;
  }
  
  const app = pathParts[noticesIndex + 1];
  const lang = pathParts[noticesIndex + 2];
  
  const versionSelect = document.getElementById('version-select');
  const latestVersion = versionSelect ? versionSelect.getAttribute('data-latest-version') : null;
  
  const basePath = currentPath.startsWith('/privacy-center') ? '/privacy-center' : '';
  
  let newUrl;
  if (version === latestVersion) {
    newUrl = `${basePath}/notices/${app}/${lang}/`;
  } else {
    const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
    newUrl = `${basePath}/notices/${app}/${lang}/archive/${cleanVersion}/`;
  }
  
  if (currentPath === newUrl || currentPath === newUrl + '/') {
    return;
  }
  
  window.location.href = newUrl;
}

function getLanguageName(code) {
  if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
    return window.langManager.getTranslation(`languages.${code}`) || code.toUpperCase();
  }
  const names = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español' };
  return names[code] || code.toUpperCase();
}

function compareVersions(version1, version2) {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

// Language dropdown functionality
function toggleLanguageDropdown() {
  const menu = safeGetElementById('language-menu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

function changeLanguage(lang) {
  try {
    // Store selected language in sessionStorage
    sessionStorage.setItem('selectedLanguage', lang);

    // Check if we're on the home page (server-side translated pages)
    const currentPath = window.location.pathname;
    const basePath = window.location.pathname.includes('/privacy-center/') ? '/privacy-center' : '';
    
    const homePagePatterns = [
      basePath + '/',
      basePath + '/it/',
      basePath + '/en/',
      basePath + '/fr/',
      basePath + '/de/',
      basePath + '/sl/'
    ];
    
    if (homePagePatterns.includes(currentPath)) {
      // We're on a language page, redirect to the new language page (server-side translation)
      const newUrl = window.location.origin + basePath + '/' + lang + '/';
      window.location.href = newUrl;
    } else {
      // We're on a notice/project page, redirect to homepage in new language
      const newUrl = window.location.origin + basePath + '/' + lang + '/';
      window.location.href = newUrl;
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
}

// Update the language dropdown display based on sessionStorage
function updateLanguageDropdownDisplay() {
  try {
    const currentLangElement = safeQuerySelector('.current-lang');
    if (!currentLangElement) return;

    // Check sessionStorage first for user's selected language
    let storedLang = sessionStorage.getItem('selectedLanguage');

    // If no stored language, set Italian as default
    if (!storedLang) {
      storedLang = 'it';
      sessionStorage.setItem('selectedLanguage', 'it');
    }

    if (storedLang && typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
      // For project/notice pages, don't override the language - it's already set correctly by detectLanguage()
      const currentPath = window.location.pathname;
      const isProjectOrNoticePage = currentPath.includes('/notices/');
      
      if (!isProjectOrNoticePage) {
        // Update langManager to use stored language (only for non-project/notice pages)
        window.langManager.currentLang = storedLang;
      }

      // Update the display with the stored language
      const currentLangText = window.langManager.getTranslation('currentLang');
      if (currentLangText) {
        currentLangElement.textContent = currentLangText;
      }
    }
  } catch (error) {
    console.error('Error updating language dropdown display:', error);
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = safeGetElementById('language-dropdown');
  const menu = safeGetElementById('language-menu');

  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove('show');
  }
});

// Show translation warning banner if needed
function showTranslationWarning() {
  try {
    const warningBanner = safeGetElementById('translation-warning');
    if (warningBanner) {
      // Check if we arrived here because translation was not available
      const urlParams = new URLSearchParams(window.location.search);
      const showWarning = urlParams.get('warning') === 'translation-unavailable';

      // Also check referrer - if coming from homepage, might need warning
      const referrer = document.referrer;
      const isFromHomepage = referrer && (
        referrer.includes('/en/') ||
        referrer.includes('/fr/') ||
        referrer.includes('/de/') ||
        referrer.includes('/sl/')
      );

      if (showWarning || (isFromHomepage && !window.location.pathname.includes('/it/'))) {
        warningBanner.style.display = 'block';

        // Scroll to warning after a short delay
        setTimeout(() => {
          try {
            warningBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } catch (scrollError) {
            console.warn('Error scrolling to warning banner:', scrollError);
          }
        }, 500);
      }
    }
  } catch (error) {
    console.error('Error showing translation warning:', error);
  }
}

// Initialize warning banner on page load
document.addEventListener('DOMContentLoaded', function() {
  try {
    showTranslationWarning();
  } catch (error) {
    console.error('Error showing translation warning:', error);
  }
});

