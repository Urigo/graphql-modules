---
id: modules
title: What's a module?
sidebar_label: What's a module?
---

The GraphQL Modules approach lets you separate your backend implementation to small, reusable, easy-to-implement and easy-to-test pieces.

In GraphQL Modules, each module has its own GraphQL type definitions and resolver implementations.

GraphQL `type`s, `enum`s and `union`s declared on GraphQL Modules are also extensible: modules can re-declare types and extend them as they wish.

The idea behind it is to implement the **[Separation of Concerns](https://deviq.com/separation-of-concerns/)** design pattern in GraphQL and to allow you to write simple modules that only does what it needs to. In this way it's easier to write, maintain and test.

## Module Structure

Each GraphQL `module` is built behind the basics of GraphQL:

- Type definitions
- Resolvers

And as your application grows, modules can have:

- External configurations
- Dependencies for other modules
- Providers (we will elaborate about it in Dependency Injection part)

## Modules Example

To get a better understanding of module structures and its extensibility, let's make an example app with four modules:

- User (define what a user in our app should have)
- Authentication (defines only what is needed for users' authentication)
- Profile (define users' profile)
- Gallery (defined users' photo gallery)

Let's understand how to define each module's schema and how to separate it to smaller pieces.

#### User Module

This module allows querying users by id and it defines only the very basic fields.

```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  email: String!
}
```

#### Authentication Module

This module declares the authentication basics in `Mutation`, `Query` and `User` types.

```graphql
type Query {
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

#### Profile Module

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

#### Gallery Module

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

type Mutation {
  uploadPicture(image: File!): Image
}
```
