---
id: type-definitions
title: Type Definitions
sidebar_label: Type Definitions (SDL)
---

GraphQL Schema is built out of Objects, Enums, Interfaces and so on. Defining or extending them in GraphQL Modules is fairly simple.

Just like GraphQL Schema, GraphQL Modules follow the same rules of writing SDL (Schema Definition Language), a single definition per type and multiple extensions. This way we force a good pattern and clarify ownership of each type.

Module accepts a single element or a list. Each element must be of type `DocumentNode` - already parsed (with `graphql-tag` or `gql` tag from `graphql-modules`).

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
});
```

> Using strings could be possible but we decided to force a better pattern. Using `gql` tag means your IDE can highlight the GraphQL SDL and in general works better with tools like GraphQL Codegen.
