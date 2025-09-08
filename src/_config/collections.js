const { getAllNotices } = require('../_utils/notices');

/**
 * Collections configuration for Eleventy
 * Defines custom collections for notices, projects, and all notices
 */

module.exports = {
  setup(eleventyConfig) {
    // Custom collections
    eleventyConfig.addCollection("notices", function(collectionApi) {
      return getAllNotices();
    });

    // Add project pages
    eleventyConfig.addCollection("projects", function(collectionApi) {
      const notices = getAllNotices();
      return notices.map(notice => ({
        ...notice,
        url: `/notices/${notice.id}/`,
        data: { project: notice.id, layout: 'project.njk' }
      }));
    });

    // Add notice pages
    eleventyConfig.addCollection("allNotices", function(collectionApi) {
      const notices = getAllNotices();
      const allNotices = [];

      for (const notice of notices) {
        for (const lang of Object.keys(notice.available_languages)) {
          for (const version of notice.available_languages[lang]) {
            allNotices.push({
              project: notice.id,
              lang: lang,
              version: version.version,
              isLatest: version.isLatest,
              content: version.content,
              url: version.isLatest 
                ? `/notices/${notice.id}/${lang}/` 
                : `/notices/${notice.id}/${lang}/archive/${version.version}/`,
              data: { 
                layout: 'notice.njk', 
                project: notice.id, 
                lang: lang 
              }
            });
          }
        }
      }

      return allNotices;
    });
  }
};
