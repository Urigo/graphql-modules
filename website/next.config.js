const { withGuildDocs } = require('@guild-docs/server');
const { register } = require('esbuild-register/dist/node');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { i18n } = require('./next-i18next.config');

register({ extensions: ['.ts', '.tsx'] });

module.exports = withBundleAnalyzer(
  withGuildDocs({
    i18n,
    getRoutes: require('./routes.ts').getRoutes,
  })
);
