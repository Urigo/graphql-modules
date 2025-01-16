/* eslint sort-keys: error */
import { defineConfig, Giscus, PRODUCTS, useTheme } from '@theguild/components';
import { useRouter } from 'next/router';

export default defineConfig({
  description: 'GraphQL server tooling',
  logo: PRODUCTS.MODULES.logo({ className: 'w-9' }),
  websiteName: 'GraphQL-Modules',
});
