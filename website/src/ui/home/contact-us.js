import React from 'react';
import Link from '@docusaurus/Link';
import { Hyperlink } from '../hyperlink';

const githubIcon = `/img/home/github-icon.svg`;
const mediumIcon = `/img/home/medium-icon.svg`;

export function ContactUs() {
  return (
    <div className="ContactUs">
      <h2 className="_kicker">Need Help?</h2>
      <h1 className="_title">We've Got You Covered!</h1>
      <div className="_subtitle">
        Check out our{' '}
        <Link href="/docs/introduction/getting-started">docs</Link>, open an
        issue on our{' '}
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
        <Hyperlink
          className="_channel"
          href="https://github.com/Urigo/graphql-modules"
        >
          <img src={githubIcon} alt="github" />
        </Hyperlink>
        <Hyperlink className="_channel" href="https://the-guild.dev/blog">
          <img src={mediumIcon} alt="medium" />
        </Hyperlink>
      </div>
    </div>
  );
}
