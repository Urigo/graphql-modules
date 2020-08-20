---
id: resolvers
title: Resolvers
---

Let's focus on resolve functions usually called just resolvers.

You implement resolve functions in a standard way, just like in any other GraphQL library.

GraphQL Modules are smart enough to detect incorrect resolvers (that don't match type definitions or extensions for example). It also prevents duplicates.

Let's take for an example the following schema for `User` and `Query`.

```typescript
import { createModule, gql } from 'graphql-modules';

export const myModule = createModule({
  id: 'my-module',
  dirname: __dirname,
  typeDefs: gql`
    type Query {
      user(id: ID!): User
    }

    type User {
      id: ID!
      username: String!
    }
  `,
  resolvers: {
    Query: {
      user(root, { id }) {
        return {
          _id: id,
          username: 'jhon',
        };
      },
    },
    User: {
      id(user) {
        return user._id;
      },
      username(user) {
        return user.username;
      },
    },
  },
});
```
