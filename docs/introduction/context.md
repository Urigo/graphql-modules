---
id: context
title: Context
sidebar_label: Context
---

In GraphQL, a Context is an object shared by all the resolvers of a specific execution. It's useful for keeping data such as authentication info, the current user, database connection, data sources and other things you need for running your business logic.

The `context` is available as 3rd argument of each resolver:

```typescript
const resolvers = {
    Query: {
        myQuery: (root, args, context, info) => {

        },
    },
};
```

> You can read more about resolver in [Apollo Server documentation](https://www.apollographql.com/docs/graphql-tools/resolvers#Resolver-function-signature).

GraphQL Modules also uses the `context`, and it add to the context a field called `injector`, which you can use to get access to the dependency injection container of your `GraphQLModule`.

You can use the `injector` from any resolver like that:

```typescript
import { ModuleContext } from '@graphql-modules/core';

export default {
    Query: {
        myQuery: (_, args, { injector }: ModuleContext) =>
            injector.get(MyProvider).doSomething(),
    },
};
```

### Context Builders

In addition to the added `injector`, GraphQL Modules let you add custom fields to the `context`.

Each module can have it's own `context` function or object, which get's the network session that contains request, the current `context`, and the `injector` and can extend the GraphQL `context` with any field.

To add a custom `context` to your `GraphQLModule` do the following:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';

export interface IMyModuleContext {
    myField: string;
}

export const MyModule = new GraphQLModule<{}, {}, IMyModuleContext>({
    typeDefs,
    resolvers,
    context: (session, currentContext, moduleSessionInfo) => {
        return {
            myField: 'some-value',
        };
    },
});
```

> Your custom context building function should return either `object` or `Promise<object>`.

Then, in any of your resolvers, you can access it this way:

```typescript
import { ModuleContext } from '@graphql-modules/core';
import { IMyModuleContext } from './my-module';

export default {
    Query: {
        myQuery: (_, args, { myField }: ModuleContext<IMyModuleContext>) =>
            injector.get(MyProvider).doSomething(myField),
    },
};
```

You can also use this feature to implement authentication easily, because you have access to the network session, you can write async code, and you can return the current user and add it to the `context`, for example:

```typescript
import { GraphQLModule, Injector } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { AuthenticationProvider } from './auth-provider';

export interface User {
  firstName: string;
  lastName: string;
}

export interface IAuthModuleContext {
  currentUser: User;
}

export interface IAuthModuleRequest {
  req: express.Request;
}

export const AuthModule = new GraphQLModule<{}, IAuthModuleRequest, IAuthModuleContext>({
    typeDefs,
    resolvers,
    providers: [
      AuthenticationProvider,
    ],
    async context(session, currentContext, { injector }) {
        const authToken = session.req.headers.authentication;
        const currentUser = injector.get(AuthenticationProvider).authorizeUser(authToken);
        return {
            currentUser,
        };
    },
});
```

You can read more about [authentication and how to implement it here](https://medium.com/the-guild/authentication-and-authorization-in-graphql-and-how-graphql-modules-can-help-fadc1ee5b0c2).
