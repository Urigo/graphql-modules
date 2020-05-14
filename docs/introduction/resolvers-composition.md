---
id: resolvers-composition
title: Resolvers Composition
sidebar_label: Resolvers Composition
---

GraphQL Modules has another powerful feature called 'Resolvers Composition'.
With this feature, you can easily make sure each of your modules only performs the business logic it needs to do, and does not perform unrelated operations.

## With Basic Resolvers

For example, if you have a simple server with authentication and you wish to make sure that one of your queries is protected and only allowed for authenticated users with the `EDITOR` role, your resolver needs to verify these rules as well:

```typescript
const resolvers = {
  Query: {
    myQuery: (root, args, context) => {
      // Make sure that the user is authenticated
      if (!context.currentUser) {
        throw new Error('You are not authenticated!');
      }

      // Make sure that the user has the correct roles
      if (!context.currentUser.roles || !context.currentUser.roles.includes('EDITOR')) {
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

But the authorization checks are not part of your business logic;
they're just part of the flow that you should run before accessing your resolver.

GraphQL Modules lets you separate these concerns: you can implement only the business logic of your resolver and then the app that consumes the module will wrap the resolver with custom logic.

The concept is similar to that of **middleware**.

Let's strip the resolver of all the unnecessary code:

```typescript
const resolvers = {
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

And let's create utility functions in different files with the logic we have removed here.

We can implement authentication and authorization just like GraphQL resolvers; we need to tell GraphQL Modules that the process has succeeded by calling the `next` function.

```typescript
export const isAuthenticated = () => (next) => async (root, args, context, info) => {
  if (!context.currentUser) {
    throw new Error('You are not authenticated!');
  }

  return next(root, args, context, info);
};

export const hasRole = (role: string) => (next) => async (root, args, context, info) => {
  if (!context.currentUser.roles || !context.currentUser.roles.includes(role)) {
    throw new Error('You are not authorized!');
  }

  return next(root, args, context, info);
};
```

Now in our `GraphQLModule` declaration, let's add `resolversComposition` with a map from `TypeName.fieldName` to the function/functions we wish to wrap the resolver with.

```typescript
import { GraphQLModule } from '@graphql-modules/core';

const MyModule = new GraphQLModule({
  /*...*/
  resolversComposition: {
    'Query.myQuery': [isAuthenticated(), hasRole('EDITOR')],
  },
});
```

Before each execution of the `myQuery` resolver, GraphQL Modules makes sure to execute `isAuthenticated` and `hasRole`.

Furthermore, if our logic applies to more than one resolver under `Query`, we can use wild cards.

```typescript
import { GraphQLModule } from '@graphql-modules/core';

const MyModule = new GraphQLModule({
  /*...*/
  resolversComposition: {
    'Query.*': [isAuthenticated(), hasRole('EDITOR')],
  },
});
```

In this case, Before each execution of any resolver under `Query`, GraphQL Modules makes sure to execute `isAuthenticated` and `hasRole`.

> This feature is useful for things like authentication, authorization, permissions, keeping things like last activity, verifying that objects exist and a lot more!

The great thing about resolvers composition is that each of our resolvers just does its own job without unrelated logic and the app can extend resolvers later on arbitrary rules.

Now it's easier to re-use modules: you can implement the logic once and wrap it with different rules later.
