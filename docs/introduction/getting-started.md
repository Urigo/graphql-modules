---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Install GraphQL and GraphQL-Modules using Yarn:

```bash
yarn add graphql @graphql-modules/core
```

Or Npm:

```bash
npm install --save graphql @graphql-modules/core
```

Then, create your `GraphQLApp` instance:

```typescript
import { GraphQLApp } from '@graphql-modules/core';

const graphQlApp = new GraphQLApp({
    modules: [],
});
```

`GraphQLApp` manages your module, GraphQL schema, resolvers, context building and the communication between your modules.

So now you have a ready-to-use `GraphQLApp` instance. Go ahead and create your first `GraphQLModule`.

Now it's time to implement the schema resolvers and connect it to some data.
