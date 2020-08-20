---
id: get-started
title: Get Started
sidebar_label: Get Started
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To start using GraphQL Modules

## Installation

Install GraphQL and GraphQL Modules using Yarn:

    yarn add graphql graphql-modules

Or Npm:

    npm install --save graphql graphql-modules

## Structure

GraphQL Modules are built out of `Module` and `Application`. Module defines a piece of GraphQL API and builds Application.

### Module

To create a Module, use `createModule`:

```typescript
import { createModule } from 'graphql-modules';

export const myModule = createModule({
  id: 'my-module',
  dirname: __dirname,
  typeDefs: [],
  resolvers: {},
});
```

Each module contains GraphQL Type definitions, unique id and optionally resolvers. That's not everything it can do, Module accepts also Providers ([Dependency Injection](./di/introduction)) and [Middlewares](./advanced/middlewares).

The `id` helps to match errors and exceptions with a module.
Providing `dirname` (with global variable `__dirname`) helps to correlate exceptions with an actual file path of a module.

### Application

As mentioned before, Modules create Application, so let's create one:

```typescript
import { createApplication } from 'graphql-modules';
import { myModule } from './my-module';

const application = createApplication({
  modules: [myModule],
});
```

Application is only capable of using Providers and Middlewares. It can't define GraphQL Schema on its own.

## Requirements

In order to use Queries and Mutations GraphQL Modules have to control the execution phase, in case of Subscriptions it's subscription phase. Application exposes `createExecution` and `createSubscription` methods.

```typescript
import { createApplication } from 'graphql-modules';

const application = createApplication({
  /* ... */
});

const execute = application.createExecution();
const subscribe = application.createSubscription();
```

It's crutial to help GraphQL Modules understand the life cycle of GraphQL Operations.

## Example

You have understood the basics behind separating the schema. Let's create your first module.

```typescript title="/src/modules/my-first-module/index.ts"
import { createModule, gql } from 'graphql-modules';

export const myFirstModule = createModule({
  id: 'my-first-module',
  dirname: __dirname,
  typeDefs: gql`
    type Query {
      myData: Data
    }

    type Data {
      field: String
    }
  `,
});
```

```typescript title="/src/application.ts"
import { createApplication } from 'graphql-modules';
import { myFirstModule } from './modules/my-first-module';

export const application = createApplication({
  modules: [myFirstModule],
});
```

Everything is ready to use in a GraphQL server.

<Tabs
defaultValue="apollo"
values={[
{label: 'Apollo Server', value: 'apollo'},
{label: 'Express GraphQL', value: 'express'},
]
}>
<TabItem value="apollo">

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

```typescript  title="/src/server.ts"
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
</Tabs>

To test your server, run `ts-node index.ts` and try to open [http://localhost:4000/](http://localhost:4000/). You should see GraphiQL.
