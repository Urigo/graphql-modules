---
id: context
title: Context
sidebar_label: Context
---

In GraphQL, a Context is an object shared by all the resolvers of a specific execution. It's useful for keeping data such as authentication info, the current user, database connection, data sources and other things you need for running your business logic.

The `context` is available as 3rd argument of each resolver:

```
const resolvers = {
    Query: {
        myQuery: (root, args, context, info) => {

        },
    },
};
```

> You can read more about resolver in [Apollo Server documentation](https://www.apollographql.com/docs/graphql-tools/resolvers#Resolver-function-signature).

GraphQL Modules also uses the `injectFn`, which you can use to get access to the dependency injection container of your `GraphQLModule`.

You can use the `injectFn` from any resolver like that:

```typescript
import { AppContext } from '@graphql-modules/core';

export default {
    Query: {
        myQuery: injectFn((myProvider1: MyProvider) =>
            injector.get(MyProvider).doSomething(), MyProvider),
    },
};
```

### Context Builders

In addition to the added `injector`, GraphQL Modules let you add custom fields to the `context`.

Each module can have it's own `contextBuilder` function, which get's the network request, the current `context`, and the `injector` and can extend the GraphQL `context` with any field.

To add a custom `contextBuilder` to your `GraphQLModule` do the following:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';

export const myModule = new GraphQLModule({
    name: 'my-module',
    typeDefs,
    resolvers,
    contextBuilder: (networkRequest, currentContext) => {
        return {
            myField: 'some-value',
        };
    },
});
```

> Your custom context building function should return either `object` or `Promise<object>`.

Then, in any of your resolvers, you can access it this way:

```typescript
import { AppContext } from '@graphql-modules/core';

interface MyExtendedContext extends AppContext {
    myField: string;
}

export default {
    Query: {
        myQuery: (_, args, { myField }: MyExtendedContext) =>
            injector.get(MyProvider).doSomething(myField),
    },
};
```

You can also use this feature to implement authentication easily, because you have access to the network request, you can write async code, and you can return the current user and add it to the `context`, for example:

```typescript
import { GraphQLModule, Injector } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';

export const authModule = new GraphQLModule({
    name: 'auth',
    typeDefs,
    resolvers,
    contextBuilder: async (networkRequest: express.Request, currentContext: object, injector: Injector): Promise<{ currentUser: object}> => {
        const authToken = networkRequest.headers.authentication;
        const currentUser = injector.get(AuthenticationProvider).authorizeUser(authToken);

        return {
            currentUser,
        };
    },
});
```

You can read more about [authentication and how to implement it here](/TODO).
