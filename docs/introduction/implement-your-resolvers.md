---
id: implement-your-resolvers
title: Implement Your Resolvers
sidebar_label: Implement Your Resolvers
---

GraphQL Modules let you implement your GraphQL resolvers in a normal way, just like any other GraphQL application.

When your app grows and becomes more complex, you can use **Providers** (it's just a class...) to implement your resolvers' logic.

## Basic Resolvers

To get started with basic resolvers implementation, create a simple object with typeName -> fields mapping.

Let's take for the example the following schema for `User` and `Query`:

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

Let's implement the resolvers object, for now we will use just static mocked objects:

`modules/my-module/resolvers.ts`
```typescript
export default {
    Query: {
        user: (root, { id }) => {
            return {
                _id: id,
                username: 'jhon',
            };
        },
    },
    User: {
        id: user => user._id,
        username: user => user.username,
    },
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
    resolvers,
});
```

> We can import from `schema.graphql` because we are doing some bundling tricks, if you need help with it, refer to [Development Environment](/TODO) Section.

## Resolvers Handlers

 You can also use handler `class`es to implement your resolvers. It makes it easier to implement and test, and as your app grows, it's easier to separate your modules to small pieces.
 `modules/my-module/resolvers-handlers/query.ts`

 ```typescript

import { ResolversHandler } from '@graphql-modules/core';
 @ResolversHandler('Query')
export class QueryResolversHandler {
  user(root, { id }){
    return {
      _id: id,
      username: 'jhon',
    };
  }
}
```

```typescript
import { ResolversHandler } from '@graphql-modules/core';
 @ResolversHandler('User')
export class UserResolversHandler {
  id(user){
    return user._id;
  }
  username(user){
    return user.username;
  }
}
```

`modules/my-module/index.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import { QueryResolvers } from './resolvers-handlers/query';
import { UserResolvers } from './resolvers-handlers/user';
 export const myModule = new GraphQLModule({
    name: 'my-module',
    typeDefs,
    resolversHandlers: [
      QueryResolversHandler,
      UserResolversHandler
    ],
});
```

## With Providers

`Provider`s are first-class citizen in GraphQL Modules - they can interact easily with other modules, access the module's configuration, manage it's lifecycle easily and more.

To get to know how to use `Provider`s, in the next step, we will take the previous example and change it to use `Provider`.
