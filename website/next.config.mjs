import { withGuildDocs } from '@theguild/components/next.config';

export default withGuildDocs({
  redirects: () =>
    Object.entries({
      '/di/introduction': '/docs/di/introduction',
      '/docs/di': '/docs/di/introduction',
      '/docs/legacy/recipes/type-graphql': '/docs/get-started',
      '/docs/introduction/getting-started': '/docs/get-started',
      '/docs/guides/development-environment': '/docs/get-started',
      '/docs/recipes/db-connection-pooling': '/docs/get-started',
      '/docs/legacy/recipes/development-environment': '/docs/get-started',
      '/docs/legacy/recipes/file-uploads': '/docs/get-started',
      '/docs/api.md': '/docs/api',
      '/docs/api/api.md': '/docs/api',
      '/docs/essentials': '/docs/essentials/type-definitions',
      '/docs/introduction/context': '/docs/essentials/context',
      '/docs/advanced': '/docs/advanced/subscriptions',
      '/docs/next/recipes/migration': '/docs/recipes/migration',
      '/docs/legacy/introduction/context': '/docs/get-started',
      '/docs/guides/data-sources': '/docs/get-started',
      '/docs/introduction/dependency-injection': '/docs/di/introduction',
      '/docs/introduction/resolvers-composition': '/docs/essentials/resolvers',
    }).map(([from, to]) => ({
      source: from,
      destination: to,
      permanent: true,
    })),
});
