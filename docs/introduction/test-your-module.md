---
id: test-your-module
title: Test Your Module
sidebar_label: Test Your Module
---

With GraphQL Modules and dependency injection it's much easier to test your modules.

> Make sure to follow our recommend [development environment configuration](/TODO) to get started with test environment (we recommend [Jest](https://jestjs.io/)).

So let's start with a basic module definition:

`modules/my-module/index.ts`
```typescript
import { GraphQLModule, Injectable } from '@graphql-modules/core';
import gql from 'graphql-tag';

@Injectable()
export class UsersProvider {
  
}

export const userModule = new GraphQLModule({
  name: 'user',
  providers: [UsersProvider],
  typeDefs: gql`
    type User {
      id: String
      username: String
    }
    
    type Query {
      me: User
      userById(id: String!): User
    }
  `,
  resolvers: {
    User: {
      id: user => user._id,
      username: user => user.username,
    },
    Query: {
      me: (root, args, { injector, currentUser }) => currentUser,
      userById: (root, { id }, { injector }) => 
        injector.get<UsersProvider>(UsersProvider).getUserById(id),
    },
  },
});
```
