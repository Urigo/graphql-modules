---
id: modules
title: What's a module?
sidebar_label: What's a module?
---

GraphQL Modules approach let you separate your backend implementation to small, reusable, easy-to-implement and easy-to-test pieces.

In GraphQL Modules,Each module have it's own GraphQL type definitions and resolvers implementation.

GraphQL `type`s, `enum`s and `union`s that declared using GraphQL Modules are also extendable, so modules can re-declare types and extend them as they wish.

The idea behind it to implement **[Separation of Concerns](https://deviq.com/separation-of-concerns/)** design pattern in GraphQL, and to allow you to write simple modules that does only what it needs. This way it's easier to write, maintain and test.

## Module Structure

Each GraphQL `module` is built the basics of GraphQL:

- Type definitions
- Resolvers

And as your application grows, modules can have:

- External configurations
- Dependencies for other modules
- Providers (we will elaborate about it in Dependency Injection part)

## Modules Example

To get a better understanding of modules structure and it's extendability, let's take for example an app with 3 imports: 

- Authentication (defines only what it needs for users' authentication)
- Users (define what user in our app should have)
- Profile (define a user's profile)
- Gallery (defined a users' photo gallery)

Let's understand how to define each module's schema, and how to separate it to smaller pieces:

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
    email: String!
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

#### Gallery Module

The gallery module is similar to `profile` module, and it only declares the parts of the schema that required by the gallery feature:

```graphql
type Image {
    id: ID!
    url: String!
    user: User!
}

type User {
    gallery: [Image]
}

type Mutation {
    uploadPicture(image: File!): Image
}
```
