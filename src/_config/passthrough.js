/**
 * Passthrough configuration for Eleventy
 * Handles copying static assets to the output directory
 */

module.exports = {
  setup(eleventyConfig) {
    // Copy static assets
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
  }
};
