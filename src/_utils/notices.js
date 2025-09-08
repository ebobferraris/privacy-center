const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { readJsonFile, readTextFile, getSubdirectories } = require('./file-utils');

/**
 * Get all notices from the notices directory
 * @returns {Array} Array of notice objects
 */
function getAllNotices() {
  const noticesDir = path.join(__dirname, '../../notices');
  const notices = [];

  if (!fs.existsSync(noticesDir)) {
    console.warn('Notices directory not found:', noticesDir);
    return notices;
  }

  const dirs = getSubdirectories(noticesDir);

  for (const dir of dirs) {
    try {
      const notice = loadNotice(dir, noticesDir);
      if (notice) {
        notices.push(notice);
      }
    } catch (error) {
      console.warn(`Warning: Could not load notice ${dir}:`, error.message);
    }
  }

  return notices;
}

/**
 * Load a single notice from directory
 * @param {string} dir - Directory name
 * @param {string} noticesDir - Base notices directory
 * @returns {Object|null} Notice object or null
 */
function loadNotice(dir, noticesDir) {
  const metadataPath = path.join(noticesDir, dir, 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  const metadata = readJsonFile(metadataPath);
  if (!metadata) {
    return null;
  }

  const availableLanguages = getAvailableLanguages(path.join(noticesDir, dir));

  return {
    id: dir,
    name: metadata.name || dir,
    description: metadata.description || '',
    main_language: metadata.main_language || 'it',
    languages: Object.keys(availableLanguages),
    available_languages: availableLanguages,
  };
}

/**
 * Get available languages for a notice
 * @param {string} noticeDir - Notice directory path
 * @returns {Object} Available languages object
 */
function getAvailableLanguages(noticeDir) {
  const languages = {};
  
  if (!fs.existsSync(noticeDir)) {
    return languages;
  }

  const langDirs = getSubdirectories(noticeDir).filter(dir => dir !== 'metadata.json');

  for (const lang of langDirs) {
    const langPath = path.join(noticeDir, lang);
    const versions = getVersionsForLanguage(langPath);
    if (versions.length > 0) {
      languages[lang] = versions;
    }
  }

  return languages;
}

/**
 * Get versions for a specific language
 * @param {string} langPath - Language directory path
 * @returns {Array} Array of version objects
 */
function getVersionsForLanguage(langPath) {
  const versions = [];
  
  if (!fs.existsSync(langPath)) {
    return versions;
  }

  const items = fs.readdirSync(langPath);

  // Check for latest.md
  const latestPath = path.join(langPath, 'latest.md');
  if (fs.existsSync(latestPath)) {
    const content = readTextFile(latestPath);
    if (content) {
      const { data, content: body } = matter(content);
      versions.push({
        version: data.version || 'latest',
        isLatest: true,
        path: latestPath,
        content: body,
        ...data
      });
    }
  }

  // Check for archive directory
  const archivePath = path.join(langPath, 'archive');
  if (fs.existsSync(archivePath)) {
    const archiveItems = fs.readdirSync(archivePath);
    const versionDirs = archiveItems.filter(item => {
      const fullPath = path.join(archivePath, item);
      return fs.statSync(fullPath).isDirectory() && (item.startsWith('v') || /^\d+\.\d+/.test(item));
    });

    for (const versionDir of versionDirs) {
      const noticePath = path.join(archivePath, versionDir, 'notice.md');
      if (fs.existsSync(noticePath)) {
        const content = readTextFile(noticePath);
        if (content) {
          const { data, content: body } = matter(content);
          versions.push({
            version: data.version || versionDir,
            isLatest: false,
            path: noticePath,
            content: body,
            ...data
          });
        }
      }
    }
  }

  return versions.sort((a, b) => {
    // Sort by version, latest first
    if (a.isLatest) return -1;
    if (b.isLatest) return 1;
    return b.version.localeCompare(a.version);
  });
}

/**
 * Find a notice by ID
 * @param {string} noticeId - Notice ID to find
 * @returns {Object|null} Notice object or null
 */
function findNoticeById(noticeId) {
  const notices = getAllNotices();
  return notices.find(notice => notice.id === noticeId) || null;
}

/**
 * Get all notices for a specific language
 * @param {string} langCode - Language code
 * @returns {Array} Array of notices that support the language
 */
function getNoticesForLanguage(langCode) {
  const notices = getAllNotices();
  return notices.filter(notice => notice.languages.includes(langCode));
}

/**
 * Get the latest version for a notice and language
 * @param {string} noticeId - Notice ID
 * @param {string} langCode - Language code
 * @returns {Object|null} Latest version object or null
 */
function getLatestVersion(noticeId, langCode) {
  const notice = findNoticeById(noticeId);
  if (!notice || !notice.available_languages[langCode]) {
    return null;
  }

  const versions = notice.available_languages[langCode];
  return versions.find(v => v.isLatest) || versions[0] || null;
}

module.exports = {
  getAllNotices,
  loadNotice,
  getAvailableLanguages,
  getVersionsForLanguage,
  findNoticeById,
  getNoticesForLanguage,
  getLatestVersion
};
