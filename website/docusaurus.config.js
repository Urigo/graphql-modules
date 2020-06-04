module.exports = {
  title: 'GraphQL Modules',
  tagline: 'Enterprise grade tooling for your graphql server',

  url: 'https://graphql-modules.com',
  baseUrl: '/',
  favicon: 'img/favicon/favicon.ico',

  organizationName: 'Urigo',
  projectName: 'graphql-modules',

  themeConfig: {
    disableDarkMode: true,
    sidebarCollapsible: true,
    image: 'img/logo.svg',
    prism: {
      theme: require('prism-react-renderer/themes/nightOwl'),
    },
    navbar: {
      title: 'GraphQL Modules',
      logo: {
        alt: 'GraphQL Modules Logo',
        src: 'img/just-logo.svg',
      },
      links: [
        {
          label: 'Version',
          position: 'left',
          items: [
            {
              label: 'Latest',
              to: '/docs/index',
            },
            {
              label: 'Legacy',
              to: '/docs/legacy/introduction/getting-started',
            },
          ],
        },
        {
          to: '/docs/',
          activeBasePath: '/docs',
          label: 'Documentation',
          position: 'right',
        },
        {
          href: 'https://github.com/Urigo/graphql-modules',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} The Guild`,
      logo: {
        alt: 'GraphQL Modules Logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/index',
            },
            {
              label: `What's a Module`,
              to: 'docs/introduction/modules',
            },
            {
              label: 'Dependency Injection',
              to: 'docs/introduction/dependency-injection',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://the-guild.dev/discord',
            },
            {
              label: 'Other projects',
              href: 'https://the-guild.dev/open-source',
            },
            {
              label: 'Community Meetings',
              href: 'https://github.com/the-guild-org/community-meetings',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Blog',
              href: 'https://the-guild.dev/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Urigo/graphql-modules',
            },
            {
              label: 'Twitter',
              href: 'https://the-guild.dev/twitter',
            },
            {
              label: 'LinkedIn',
              href: 'https://the-guild.dev/linkedin',
            },
          ],
        },
      ],
    },
    announcementBar: {
      id: 'legacy-docs',
      content:
        '<b>Important:</b> This documentation covers GraphQL Modules v1.0. For the v0.x docs, check <a href="/docs/legacy/introduction/getting-started">legacy version</a>.',
      backgroundColor: '#13114a',
      textColor: '#fff',
    },
    googleAnalytics: {
      trackingID: 'UA-128969121-4',
    },
  },
  stylesheets: [
    'https://fonts.googleapis.com/css?family=Lato:300,400,500,600,700,800,900&display=swap',
  ],
  scripts: [
    {
      src: 'https://the-guild.dev/static/banner.js',
      async: true,
      defer: true,
    },
  ],
  presets: [
    [
      require.resolve('@docusaurus/preset-classic'),
      {
        docs: {
          path: 'docs',
          include: ['**/*.md', '**/*.mdx'],
          sidebarPath: require.resolve('./sidebars.js'),
          skipNextRelease: false,
          editUrl:
            'https://github.com/Urigo/graphql-modules/edit/master/website/',
          remarkPlugins: [require('remark-import-partial')],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          cacheTime: 600 * 1001, // 600 sec - cache purge period
          changefreq: 'weekly',
          priority: 0.5,
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve('@docusaurus/plugin-ideal-image'),
      {
        size: 800,
        max: 800,
        min: 200,
        quality: 100,
      },
    ],
  ],
};
