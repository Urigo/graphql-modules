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

Then, create your `GraphQLModule` instance:

```typescript
import { GraphQLModule } from '@graphql-modules/core';

const graphQlModule = new GraphQLModule({
    typeDefs: [],
    resolvers: {},
    modules: [],
});
```

`GraphQLModule` manages your submodules, GraphQL schema, resolvers, context building and the communication between your modules.

So now you have a ready-to-use `GraphQLModule` instance. Go ahead and create your first `GraphQLModule`.

Now it's time to implement the schema resolvers and connect it to some data.
