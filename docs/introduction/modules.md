---
id: modules
title: What's a module?
sidebar_label: What's a module?
---

The GraphQL Modules approach lets you separate your backend implementation into small, reusable, easy-to-implement and easy-to-test pieces.

In GraphQL Modules, each module has its own GraphQL type definitions and resolver implementations.

GraphQL `type`s, `enum`s and `union`s declared in GraphQL Modules are also extensible: modules can re-declare types and extend them as they wish.

The idea behind this is to implement the **[Separation of Concerns](https://deviq.com/separation-of-concerns/)** design pattern in GraphQL and to allow you to write simple modules that only do what they need to. This way, they're easier to write, maintain and test.

## Module Structure

Each GraphQL `module` is built using the basics of GraphQL:

- Type definitions
- Resolvers

As your application grows, modules can have:

- External configurations
- Dependencies on other modules
- Providers (we will elaborate on this in the [Dependency Injection](dependency-injection) section)

## Modules Example

To get a better understanding of the structure and extensibility of modules, let's make an example app with four modules:

- User (define what a user in our app should have)
- Authentication (define only what is needed to authenticate users)
- Profile (define a user's profile)
- Gallery (define a user's photo gallery)

Let's understand how to define each module's schema and how to separate it into smaller pieces.

#### User Module

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
