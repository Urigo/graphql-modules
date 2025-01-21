import { ReactNode } from 'react';
import {
  CallToAction,
  CheckIcon,
  cn,
  DecorationIsolation,
  GitHubIcon,
  Heading,
  InfoCard,
  ModulesLogo,
  ToolsAndLibrariesCards,
} from '@theguild/components';
import { metadata as rootMetadata } from './layout';

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

function Hero(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative isolate flex max-w-[90rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl bg-blue-400 px-4 py-6 sm:py-12 md:gap-8 lg:py-24',
        props.className
      )}
    >
      <DecorationIsolation className="-z-10">
        <ModulesLogo
          className={cn(
            'absolute right-[-180px] top-[calc(50%-180px)] size-[360px] fill-[url(#codegen-hero-gradient)] stroke-white/10 stroke-[0.1px] md:hidden xl:block',
            'lg:left-[-250px] lg:top-1/2 lg:-translate-y-1/2 lg:size-[500px]'
          )}
        />
        <ModulesLogo className="absolute right-[-150px] top-2 size-[672px] fill-[url(#codegen-hero-gradient)] stroke-white/10 stroke-[0.1px] max-md:hidden" />
        <svg>
          <defs>
            <linearGradient
              id="codegen-hero-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="11.66%" stopColor="rgba(255, 255, 255, 0.10)" />
              <stop offset="74.87%" stopColor="rgba(255, 255, 255, 0.30)" />
            </linearGradient>
          </defs>
        </svg>
      </DecorationIsolation>
      <div className="relative">
        <ModulesLogo
          fill="url(#paint1_linear_858_2389)"
          className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 size-1/2"
        />
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          stroke="url(#paint1_linear_858_2389)"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_b_858_2389)">
            <rect
              width="96"
              height="96"
              rx="24"
              fill="url(#paint0_linear_858_2389)"
            />
            <mask id="path-3-inside-1_858_2389" fill="white">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M57.0264 32.1652H48.9577L53.8032 27.3197L48.4855 22L43.1658 27.3197L48.0114 32.1652H39.9427C38.9042 32.1652 37.9069 32.5786 37.1721 33.3134L23 47.4855L28.3197 52.8052L45.715 35.4099C47.2452 33.8797 49.7258 33.8797 51.2561 35.4099L68.6513 52.8052L73.971 47.4855L59.797 33.3114C59.0622 32.5767 58.0649 32.1632 57.0264 32.1632V32.1652ZM48.4854 63.3623L43.1665 68.6811L48.4854 74L53.8042 68.6811L48.4854 63.3623ZM39.9446 52.8054H48.4855H48.4894H57.0303C58.0688 52.8054 59.0661 53.2188 59.8008 53.9536L63.89 58.0428L58.5704 63.3625L51.258 56.0501C49.7277 54.5198 47.2472 54.5198 45.7169 56.0501L38.4045 63.3625L33.0848 58.0428L37.174 53.9536C37.9088 53.2188 38.9061 52.8054 39.9446 52.8054Z"
              />
            </mask>
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_858_2389"
              x1="0"
              y1="0"
              x2="96"
              y2="96"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3B736A" />
              <stop offset="1" stopColor="#15433C" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_858_2389"
              x1="0"
              y1="0"
              x2="96"
              y2="96"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" stopOpacity="0.8" />
              <stop offset="1" stopColor="white" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {props.children}
    </div>
  );
}

function HeroLinks(props: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex justify-center gap-2 px-0.5 max-sm:flex-col sm:gap-4">
      {props.children}
    </div>
  );
}

function HeroFeatures(props: { children: ReactNode }) {
  return (
    <ul className="mx-auto flex list-none gap-x-6 gap-y-2 text-sm font-medium max-md:flex-col [&>li]:flex [&>li]:items-center [&>li]:gap-2">
      {props.children}
    </ul>
  );
}

function Page(props: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-full flex-col', props.className)}>
      {props.children}
    </div>
  );
}

export default function IndexPage() {
  return (
    <Page className="mx-auto max-w-[90rem]">
      <Hero className="mx-4 max-sm:mt-2 md:mx-6">
        <Heading
          as="h1"
          size="xl"
          className="mx-auto max-w-3xl text-balance text-center"
        >
          Enterprise Grade Tooling for Your GraphQL Server
        </Heading>
        <p className="mx-auto w-[512px] max-w-[80%] text-center leading-6 text-green-800">
          GraphQL Modules is a toolset of libraries and guidelines dedicated to
          create reusable, maintainable, testable and extendable modules out of
          your GraphQL server.
        </p>
        <HeroFeatures>
          <li>
            <CheckIcon className="text-green-800" />
            Fully open source
          </li>
          <li>
            <CheckIcon className="text-green-800" />
            No vendor lock
          </li>
        </HeroFeatures>
        <HeroLinks>
          <CallToAction variant="primary-inverted" href="/docs">
            Get started
          </CallToAction>
          <CallToAction variant="secondary-inverted" href="/changelog">
            Changelog
          </CallToAction>
          <CallToAction
            variant="tertiary"
            href="https://github.com/dotansimha/graphql-yoga"
          >
            <GitHubIcon className="size-6" />
            GitHub
          </CallToAction>
        </HeroLinks>
      </Hero>
      <EverythingHTTPSection />

      <ToolsAndLibrariesCards className="mx-4 mt-6 md:mx-6" />
    </Page>
  );
}

function EverythingHTTPSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'px-4 py-6 sm:py-12 md:px-6 lg:py-16 xl:px-[120px]',
        className
      )}
    >
      <Heading
        as="h2"
        size="md"
        className="text-balance sm:px-6 sm:text-center"
      >
        Integrates with any GraphQL Server
      </Heading>
      <p className="text-green-800 sm:text-center mt-4">
        GraphQL Modules is a set of extra tools, structures and guidelines
        around your GraphQL schema. You’ll see how effective those tools are
        once you’ll start growing and scaling your GraphQL server.
      </p>
      <ul className="mt-6 flex flex-wrap justify-center gap-2 md:mt-16 md:gap-6">
        <InfoCard
          as="li"
          heading="Reusable Modules"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              width="24"
              height="24"
              fill="#fff"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M50 6.90308L87.323 28.4515V71.5484L50 93.0968L12.677 71.5484V28.4515L50 6.90308ZM16.8647 30.8693V62.5251L44.2795 15.0414L16.8647 30.8693ZM50 13.5086L18.3975 68.2457H81.6025L50 13.5086ZM77.4148 72.4334H22.5852L50 88.2613L77.4148 72.4334ZM83.1353 62.5251L55.7205 15.0414L83.1353 30.8693V62.5251Z"
              />
              <circle cx="50" cy="9.3209" r="8.82" />
              <circle cx="85.2292" cy="29.6605" r="8.82" />
              <circle cx="85.2292" cy="70.3396" r="8.82" />
              <circle cx="50" cy="90.6791" r="8.82" />
              <circle cx="14.7659" cy="70.3396" r="8.82" />
              <circle cx="14.7659" cy="29.6605" r="8.82" />
            </svg>
          }
          className="flex-1 rounded-2xl md:rounded-3xl"
        >
          Modules are defined by their GraphQL schema (Schema first design).
        </InfoCard>
        <InfoCard
          as="li"
          heading="Scalable Structure"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 18 18"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.6999 8.14983H15.2999V2.74983H2.6999V8.14983ZM17.0999 1.84983V16.2498C17.0999 16.4885 17.0051 16.7174 16.8363 16.8862C16.6675 17.055 16.4386 17.1498 16.1999 17.1498H1.7999C1.56121 17.1498 1.33229 17.055 1.16351 16.8862C0.994723 16.7174 0.899902 16.4885 0.899902 16.2498V1.84983C0.899902 1.61113 0.994723 1.38222 1.16351 1.21343C1.33229 1.04465 1.56121 0.949829 1.7999 0.949829H16.1999C16.4386 0.949829 16.6675 1.04465 16.8363 1.21343C17.0051 1.38222 17.0999 1.61113 17.0999 1.84983ZM15.2999 9.94983H2.6999V15.3498H15.2999V9.94983ZM4.4999 11.7498H7.1999V13.5498H4.4999V11.7498ZM4.4999 4.54983H7.1999V6.34983H4.4999V4.54983Z" />
            </svg>
          }
          className="flex-1 basis-full rounded-2xl md:basis-0 md:rounded-3xl"
        >
          Manage multiple teams and features, multiple micro-services and
          servers.
        </InfoCard>
        <InfoCard
          as="li"
          heading="Gradual Growth"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chart-line"
            >
              <path d="M3 3v16a2 2 0 0 0 2 2h16" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          }
          className="flex-1 basis-full rounded-2xl md:rounded-3xl lg:basis-0"
        >
          A clear, gradual path from a very simple and fast, single-file
          modules, to scalable ones.
        </InfoCard>
        <InfoCard
          as="li"
          heading="Testable"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-test-tube-diagonal"
            >
              <path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3" />
              <path d="m16 2 6 6" />
              <path d="M12 16H4" />
            </svg>
          }
          className="flex-1 basis-full rounded-2xl md:rounded-3xl lg:basis-0"
        >
          A rich toolset around testing, mocking and separation.
        </InfoCard>
      </ul>
    </section>
  );
}
