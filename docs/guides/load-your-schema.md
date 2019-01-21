---
id: load-your-schema
title: Load Your Schema and Resolvers
sidebar_label: Load Your Schema and Resolvers
---

There are multiple ways to load your schema, and GraphQL Modules tries to make it easier as possible for you.

## Using Sonar And Epoxy

One of the tools of GraphQL Modules is `@graphql-modules/epoxy`, it has a power mechanism for finding and loading your schema and resolvers files.

Along with `@graphql-modules/epoxy`, you can separate your GraphQL schema definition and resolvers to smaller parts, and load without specifying each file.

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

You can easily load all of your `.graphql` files and `.ts` resolvers files like that:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeResolvers } from '@graphql-modules/epoxy';

export const UserModule = new GraphQLModule({
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});
```

This way, you don't have to specify each file and each resolver and import it - these tools will do it for you.

## Using Imports

You can also write your schema and resolvers in different field, and import them using **[graphql-import-node](https://github.com/ardatan/graphql-import-node)**:

`modules/my-module/index.ts`
```typescript
import { GraphQLModule } from '@graphql-modules/core';
import resolvers from './resolvers';
import * as typeDefs from './schema.graphql';

export const UserModule = new GraphQLModule({
  resolvers,
  typeDefs,
});
```

`modules/my-module/resolvers.ts`
```typescript
export default {
   User: {
       id: () => { },
   },
   Query: {
       user: () => { },
   },
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

## As String

The simplest way to load your schema and resolvers into a module, is to write them directly on your `GraphQLModule` definition:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export const UserModule = new GraphQLModule({
  resolvers: {
    User: {
        id: () => { },
    },
    Query: {
        user: () => { },
    },
  },
  typeDefs: gql`
    type User {
      id: String
    }

    type Query {
      user(id: Int!): User
    }
  `,
});
```
