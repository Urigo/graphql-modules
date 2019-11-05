---
id: load-your-schema
title: Load Your Schema and Resolvers
sidebar_label: Load Your Schema and Resolvers
---

There are multiple ways to load your schema, and GraphQL Modules tries to make it easy for you.

## Using `sonar` in `graphql-toolkit`

You can use `graphql-toolkit`, it has a powerful mechanism for finding and loading your schema and resolvers files.

Along with `graphql-toolkit`'s `sonar`, you can separate your GraphQL schema definition and resolvers to smaller parts, and load them without directly specifying files.

For example, given the following structure:

```
modules/
    my-module/
        index.ts
        schema/
            user.graphql
            query.graphql
            mutation.graphql
        resolvers/
            user.ts
            query.ts
            mutation.ts
```

You can easily load all of your `.graphql` files and `.ts` resolvers files like below:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from 'graphql-toolkit';

export const UserModule = new GraphQLModule({
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/')
});
```

This way, you don't have to specify each file and each resolver; the tools will do it for you.

## Using imports and `graphql-import-node`

You can also write your schema and resolvers in different files and then import them using **[graphql-import-node](https://github.com/ardatan/graphql-import-node)**:

`modules/my-module/index.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import resolvers from './resolvers';
import * as typeDefs from './schema.graphql';

export const UserModule = new GraphQLModule({
  resolvers,
  typeDefs
});
```

`modules/my-module/resolvers.ts`

```typescript
export default {
  User: {
    id: () => {}
  },
  Query: {
    user: () => {}
  }
};
```

`modules/my-module/schema.graphql`

```graphql
type User {
  id: String
}

type Query {
  user(id: Int!): User
}
```

## As a string

The simplest way to load your schema and resolvers into a module is to write them directly on your `GraphQLModule` definition:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export const UserModule = new GraphQLModule({
  resolvers: {
    User: {
      id: () => {}
    },
    Query: {
      user: () => {}
    }
  },
  typeDefs: gql`
    type User {
      id: String
    }

    type Query {
      user(id: Int!): User
    }
  `
});
```
