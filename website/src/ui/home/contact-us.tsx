import { FC } from 'react';
import NextLink from 'next/link';

const ContactUs: FC = () => {
  return (
    <div className="ContactUs">
      <h2 className="_kicker">Need Help?</h2>
      <h1 className="_title">We&apos;ve Got You Covered!</h1>
      <div className="_subtitle">
        Check out our{' '}
        <NextLink href="/docs">
          <a>docs</a>
        </NextLink>
        , open an issue on our{' '}
        <a href="https://github.com/Urigo/graphql-modules">GitHub repo</a> or
        simply contact us directly! We would love to help you with Apollo,
        GraphQL and GraphQL Modules and anything in between! We can help you get
        started or scale GraphQL across your whole organization.
      </div>
      <div className="_subtitle">
        You can also <a href="mailto:contact@the-guild.dev">send us an email</a>{' '}
        to get in touch.
      </div>
      <div className="_links">
        <NextLink href="https://github.com/Urigo/graphql-modules">
          <a className="_channel">
            <img src="/assets/img/home/github-icon.svg" alt="GitHub" />
          </a>
        </NextLink>
        <NextLink href="https://the-guild.dev/blog">
          <a className="_channel">
            <img src="/assets/img/home/medium-icon.svg" alt="Medium" />
          </a>
        </NextLink>
      </div>
    </div>
  );
};

export default ContactUs;
