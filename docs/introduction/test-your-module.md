---
id: test-your-module
title: Test Your Module
sidebar_label: Test Your Module
---

With GraphQL Modules and dependency injection it's much easier to test your modules.

> Make sure to follow our recommend [development environment configuration](/TODO) to get started with test environment (we recommend [Jest](https://jestjs.io/)).

So let's start with a basic module definition:

`modules/my-module/schema.graphql`
```graphql
type Query {
    me: User
}

type Mutation {
    login(username: String!, password: String!): User
}

type User {
    id: ID!
    username: String!
    email: String!
}
```

`modules/my-module/index.ts`

