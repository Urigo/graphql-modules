import {
  FeatureList,
  HeroGradient,
  HeroIllustration,
  NPMBadge,
  IFeatureListProps,
} from '@theguild/components';
import api from '../../public/assets/img/home/api-feat.svg';
import reuse from '../../public/assets/img/home/reuse-feat.svg';
import extend from '../../public/assets/img/home/extend-feat.svg';
import easy from '../../public/assets/img/home/easy-feat.svg';
import rocket from '../../public/assets/img/home/rocket.svg';
import workers from '../../public/assets/img/home/workers-full.svg';
import { metadata as rootMetadata, ScalarsLogo } from './layout';

export const metadata = {
  title: 'GraphQL Modules',
  alternates: {
    // to remove leading slash
    canonical: '.',
  },
  openGraph: {
    ...rootMetadata.openGraph,
    // to remove leading slash
    url: '.',
  },
};

const FEATURE_LIST: IFeatureListProps['items'] = [
  {
    title: 'Reusable Modules',
    description:
      'Modules are defined by their GraphQL schema (Schema first design).',
    image: {
      src: api,
      alt: 'Reusable Modules',
      loading: 'eager',
      placeholder: 'empty',
    },
  },
  {
    title: 'Scalable Structure',
    description:
      'Manage multiple teams and features, multiple micro-services and servers.',
    image: {
      src: reuse,
      alt: 'Scalable Structure',
      loading: 'eager',
      placeholder: 'empty',
    },
  },
  {
    title: 'Gradual Growth',
    description:
      'A clear, gradual path from a very simple and fast, single-file modules, to scalable ones.',
    image: {
      src: extend,
      alt: 'Gradual Growth',
      loading: 'eager',
      placeholder: 'empty',
    },
  },
  {
    title: 'Testable',
    description: 'A rich toolset around testing, mocking and separation.',
    image: {
      src: easy,
      alt: 'Testable',
      loading: 'eager',
      placeholder: 'empty',
    },
  },
];

export default function IndexPage() {
  return (
    <>
      <HeroGradient
        title="Enterprise Grade Tooling for Your GraphQL Server"
        description="GraphQL Modules is a toolset of libraries and guidelines dedicated to create reusable, maintainable, testable and extendable modules out of your GraphQL server."
        link={{
          href: '/docs',
          children: 'Get Started',
          title: 'Get started with The Guild Docs',
        }}
        version={<NPMBadge name="graphql-modules" />}
        colors={['#13114a', '#13114a']}
        image={{
          src: rocket,
          loading: 'eager',
          placeholder: 'empty',
          alt: 'Rocket Illustration',
        }}
      />

      <FeatureList items={FEATURE_LIST} className="[&_h3]:mt-4" />

      <HeroIllustration
        flipped
        title={<>Integrates with any GraphQL Server</>}
        description="GraphQL Modules is a set of extra tools, structures and guidelines around your GraphQL schema. You’ll see how effective those tools are once you’ll start growing and scaling your GraphQL server."
        image={{
          src: workers,
          loading: 'eager',
          placeholder: 'empty',
          alt: 'Integrates with any GraphQL Server',
        }}
      />
    </>
  );
}
