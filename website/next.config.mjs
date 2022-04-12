import { createRequire } from 'module';
import { withGuildDocs } from '@guild-docs/server';
import bundleAnalyzer from '@next/bundle-analyzer';
import { register } from 'esbuild-register/dist/node.js';
import { i18n } from './next-i18next.config.js';

const require = createRequire(import.meta.url);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

register({ extensions: ['.ts', '.tsx'] });

const { getRoutes } = require('./routes.ts');

export default withBundleAnalyzer(
  withGuildDocs({
    i18n,
    getRoutes,
  })
);
