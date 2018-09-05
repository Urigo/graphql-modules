---
id: integrate-with-apollo-server
title: Integrate With Apollo-Server
sidebar_label: Integrate With Apollo-Server
---

GraphQLModules comes with a built-in support for [Apollo-Server](https://www.apollographql.com/docs/apollo-server/getting-started.html).

To get started, add `apollo-server` to your app:

```bash
yarn add apollo-server
```

Then, create a new instance of `ApolloServer` and pass your `GraphQLApp` instance as the first arguments:

```typescript
import { GraphQLApp } from '@graphql-modules/core';
import { myFirstModule } from './modules/my-first-module';
import { ApolloServer } from 'apollo-server';

const graphQlApp = new GraphQLApp({
    modules: [
        myFirstModule,
    ],
});

const server = new ApolloServer(graphQlApp);

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

> To test your server, run `ts-node index.ts` and try to open `http://localhost:4000/`, you should see the [GraphQL Playground](https://github.com/prismagraphql/graphql-playground) UI.

