---
id: index
title: Introduction
sidebar_label: Introduction
---

**GraphQL Modules** is a utility library, allowing you to separate your GraphQL schema implementation into small, reusable, easy-to-implement and easy-to-test pieces.

In GraphQL Modules, each module has its own GraphQL type definitions and resolver implementations.

The idea behind this is to implement the **[Separation of Concerns](https://deviq.com/separation-of-concerns/)** design pattern in GraphQL and to allow you to write simple modules that only do what they need to. This way, they're easier to write, maintain and test.

During development, GraphQL-Modules allow you to separate your GraphQL schema definitions, while at runtime, you'll be able to serve a unified schema.

## Structure

Each GraphQL `module` is built using the basics of GraphQL:

- Type definitions
- Resolver functions

As your application grows, modules can use [Dependency Injection](./di/introduction), if you wish to separate your resolvers and your business-logic.

The structure of GraphQL API with GraphQL Modules is flat. `Module`s are on the same level and there's `Application` on top of them.

## Example

To get a better understanding of the structure and extensibility of modules, let's make an example app with four modules:

- User (define what a user in our app should have)
- Authentication (define only what is needed to authenticate users)
- Profile (define a user's profile)
- Gallery (define a user's photo gallery)

![example](/img/example.png)

Let's understand how to define each module's schema and how to separate it into smaller pieces.

Each one of our modules contributes a small part of the schema, and the GraphQL `Application` merges it into a complete schema.

### User Module

This module allows querying users by id and defines only the very basic fields.

```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  email: String!
}
```

### Authentication Module

This module declares the authentication basics in `Mutation`, `Query` and `User` types.

```graphql
extend type Query {
  me: User
}

type Mutation {
  login(username: String!, password: String!): User
  signup(username: String!, password: String!): User
}

extend type User {
  username: String!
}
```

### Profile Module

The profile module declares the `Profile` type and adds the `profile` field to `User`:

```graphql
type Profile {
  age: Int!
  name: String!
}

extend type User {
  profile: Profile!
}
```

### Gallery Module

The gallery module is similar to the `profile` module. It declares only the parts of the schema that are required by the gallery feature:

```graphql
type Image {
  id: ID!
  url: String!
  user: User!
}

extend type User {
  gallery: [Image]
}

extend type Mutation {
  uploadPicture(image: File!): Image
}
```
