---
id: your-first-module
title: Your First Module
sidebar_label: Your First Module
---

### What's a `module`?

GraphQL Modules approach let you separate your backend implementation to small, reusable, easy-to-test pieces.

Each module have it's own *type definitions*, *resolvers*, *implementation* and *config*.

GraphQL `type`s, `enum`s and `union`s that declared using GraphQL Modules are also extendable, so modules can re-declare types and extend them as they wish.

Think about the following structure for modules:

#### Authentication Module

This module can declare the authentication basics in `Mutation`, `Query` and `User` types, for example:

```graphql
type Query {
    me: User
}

type Mutation {
    login(username: String!, password: String!): User
    signup(username: String!, password: String!): User
}

type User {
    id: ID!
    username: String!
    email: String!
}
```

#### User Module

This module could decide to allow querying users by id, and in fact, it could only define the very basic fields it needs to run:

```graphql
type Query {
    user(id: ID!): User
}

type User {
    id: ID!
}
```

#### User Profile Module

The profile module can declare the profile `type`, and add the `profile` field to `User`:

```graphql
type Profile {
    age: Int!
    name: String!
}

type User {
    profile: Profile!
}
```


