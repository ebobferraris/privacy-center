/**
 * Eleventy Configuration
 * Modular configuration for Privacy Hub static site generator
 */

// Import modular configurations
const collections = require('./src/_config/collections');
const filters = require('./src/_config/filters');
const data = require('./src/_config/data');
const passthrough = require('./src/_config/passthrough');

module.exports = function(eleventyConfig) {
  // Copy static assets
  passthrough.setup(eleventyConfig);
  
  // Watch for changes
  eleventyConfig.addWatchTarget("notices/");
  eleventyConfig.addWatchTarget("src/_data/locales/");
  
  // Setup collections
  collections.setup(eleventyConfig);
  
  // Setup global data
  data.setup(eleventyConfig);
  
  // Setup filters
  filters.setup(eleventyConfig);
  
  // Markdown configuration
  setupMarkdown(eleventyConfig);
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    pathPrefix: process.env.NODE_ENV === 'development' ? '' : '/privacy-hub/'
  };
};

/**
 * Setup Markdown processing with markdown-it
 * @param {Object} eleventyConfig - Eleventy configuration object
 */
function setupMarkdown(eleventyConfig) {
  const markdownIt = require("markdown-it");
  const markdownItAnchor = require("markdown-it-anchor");
  
  const options = {
    html: true,
    breaks: true,
    linkify: true
  };
  
  const markdownLib = markdownIt(options).use(markdownItAnchor);
  eleventyConfig.setLibrary("md", markdownLib);
  
  eleventyConfig.addFilter("markdown", function(content) {
    return markdownLib.render(content || '');
  });
}