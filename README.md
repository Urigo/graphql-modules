[![modules](https://user-images.githubusercontent.com/25294569/64067074-ed185b80-cc2a-11e9-8f4d-5f1e19feaa0a.gif)](https://graphql-modules.com/)

[![npm version](https://badge.fury.io/js/graphql-modules.svg)](https://www.npmjs.com/package/graphql-modules)
![CI](https://github.com/Urigo/graphql-modules/workflows/CI/badge.svg)
[![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://the-guild.dev/discord)
[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)]()

**GraphQL Modules** is a toolset of libraries and guidelines dedicated to **create reusable, maintainable, testable and extendable modules** out of your GraphQL server.

- [Website](https://graphql-modules.com)
- [Documentation](https://graphql-modules.com/docs/next/index)

## Highlights

- **Reusable modules** - Modules are defined by their GraphQL schema (Schema first design). They can be shared between apps.
- **Scalable structure** - Manage multiple teams and features, multiple micro-services and servers.
- **Gradual growth** - A clear, gradual path from a very simple and fast, single-file modules, to scalable multi-file, multi-teams, multi-repo, multi-server modules.
- **Testable** - A rich toolset around testing, mocking and separation.

## Documentation

Documentation is available at [graphql-modules.com](https://graphql-modules.com/docs/next/index).

## Installation

To install graphql-modules, use the following:

```sh
$ npm install graphql-modules

# Or, with Yarn

$ yarn add graphql-modules
```

#### Pre-release

We are also publishing a pre-release version to NPM on each change.

Just take a look at the build status on Github Actions and find "Publish Canary" job to get the published version.

## Usage

More advanced usage at [graphql-modules.com](https://graphql-modules.com/docs/next/index)

```js
import { createModule, createApplication } from 'graphql-modules';

const module = createModule({
  id: 'my-module',
  typeDefs: `
    type Post {
      id: ID
      title: String
      author: User
    }

    type Query {
      posts: [Post]
    }
  `,
  resolvers: blogResolvers,
});

const application = createApplication({
  modules: [module],
});
```

Inside the `examples` directory you can find the following examples:

- [Simple GraphQL-Modules example](./examples/basic)
- [Using dependency injection in GraphQL Modules](./examples/basic-with-dependency-injection)

## GraphQL Code Generator integration

GraphQL Modules easily integrates with [GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator).
