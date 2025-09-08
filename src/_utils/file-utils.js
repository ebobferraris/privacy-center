const fs = require('fs');
const path = require('path');

/**
 * Safely read a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON or null
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Error reading JSON file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Safely read a text file
 * @param {string} filePath - Path to text file
 * @returns {string|null} File content or null
 */
function readTextFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.warn(`Error reading text file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Check if a directory exists and is readable
 * @param {string} dirPath - Directory path
 * @returns {boolean} True if directory exists and is readable
 */
function isDirectoryReadable(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Get all subdirectories of a directory
 * @param {string} dirPath - Directory path
 * @returns {Array} Array of directory names
 */
function getSubdirectories(dirPath) {
  try {
    if (!isDirectoryReadable(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath).filter(item => {
      const fullPath = path.join(dirPath, item);
      return fs.statSync(fullPath).isDirectory();
    });
  } catch (error) {
    console.warn(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Get all files in a directory with a specific extension
 * @param {string} dirPath - Directory path
 * @param {string} extension - File extension (e.g., '.json', '.md')
 * @returns {Array} Array of file names
 */
function getFilesByExtension(dirPath, extension) {
  try {
    if (!isDirectoryReadable(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath).filter(file => file.endsWith(extension));
  } catch (error) {
    console.warn(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

module.exports = {
  readJsonFile,
  readTextFile,
  isDirectoryReadable,
  getSubdirectories,
  getFilesByExtension
};
