/* eslint sort-keys: error */
import {
  defineConfig,
  Giscus,
  ModulesLogo,
  useTheme,
} from '@theguild/components';
import { useRouter } from 'next/router';

const SITE_NAME = 'GraphQL Modules';

export default defineConfig({
  docsRepositoryBase:
    'https://github.com/Urigo/graphql-modules/tree/master/website',
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={`${SITE_NAME}: documentation`} />
      <meta name="og:title" content={`${SITE_NAME}: documentation`} />
    </>
  ),
  logo: (
    <>
      <ModulesLogo className="mr-1.5 h-9 w-9" />
      <div>
        <h1 className="md:text-md text-sm font-medium">{SITE_NAME}</h1>
        <h2 className="hidden text-xs sm:block">
          Enterprise Grade Tooling for Your GraphQL Server
        </h2>
      </div>
    </>
  ),
  main: {
    extraContent() {
      const { resolvedTheme } = useTheme();
      const { route } = useRouter();

      if (route === '/') {
        return null;
      }
      return (
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
    },
  },
  titleSuffix: ` – ${SITE_NAME}`,
});
