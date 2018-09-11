---
id: resolvers-composition
title: Resolvers Composition
sidebar_label: Resolvers Composition
---

GraphQL Modules has another powerful feature called Resolvers Composition.

With this feature, you can easily make sure each one of your modules only does what it needs (it's business logic) and does not need to do things that are not related to it.

For example - if you have a simple server with authentication, and you wish to make sure that one of your queries is protected and only allowed for authenticated user and for users that has `EDITOR` role set, it means that your resolver need to verify these rules as well:

```typescript
const resolvers ={
    Query: {
        myQuery: (root, args, context) => {
            // Make sure that the user is authenticated
            if (!context.currentUser) {
                throw new Error('You are not authenticated!');
            }

            // Make sure that the user has the correct roles
            if (!context.currentUser.roles || context.currentUser.roles.includes('EDITOR')) {
                throw new Error('You are not authorized!');
            }

            // Business logic
            if (args.something === '1') {
                return true;
            }

            return false;
        },
    },
};
```

But this is to part of your business logic. It's just part of the flow that you need to run before accessing your resolver.

GraphQL Modules let you separate these concerns - you can implement only the business logic of your resolver, and then later, the app that consumes that module will wrap the resolver with custom logic.

Think about it just like **middleware** implementation.

Let's strip the resolver from all the unnecessary code:

```typescript
const resolvers ={
    Query: {
        myQuery: (root, args, context) => {
            if (args.something === '1') {
                return true;
            }

            return false;
        },
    },
};
```

And let's create util functions in a different file, with the logic we removed.

We will need to implement it just like a resolver, so let's create the same signature as GraphQL resolver, and we also need a way to tell GraphQL Modules that everything is okay (`next` function).

```
export const isAuthenticated = next => async (root, args, context, info) => {
    if (!context.currentUser) {
        throw new Error('You are not authenticated!');
    }

    return next(root, args, context, info);
};

export const hasRole = (role: string) => next => async (root, args, context, info) => {
    if (!context.currentUser.roles || context.currentUser.roles.includes(role)) {
        throw new Error('You are not authorized!');
    }

    return next(root, args, context, info);
};
```


Now, on our `GraphQLApp` declaration, let's add `resolversComposition` and add a map between `Type.field` to the function (or functions) we wish to wrap the resolver with:

```typescript
import { GraphQLApp } from '@graphql-modules/core';
import { myModule } from './modules/my-module';

const graphQlApp = new GraphQLApp({
    modules: [
        myModule,
    ],
    resolversComposition: {
        'Query.myQuery': [isAuthenticated, hasRole('EDITOR')],
    },
});
```

Now before each execution of the `myQuery` resolver, GraphQL Modules will make sure to execute `isAuthenticated` and `hasRole` before.

> This feature is useful for things like authentication, authorization, permissions, keeping things like last activity, verifying that objects exists and a lot more!

The great thing about resolvers composition is that our resolver just does it's basic job without other logic, and the app can extend it later to it's internal rules.

This way it's easier to re-use module - you can implement the logic once, but wrap it with different rules later.
