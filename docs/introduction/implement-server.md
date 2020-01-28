---
id: implement-server
title: Implement Your Server
sidebar_label: Implement Server
---

To get started, add `express` and `express-graphql` to your app:

```bash
yarn add express express-graphql
```

Then,

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

const { schema } = new GraphQLModule({
  /*...*/
});

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(4000);
```

> To test your server, run `ts-node index.ts` and try to open `http://localhost:4000/`. See the **[GraphiQL](https://github.com/graphql/graphiql)** UI.

> If you want to use **[Apollo-Server](https://www.apollographql.com/docs/apollo-server/getting-started.html)**, check the **[Integrate with Apollo Server](/docs/recipes/apollo-server)** section.
