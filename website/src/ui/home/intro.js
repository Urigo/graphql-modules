import React from 'react';
import { Button } from '../button';
import { Hyperlink } from '../hyperlink';

const rocket = `/img/home/rocket.svg`;

export function Intro(props) {
  return (
    <div {...props} className={`Intro ${props.className || ''}`}>
      <img src={rocket} alt="" className="_bg-rocket" />
      <div className="_start-section">
        <div className="_title">
          Enterprise Grade Tooling for your GraphQL server
        </div>
        <div className="_subtitle">
          GraphQL Modules is a toolset of libraries and guidelines dedicated to
          create reusable, maintainable, testable and extendable modules out of
          your GraphQL server.
        </div>
        <Hyperlink></Hyperlink>
        <Hyperlink href="/docs/index">
          <Button className="_start-button">Get started</Button>
        </Hyperlink>
      </div>
    </div>
  );
}
