/* eslint sort-keys: error */
import { defineConfig, Giscus, PRODUCTS, useTheme } from '@theguild/components';
import { useRouter } from 'next/router';

export default defineConfig({
  description: 'GraphQL server tooling',
  docsRepositoryBase:
    'https://github.com/Urigo/graphql-modules/tree/master/website',
  // @ts-expect-error - something is wrong with the types
  logo: PRODUCTS.MODULES.logo({ className: 'w-9' }),
  main({ children }) {
    const { resolvedTheme } = useTheme();
    const { route } = useRouter();

    const comments = route !== '/' && (
      <Giscus
        // ensure giscus is reloaded when client side route is changed
        key={route}
        repo="Urigo/graphql-modules"
        repoId="MDEwOlJlcG9zaXRvcnkxMzI5Mjc2NjU="
        category="Docs Discussions"
        categoryId="DIC_kwDOB-xQsc4CSDST"
        mapping="pathname"
        theme={resolvedTheme}
      />
    );
    return (
      <>
        {children}
        {comments}
      </>
    );
  },
  websiteName: 'GraphQL-Modules',
});
