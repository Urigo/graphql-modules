---
id: context
title: Context
sidebar_label: Context
---

In GraphQL, a context is an object shared by all the resolvers of a specific execution. It's useful for keeping data such as authentication info, the current user, database connection, data sources and other things you need for running your business logic.

The context is available as the 3rd argument to each resolver:

```typescript
const resolvers = {
  Query: {
    myQuery(root, args, context, info) {
      // ...
    },
  },
};
```

GraphQL Modules follow the same approach, so context is shared across modules. That's why there's no API for context building in GraphQL Modules, it's managed by GraphQL server implementation.

## Shaping Context type

GraphQL Modules expose a global namespace called `GraphQLModules`, so there's no need to pass the same signature over and over again as part of generic types of different APIs.

Context is global and shared across modules and application which means you can define it once and it applies automatically everywhere.

Use `GraphQLModules.GlobalContext` like this:

```typescript
declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      request: any;
    }
  }
}
```

Now every piece of GraphQL Modules understands the context and you gain much stronger type-safety.

## Using Context type

There's `GlobalContext` you need to define and also `Context` that you need to consume. `Context` contains provided `GlobalContext` internally and includes also `Injector`.

> The `GlobalContext` type is only to define the context, do not use it anywhere.

Using `GraphQLModules.Context` is simple and because it's a globally available type, you just use it, there's no need to import it from `graphql-modules` package.

```typescript
const resolvers = {
  Query: {
    myQuery(root, args, context: GraphQLModules.Context, info) {
      // ...
    },
  },
};
```

## Context in Dependency Injection

> To get familiar with Dependency Injection, please read the ["Dependency Injection - Introduction"](../di/introduction) chapter.

The Context can be accessed directly in resolve function or within Dependency Injection using [`CONTEXT`](../api#context) token.

```typescript
import { CONTEXT, Inject, Injectable } from 'graphql-modules';

@Injectable()
export class Data {
  constructor(@Inject(CONTEXT) private context: GraphQLModules.GlobalContext) {}
}
```
