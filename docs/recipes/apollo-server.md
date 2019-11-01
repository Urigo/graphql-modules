---
id: apollo-server
title: Integration With Apollo-Server
sidebar_label: Integration with Apollo-Server
---

GraphQLModules comes with a built-in support for **[Apollo-Server](https://www.apollographql.com/docs/apollo-server/getting-started.html)**.

To get started, add `apollo-server` to your app:

```bash
yarn add apollo-server
```

Then create a new instance of `ApolloServer` and use your `GraphQLModule` instance to generate the config to pass to the `ApolloServer` constructor:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server';

const MyGraphQLModule = new GraphQLModule({
  /*...*/
});

const server = new ApolloServer({
  schema: MyGraphQLModule.schema,
  context: session => session
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

> To test your server, run `ts-node index.ts` and try to open `http://localhost:4000/`, you should see the **[GraphQL Playground](https://github.com/prismagraphql/graphql-playground)** UI.
