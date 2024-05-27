const autoprefixer = require('autoprefixer');
const htmlmin = require('html-minifier');
const json5 = require('json5');
const md = require('markdown-it');
const mdAnchor = require('markdown-it-anchor');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const postcss = require('postcss');
const slinkity = require('slinkity');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const tailwindcss = require('tailwindcss');
const vue = require('@slinkity/vue');
const { DateTime } = require('luxon');

module.exports = function (eleventyConfig) {
  /** data formats */
  eleventyConfig.addDataExtension("json", contents => json5.parse(contents));
  eleventyConfig.addDataExtension("json5", contents => json5.parse(contents));

  /** plugins */
  eleventyConfig.addPlugin(slinkity.plugin, slinkity.defineConfig({
    islandsDir: '_islands',
    buildTempDir: '.build',
    renderers: [vue()],
  }));
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.setLibrary('md', md({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true
    })
    .use(mdAnchor, {
      level: [2],
      permalink: mdAnchor.permalink.headerLink({ safariReaderFix: true }),
      permalinkBefore: true,
      permalinkSymbol: ''
    })
  );

  /** transformers */
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (process.env.ELEVENTY_PRODUCTION 
        && outputPath 
        && outputPath.endsWith('.html')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified
    }

    return content
  });

  /** Collections */
  eleventyConfig.addCollection('posts', collection => {
    return collection.getFilteredByGlob('**/posts/*.md').reverse()
  });
  eleventyConfig.addCollection('latestPosts', collection => {
    return collection
      .getFilteredByGlob('**/posts/*.md')
      .slice(-5)
      .reverse()
  });

  /**
   * Why copy the /public directory?
   * 
   * Slinkity uses Vite (https://vitejs.dev) under the hood for processing styles and JS resources
   * This tool encourages a /public directory for your static assets like social images
   * To ensure this directory is discoverable by Vite, we copy it to our 11ty build output like so:
   */
  let copyOptions = {
		debug: true, // log debug information
    expand: false,
    overwrite: true,
    junk: false,
	};
  eleventyConfig.setServerPassthroughCopyBehavior("copy");
  eleventyConfig.addPassthroughCopy('public');
  eleventyConfig.addPassthroughCopy({
    './node_modules/alpinejs/dist/cdn.js': 'public/assets/js/alpine.js',
  }, copyOptions)

  eleventyConfig.addNunjucksAsyncFilter('postcss', (cssCode, done) => {
    postcss([tailwindcss(require('./tailwind.config.js')), autoprefixer()])
      .process(cssCode)
      .then(
        (r) => done(null, r.css),
        (e) => done(e, null)
      );
  });

  /** watch */
  eleventyConfig.addWatchTarget('config/tailwind.config.js');
  eleventyConfig.addWatchTarget('styles/tailwind.css');

  /** short codes */
  eleventyConfig.addShortcode('version', function () {
    return String(Date.now());
  })

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      layouts: '_includes/_layouts',
      data: '_data',
    },
    passthroughFileCopy: true
  }
}