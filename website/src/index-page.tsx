import { ReactElement } from 'react';
import {
  FeatureList,
  HeroGradient,
  HeroIllustration,
  NPMBadge,
  Image,
  IFeatureListProps,
} from '@theguild/components';

import api from '../public/assets/img/home/api-feat.svg';
import reuse from '../public/assets/img/home/reuse-feat.svg';
import extend from '../public/assets/img/home/extend-feat.svg';
import easy from '../public/assets/img/home/easy-feat.svg';
import rocket from '../public/assets/img/home/rocket.svg';
import apollo from '../public/assets/img/home/companies/apollo-logo.png';
import workers from '../public/assets/img/home/workers-full.svg';
import airFrance from '../public/assets/img/home/companies/airfrance-logo.svg';
import klm from '../public/assets/img/home/companies/klm-logo.svg';
import msj from '../public/assets/img/home/companies/msj-logo.svg';
import schneider from '../public/assets/img/home/companies/schneider-logo.svg';

const FEATURE_LIST: IFeatureListProps['items'] = [
  {
    title: 'Reusable Modules',
    description:
      'Modules are defined by their GraphQL schema (Schema first design).',
    image: {
      src: api,
      alt: '',
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
      alt: '',
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
      alt: '',
      loading: 'eager',
      placeholder: 'empty',
    },
  },
  {
    title: 'Testable',
    description: 'A rich toolset around testing, mocking and separation.',
    image: {
      src: easy,
      alt: '',
      loading: 'eager',
      placeholder: 'empty',
    },
  },
];

export const IndexPage = (): ReactElement => {
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

      <div className="flex justify-center p-6 md:p-0">
        {[
          { src: airFrance, alt: 'AirFrance' },
          { src: klm, alt: 'KLM' },
          { src: msj, alt: 'Mount St. Joseph University' },
          { src: schneider, alt: 'Schneider' },
        ].map(({ src, alt }) => (
          <Image
            key={alt}
            src={src}
            alt={alt}
            loading="eager"
            placeholder="empty"
          />
        ))}
      </div>

      <FeatureList items={FEATURE_LIST} className="[&_h3]:mt-4" />

      <HeroIllustration
        flipped
        title={
          <>
            Integrates with Your
            <Image src={apollo} alt="Apollo" className="inline h-9 w-auto" />
            Server
          </>
        }
        description="GraphQL Modules is a set of extra tools, structures and guidelines around the amazing Apollo Server 2.0. You’ll see how effective those tools are once you’ll start growing and scaling your GraphQL server."
        image={{
          src: workers,
          loading: 'eager',
          placeholder: 'empty',
          alt: '',
        }}
      />
    </>
  );
};
