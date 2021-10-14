import { FC } from 'react';
import Image from 'next/image';
import {
  FeatureList,
  HeroGradient,
  HeroIllustration,
} from '@theguild/components';
import { handlePushRoute, NPMBadge } from '@guild-docs/client';
import Companies from '../ui/home/companies';

const FEATURE_LIST = [
  {
    title: 'REUSABLE MODULES',
    description: `Modules are defined by their GraphQL schema (Schema first design).`,
    image: {
      src: '/assets/img/home/api-feat.svg',
      alt: 'api-feat',
      loading: 'lazy',
    },
  },
  {
    title: 'SCALABLE STRUCTURE',
    description: `Manage multiple teams and features, multiple micro-services and servers.`,
    image: {
      src: '/assets/img/home/reuse-feat.svg',
      alt: 'api-feat',
      loading: 'lazy',
    },
  },
  {
    title: 'GRADUAL GROWTH',
    description: `A clear, gradual path from a very simple and fast, single-file modules, to scalable ones.`,
    image: {
      src: '/assets/img/home/extend-feat.svg',
      alt: 'api-feat',
      loading: 'lazy',
    },
  },
  {
    title: 'TESTABLE',
    description: `A rich toolset around testing, mocking and separation.`,
    image: {
      src: '/assets/img/home/easy-feat.svg',
      alt: 'api-feat',
      loading: 'lazy',
    },
  },
];

const IndexPage: FC = () => {
  return (
    <>
      <HeroGradient
        title="ENTERPRISE GRADE TOOLING FOR YOUR GRAPHQL SERVER"
        description="GraphQL Modules is a toolset of libraries and guidelines dedicated to create reusable, maintainable, testable and extendable modules out of your GraphQL server."
        link={{
          href: '/docs',
          children: 'Get Started',
          title: 'Get started with The Guild Docs',
          onClick: (e) => handlePushRoute('/docs', e),
        }}
        version={<NPMBadge name="graphql-modules" />}
        colors={['#13114a', '#13114a']}
        image={{
          src: '/assets/img/home/rocket.svg',
          loading: 'lazy',
          alt: 'GraphQL Modules',
        }}
      />

      <Companies />

      <FeatureList items={FEATURE_LIST as any} />

      <HeroIllustration
        flipped
        title={
          <div className="_title">
            <span>Integrates with your</span>
            <div className="apollo-text">
              <Image
                priority
                width={190}
                height={65}
                src="/assets/img/home/companies/apollo-logo.png"
                alt="Apollo"
                className="_apollo-logo"
              />
              <span>server</span>
            </div>
          </div>
        }
        description="GraphQL Modules is a set of extra tools, structures and guidelines around the amazing Apollo Server 2.0. You’ll see how effective those tools are once you’ll start growing and scaling your GraphQL server."
        image={{
          src: '/assets/img/home/workers-full.svg',
          alt: 'workers',
          loading: 'lazy',
        }}
      />
    </>
  );
};

export default IndexPage;
