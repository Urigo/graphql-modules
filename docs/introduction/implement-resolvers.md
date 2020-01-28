---
id: implement-resolvers
title: Implement Your Resolvers
sidebar_label: Implement Resolvers
---

GraphQL Modules lets you implement your GraphQL resolvers in a standard way, just like other GraphQL applications.

## Basic Resolvers

To get started with implementing basic resolvers, create a simple object with a 'type name → fields' mapping.

Let's take for an example the following schema for `User` and `Query`.

`modules/my-module/schema.graphql`

```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  username: String!
}
```

Let's implement the resolvers object. For now we will use just static mocked objects.

`modules/my-module/resolvers.ts`

```typescript
export default {
  Query: {
    user: (root, { id }) => {
      return {
        _id: id,
        username: 'jhon'
      };
    }
  },
  User: {
    id: user => user._id,
    username: user => user.username
  }
};
```

Now, update your `GraphQLModule` declaration to load the resolvers:

`modules/my-module/index.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';

export const MyModule = new GraphQLModule({
  typeDefs,
  resolvers
});
```

> We can import from `schema.graphql` because we are doing some bundling tricks. If you need help with it, refer to the **[Development Environment](/docs/recipes/development-environment)** section.

## With Providers

`Provider`s are a first-class citizen in GraphQL Modules - they can easily interact with other modules, access modules' configurations, manage their lifecycles, and more.

To know how to use `Provider`s, in the next step, we will take the previous example and change it to use `Provider`.
