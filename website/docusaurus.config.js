module.exports = {
  title: 'GraphQL Modules',
  tagline: 'Enterprise grade tooling for your graphql server',

  url: 'https://graphql-modules.com',
  baseUrl: '/',
  favicon: 'img/favicon/favicon.ico',

  organizationName: 'Urigo',
  projectName: 'graphql-modules',

  onBrokenLinks: 'throw',

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
    },
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
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'left',
        },
        {
          to: 'docs/index',
          activeBasePath: 'docs',
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
              to: 'docs/get-started',
            },
            {
              label: `Essentials`,
              to: 'docs/essentials/type-definitions',
            },
            {
              label: 'Dependency Injection',
              to: 'docs/di/introduction',
            },
            {
              label: 'Advanced',
              to: 'docs//advanced/subscriptions',
            },
            {
              label: 'Recipes',
              to: 'docs/recipes/dataloader',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Our website',
              href: 'https://the-guild.dev',
            },
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
    gtag: {
      trackingID: 'UA-128969121-4',
    },
  },
  scripts: [
    'https://the-guild.dev/static/crisp.js'
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css?family=Lato:300,400,500,600,700,800,900&display=swap',
  ],
  presets: [
    [
      require.resolve('@docusaurus/preset-classic'),
      {
        docs: {
          path: 'docs',
          include: ['**/*.md', '**/*.mdx'],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/Urigo/graphql-modules/edit/master/website/',
          remarkPlugins: [require('remark-import-partial')],
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Current',
              path: '',
            },
            legacy: {
              label: 'Legacy',
              path: 'legacy',
            },
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
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
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: createRedirects(),
      },
    ],
  ],
};

function createRedirects() {
  const sidebars = require('./sidebars').docs;
  const legacySidebars = require('./versioned_sidebars/version-legacy-sidebars.json');

  // take latest routes (current version)
  const latestRoutes = Object.values(sidebars).reduce(
    (acc, links) => acc.concat(links),
    []
  );
  // collect legacy routes
  const legacyRoutes = legacySidebars['version-legacy/docs'].reduce(
    (acc, category) => {
      return acc.concat(
        category.items.map((i) => i.id.replace('version-legacy/', ''))
      );
    },
    []
  );

  // Create a redirect to legacy route only if it doesn't collide with any of the latest routes
  const routesToRedirect = legacyRoutes.filter(
    (route) => !latestRoutes.includes(route)
  );

  const redirects = routesToRedirect.map((route) => ({
    to: `/docs/legacy/${route}`,
    from: `/docs/${route}`,
  }));

  return redirects;
}
