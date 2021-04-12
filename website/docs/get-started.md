---
id: get-started
title: Get Started
sidebar_label: Get Started
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To start using GraphQL Modules, all you need is to install it's package and `graphql`.

> We highly recommend to use TypeScript for writing your backend, since it provides support for Reflection (if you plan to use dependency injection) and makes it easier to develop API services.

## Installation

<Tabs
defaultValue="yarn"
values={[
{label: 'Yarn', value: 'yarn'},
{label: 'npm', value: 'npm'},
]
}>
<TabItem value="yarn">

    yarn add graphql graphql-modules

</TabItem>

<TabItem value="npm">

    npm install --save graphql graphql-modules

</TabItem>
</Tabs>

### Your first GraphQL module

To create a Module, use `createModule`:

```typescript
import { createModule, gql } from 'graphql-modules';

export const myModule = createModule({
  id: 'my-module',
  dirname: __dirname,
  typeDefs: [
    gql`
        type Query {
            hello: String!
        }
    `,
  ],
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  },
});
```

Each module contains GraphQL Type definitions, unique id and optionally resolvers.

> That's not everything it can do, Module accepts also Providers ([Dependency Injection](./di/introduction)) and [Middlewares](./advanced/middlewares).

#### What happened here?

We are using `createModule` to declare our module, and name it as `my-module`. Naming is important, because it help you to locate issues in your type definition.

We also added `dirname` and pointed it to `__dirname` in order to make it simpler later to match exception to the correct file. It's optional, but useful.

Next, there is `typeDefs` and `resolvers` which you should already know if you are familiar with GraphQL. It defines the type we have in that module, and the implementation behind it.

At this point, this module acts like a types "capsule" you can load and import to various GraphQL `Applications`s.

### Use your Module

As mentioned before, Modules create Application, so let's create one. We are importing the module we created earlier, and provide it to the application:

```typescript
import { createApplication } from 'graphql-modules';
import { myModule } from './my-module';

// This is your application, it contains your GraphQL schema and the implementation of it.
const application = createApplication({
  modules: [myModule],
});

// This is your actual GraphQL schema
const mySchema = application.schema;
```

> Application doesn't allow providing schemas or resolvers, since it's only a loader of your various modules.

### Use your Application

Now that you have `Module`, `Application` and you got your `GraphQLSchema`, you need to make it available to consumption.

GraphQL-Modules allow you to do much more, like managing the lifecycle of your execution, encapsulate your HTTP request and more. To do that in the most optimal and flexible way, we need to wrap the GraphQL execution flow. Some GraphQL servers implementation allow this kind of flexibility, and some doesn't.

_But we got you covered, and provided solution for all popular GraphQL server implementations._

Your GraphQL `Application` exposes `createExecution` and `createSubscription` methods, which are just plug-and-play replacements for the default functions from `graphql-js`.

<Tabs
defaultValue="apollo"
values={[
{label: 'Apollo Server', value: 'apollo'},
{label: 'Express GraphQL', value: 'express'},
{label: 'GraphQL-Helix', value: 'helix'},
{label: 'Other servers?', value: 'other'},
]
}>
<TabItem value="apollo">

If you are using [Apollo-Server](https://github.com/apollographql/apollo-server), you can use `createSchemaForApollo` to get a schema that is adapted for this server, and integrates with it perfectly.

```typescript title="/src/server.ts"
import { ApolloServer } from 'apollo-server';
import { application } from './application';

const schema = application.createSchemaForApollo();

const server = new ApolloServer({
  schema,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

</TabItem>
<TabItem value="express">

If you are using [Express-GraphQL](https://github.com/graphql/express-graphql), here's how you do it:

```typescript title="/src/server.ts"
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { application } from './application';

const execute = application.createExecution();
const schema = application.schema;

const server = express();

server.use(
  '/',
  graphqlHTTP({
    schema,
    customExecuteFn: execute,
    graphiql: true,
  })
);

server.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/`);
});
```

</TabItem>
<TabItem value="helix">

If you are using [GraphQL-Helix](https://github.com/contrawork/graphql-helix), here's how you do it:

```typescript title="/src/server.ts"
import express from 'express';
import { getGraphQLParameters, processRequest } from 'graphql-helix';
import { application } from './application';

const app = express();
app.use(express.json());

app.use('/graphql', async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };
  const { operationName, query, variables } = getGraphQLParameters(request);

  const result = await processRequest({
    operationName,
    query,
    variables,
    request,
    schema: application.schema,
    execute: application.createExecution(),
    subscribe: application.createSubscription(),
  });

  result.headers.forEach(({ name, value }) => res.setHeader(name, value));
  res.status(result.status);
  res.json(result.payload);
});

app.listen(port, () => {
  console.log(`GraphQL server is running on port ${port}.`);
});
```

</TabItem>
<TabItem value="other">

If you are using a different server or setup, you can get the custom `execute` and `subscribe` functions from your `Application`, and provide it to your server:

```typescript
import { createApplication } from 'graphql-modules';

const application = createApplication({
  /* ... */
});

const schema = application.schema;
const execute = application.createExecution();
const subscribe = application.createSubscription();
```

In case you are still having issues, you can always [report an issue on a missing integration](https://github.com/Urigo/graphql-modules/issues/new), and we'll look into that ;)

</TabItem>
</Tabs>

## Tutorial

If you're interested in a step by step tutorial, one of our community members [Godwin Ekuma](https://blog.logrocket.com/author/godwinekuma/) wrote an amazing article explaining ["How to modularize GraphQL schema with GraphQL Modules"](https://blog.logrocket.com/graphql-modules-tutorial-how-to-modularize-graphql-schema/).
