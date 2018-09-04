---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Install GraphQL Modules using Yarn:

```bash
yarn add @graphql-modules/core
```

Or Npm:

```bash
npm install --save @graphql-modules/core
```

Then, create your `GraphQLApp` instance:

```typescript
const graphQlApp = new GraphQLApp({
    modules: [],
});
```

`GraphQLApp` manages your module, GraphQL schema, resolvers, context building and the communication between your modules.

So now you have a ready-to-use `GraphQLApp` instance. Go ahead and create your first `GraphQLModule`.
