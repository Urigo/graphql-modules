# GraphQL Modules

[![CircleCI](https://circleci.com/gh/Urigo/graphql-modules.svg?style=svg&circle-token=28155ce743e1a9ba25152b0b3395acfa5b152f41)](https://circleci.com/gh/Urigo/graphql-modules)

## Overview

**[GraphQL Modules Website](https://graphql-modules.com/docs/introduction/getting-started)**

**[Link to blog posts etc](https://medium.com/@dotansimha/graphql-modules-dabadaba)**

GraphQL Modules is a toolset of libraries and guidelines dedicated to create reusable, maintainable, testable and extendable modules out of your GraphQL server.

## Highlights

### Reusable modules ###

Modules are defined by their GraphQL schema (Schema first design). They're completely independent and can be shared between apps.

### Scalable structure ###

Manage multiple teams and features, multiple micro-services and servers.

### Gradual growth ###

A clear, gradual path from a very simple and fast, single-file modules, to scalable multi-file, multi-teams, multi-repo, multi-server modules.

### Testable ###

A rich toolset around testing, mocking and separation.

## Installation

To install graphql-modules, use the following:

    $ npm install @graphql-modules/core
    // Or, with Yarn
    $ yarn add @graphql-modules/core

Or, in alternative, just use the graphql-modules-seed to get started:

    $ git clone https://github.com/darkbasic/graphql-modules-seed.git

#### Pre-release

We are also publishing a pre-release version to NPM on each change.

Just take a look at the build status on CircleCI and find "Publish Canary" job to get the published version.

## Usage Examples

Inside the examples directory you can find the following examples:

- Example 1 is [available here](./examples/)
- Example 2 is [available here](./examples/)
- Example 3 is [available here](./examples/)

## Documentation ##

Documentation is available inside the [docs](./docs/) directory or at [http://graphql-modules.com](https://graphql-modules.com/docs/introduction/getting-started).

## GraphQL Code Generator integration

GraphQL Modules easily integrates with GraphQL Code Generator. To see how look at the [graphql-modules-seed](https://github.com/darkbasic/graphql-modules-seed).

## Troubleshoot

If you have issues with the generator, feel free open issues in this repository.

## Contributing

Feel free to open issues (for bugs/questions) and create pull requests (add generators / fix bugs).

## License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
