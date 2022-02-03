---
id: context
title: Context
sidebar_label: Context
---

In GraphQL, a `context` is an object shared by all the resolvers of a specific execution. It's useful for keeping data such as authentication info, the current user, database connection, data sources and other things you need for running your business logic.

The context is available as the 3rd argument to each resolver:

```ts
const resolvers = {
  Query: {
    myQuery(root, args, context, info) {
      // ...
    }
  }
}
```

GraphQL Modules follow the same approach, so context is shared across modules. That's why there's no API for context building in GraphQL Modules, it's managed by GraphQL server implementation.

You can manage your own `context` object based on your needs, usually it's done by the server implementation, since the `context` object is created and filled with the HTTP request information (`request`), which is a layer that comes before the actual GraphQL engine.

## Context in Dependency Injection

> To get familiar with Dependency Injection, please read the ["Dependency Injection - Introduction"](../di/introduction) chapter.

The `Context` can be accessed directly in resolve function or within Dependency Injection using [`CONTEXT`](../api/api.md#context) token.

```ts
import { CONTEXT, Inject, Injectable } from 'graphql-modules'

@Injectable()
export class Data {
  constructor(@Inject(CONTEXT) private context: GraphQLModules.GlobalContext) {}
}
```
