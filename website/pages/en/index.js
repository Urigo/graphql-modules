/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock;
/* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function imgUrl(img) {
  return `${siteConfig.baseUrl}img/${img}`;
}

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? `${language}/` : '') + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} alt="Project Logo"/>
  </div>
);

const ProjectTitle = () => (
  <React.Fragment>
    <h2 className="projectTitle">
      {siteConfig.title}
      <small>{siteConfig.tagline}</small>
    </h2>
    <div>
      GraphQL Modules is a set of extra tools, structure and guidelines for your GraphQL server.
    </div>
    <div>
      Use it to get reusable, maintainable, testable and extendable GraphQL servers.
    </div>
    <br />
  </React.Fragment>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    const language = this.props.language || '';
    return (
      <SplashContainer>
        <div className="inner">
          <Logo img_src={imgUrl('logo.svg')}/>
          <ProjectTitle/>
          <PromoSection>
            <Button href={docUrl('introduction/getting-started', language)}>Getting Started</Button>
            <Button href={docUrl('introduction/modules', language)}>Documentation</Button>
            <Button href={docUrl('api/core/api-readme', language)}>API Reference</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout}/>
  </Container>
);

const Features = () => (
  <Block layout="fourColumn">
    {[
      {
        content: 'Each GraphQL Module does only what it needs, without the application overheads',
        image: imgUrl('logo.svg'),
        imageAlign: 'top',
        title: 'Separation Of Concerns',
      },
      {
        content: 'You can reuse your written module and share them across multiple applications',
        image: imgUrl('logo.svg'),
        imageAlign: 'top',
        title: 'Reusable Module',
      },
      {
        content: 'You can easily extend your GraphQL types with new features',
        image: imgUrl('logo.svg'),
        imageAlign: 'top',
        title: 'Extendable Schema',
      },
      {
        content: 'GraphQL Modules comes with a built-in dependency-injection support, which makes it easier to test and mock',
        image: imgUrl('logo.svg'),
        imageAlign: 'top',
        title: 'Easy To Test',
      },
    ]}
  </Block>
);

const FeatureCallout = () => (
  <div
    className="productShowcaseSection paddingBottom"
    style={{ textAlign: 'center' }}>
    <h2>Another framework? well, kind of.</h2>
    <div>
      <div>
        GraphQL Modules is more a set of extra tools, structure and guidelines around the amazing Apollo Server 2.0 (and
        other servers).
      </div>
      <div>
        Those are the tools you start to feel the need for, once you created your GraphQL server and start to grow it.
      </div>
      <br />
      <div>
        <strong>
          The basic concept behind GraphQL modules is to separate your GraphQL server into smaller and reusable pieces,
          based on your app/organization features.
        </strong>
      </div>
    </div>
  </div>
);

const LearnHow = () => (
  <Block background="light">
    {[
      {
        content: 'Talk about learning how to use this',
        image: imgUrl('logo.svg'),
        imageAlign: 'right',
        title: 'Learn How',
      },
    ]}
  </Block>
);

const Description = () => (
  <Block background="dark">
    {[
      {
        content: 'This is another description of how this project is useful',
        image: imgUrl('logo.svg'),
        imageAlign: 'right',
        title: 'Description',
      },
    ]}
  </Block>
);

const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }

  const showcase = siteConfig.users.filter(user => user.pinned).map(user => (
    <a href={user.infoLink} key={user.infoLink}>
      <img src={user.image} alt={user.caption} title={user.caption}/>
    </a>
  ));

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>Who is Using This?</h2>
      <p>This project is used by all these people</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    const language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language}/>
        <div className="mainContainer">
          <Features/>
          <FeatureCallout/>
          <LearnHow/>
          <Description/>
          <Showcase language={language}/>
        </div>
      </div>
    );
  }
}

module.exports = Index;
