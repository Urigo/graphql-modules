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

export const myModule = new GraphQLModule({
    name: 'my-module',
    typeDefs,
    resolvers,
});
```

> We can import from `schema.graphql` because we are doing some bundling tricks, if you need help with it, refer to [Development Environment](/) Section.

## With Providers

You can also use `class`es to implement your resolvers. It makes it easier to implement and test, and as your app grows, it's easier to separate your modules to small pieces.

`Provider`s are first-class citizen in GraphQL Modules - they can interact easily with other modules, access the module's configuration, manage it's lifecycle easily and more.

Let's take the previous example and change it to use `Provider`. Let's start by creating a simple class called `UserProvider`. We are also decorating it with a special decorator called `@injectable` - this mark the class as available to use using dependency injection.

`modules/my-module/user.provider.ts`
```typescript
import { injectable } from '@graphql-modules/core';

@injectable()
export class UserProvider {

}
```

Now, let's add this `Provider` to our `GraphQLModule`:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { UserProvider } from './user.provider';

export const myModule = new GraphQLModule({
    name: 'my-module',
    typeDefs,
    resolvers,
    providers: [
        UserProvider,
    ],
});
```

Now, let's implement `Query->user` resolver as a simple function inside `UserProvider`:

```typescript
import { injectable } from '@graphql-modules/core';

@injectable()
export class UserProvider {
    getUserById(id: string) {
        return {
            _id: id,
            username: 'jhon',
        };
    }
}
```

And to use this function from our `Provider` in the actual resolver implementation, we need to access the GraphQL `context`, and get `injector` out of it:

```typescript
export default {
    Query: {
        user: (root, { id }, { injector }) => injector.get(UserProvider).getUserById(id),
    },
    User: {
        id: user => user._id,
        username: user => user.username,
    },
};
```

So now our resolver is just a proxy to our implementation, which means we can replace easily `UserProvider` during tests and use mocks.

That's also means that we can use `UserProvider` from other modules, and use `getUserById` from modules that depends on `my-module`.

Then next step will elaborate on dependency injection, providers and the benefit of it over simple resolvers.
