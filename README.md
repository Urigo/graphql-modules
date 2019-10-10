[![modules](https://user-images.githubusercontent.com/25294569/64067074-ed185b80-cc2a-11e9-8f4d-5f1e19feaa0a.gif)](https://graphql-modules.com/)


[![npm version](https://badge.fury.io/js/%40graphql-modules%2Fcore.svg)](https://www.npmjs.com/package/@graphql-modules/core)
[![CircleCI](https://circleci.com/gh/Urigo/graphql-modules.svg?style=svg&circle-token=28155ce743e1a9ba25152b0b3395acfa5b152f41)](https://circleci.com/gh/Urigo/graphql-modules)
[![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH9)
[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)]()

**GraphQL Modules** is a toolset of libraries and guidelines dedicated to **create reusable, maintainable, testable and extendable modules** out of your GraphQL server.

- **[Website](https://graphql-modules.com/docs/introduction/getting-started)**
- **[Introducing GraphQL Modules - Feature based GraphQL Modules at scale](https://medium.com/the-guild/graphql-modules-feature-based-graphql-modules-at-scale-2d7b2b0da6da)**
- **[Why is True Modular Encapsulation So Important in Large-Scale GraphQL Projects? ](https://medium.com/the-guild/why-is-true-modular-encapsulation-so-important-in-large-scale-graphql-projects-ed1778b03600)**
- **[Why did we implement our own Dependency Injection library for GraphQL-Modules?](https://medium.com/the-guild/why-did-we-implement-our-own-dependency-injection-library-for-graphql-modules-f25a234a9762)**
- **[Scoped Providers in GraphQL-Modules Dependency Injection](https://medium.com/the-guild/scoped-providers-in-graphql-modules-dependency-injection-system-949cd2588e0)**
- **[Writing a GraphQL TypeScript project w/ GraphQL-Modules and GraphQL-Code-Generator](https://medium.com/the-guild/writing-strict-typed-graphql-typescript-project-w-graphql-modules-and-graphql-code-generator-c22f6caa17b8)**
- **[Authentication and Authorization in GraphQL (and how GraphQL-Modules can help)](https://medium.com/the-guild/authentication-and-authorization-in-graphql-and-how-graphql-modules-can-help-fadc1ee5b0c2)**
- **[Authentication with AccountsJS & GraphQL Modules](https://medium.com/the-guild/authentication-with-accountsjs-graphql-modules-e0fb9799a9da)**
- **[Manage Circular Imports Hell in GraphQL-Modules](https://medium.com/the-guild/manage-circular-imports-hell-with-graphql-modules-4b1611dee781)**

## Highlights

- **Reusable modules** - Modules are defined by their GraphQL schema (Schema first design). They're completely independent and can be shared between apps.
- **Scalable structure** - Manage multiple teams and features, multiple micro-services and servers.
- **Gradual growth** - A clear, gradual path from a very simple and fast, single-file modules, to scalable multi-file, multi-teams, multi-repo, multi-server modules.
- **Testable** - A rich toolset around testing, mocking and separation.

## Documentation

Documentation is available at [graphql-modules.com](https://graphql-modules.com/docs/introduction/getting-started) or inside the [docs](./docs/) directory.

## Installation

To install graphql-modules, use the following:

```sh
$ npm install @graphql-modules/core

# Or, with Yarn

$ yarn add @graphql-modules/core
```

Or, in alternative, just use the graphql-modules-seed to get started:

    $ git clone https://github.com/darkbasic/graphql-modules-seed.git

#### Pre-release

We are also publishing a pre-release version to NPM on each change.

Just take a look at the build status on CircleCI and find "Publish Canary" job to get the published version.

## Usage

More advanced usage at [graphql-modules.com](https://graphql-modules.com/docs/introduction/getting-started)

```js
import { GraphQLModule } from '@graphql-modules/core';

const module = new GraphQLModule({
  typeDefs: gql`
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
  imports: [UserModule]
});
```

Inside the `examples` directory you can find the following examples:

- [Simple GraphQL-Modules example](./examples/basic)
- [Using dependency injection in GraphQL Modules](./examples/basic-with-dependency-injection)
- You can also take a look at the [graphql-modules-seed](https://github.com/darkbasic/graphql-modules-seed) repository.

## GraphQL Code Generator integration

GraphQL Modules easily integrates with [GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator). To see how look at the [graphql-modules-seed](https://github.com/darkbasic/graphql-modules-seed).

## Troubleshoot

If you have issues with the generator, feel free open issues in this repository.

## Contributing

Feel free to open issues (for bugs/questions) and create pull requests (add generators / fix bugs).

## License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
