import { withGuildDocs } from '@theguild/components/next.config';

export default withGuildDocs({
  images: {
    unoptimized: true, // doesn't work with `next export`
    allowFutureImage: true,
  },
  redirects: () =>
    Object.entries({}).map(([from, to]) => ({
      source: from,
      destination: to,
      permanent: true,
    })),
});
