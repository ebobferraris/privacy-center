const { loadLocales } = require('../_utils/locales');
const { getAllNotices } = require('../_utils/notices');

/**
 * Data configuration for Eleventy
 * Sets up global data for templates
 */

module.exports = {
  setup(eleventyConfig) {
    // Custom data for notices
    eleventyConfig.addGlobalData("notices", function() {
      return getAllNotices();
    });

    // Load localization data
    eleventyConfig.addGlobalData("locales", function() {
      return loadLocales();
    });

    // Load languages data
    eleventyConfig.addGlobalData("languages", function() {
      return require('../_data/languages.json');
    });
  }
};
