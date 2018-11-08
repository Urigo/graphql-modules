/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [

];

const siteConfig = {
  title: 'GraphQL Modules', // Title for your website.
  tagline: 'Enterprise grade tooling for your graphql server',
  url: 'http://graphql-modules.com/', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',
  // Custom URLs which are used by the views
  githubUrl: 'https://github.com/Urigo/graphql-modules',
  mediumUrl: 'https://medium.com/the-guild',
  // Used for publishing and more
  projectName: 'graphql-modules',
  organizationName: 'urigo',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'introduction/getting-started', label: 'DOCUMENTATION' },
    { doc: 'api/core/api-readme', label: 'API REFERENCE' },
    { href: 'https://github.com/Urigo/graphql-modules', label: 'GITHUB' },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/logo.svg',
  footerIcon: 'img/logo.svg',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#13114a',
    secondaryColor: '#181E25',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} The Guild`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  usePrism: true,

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/gql-modules-cover.png',
  twitterImage: 'img/gql-modules-cover.png',

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',

  gaGtag: true,
  gaTrackingId: 'UA-128969121-4',
};

module.exports = siteConfig;
