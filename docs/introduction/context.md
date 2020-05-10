---
id: context
title: Context
sidebar_label: Context
---

In GraphQL, a context is an object shared by all the resolvers of a specific execution.
It's useful for keeping data such as authentication info, the current user, database connection, data sources and other things you need for running your business logic.

The context is available as the 3rd argument to each resolver:

```typescript
const resolvers = {
  Query: {
    myQuery: (root, args, context, info) => {}
  }
};
```

> You can read more about resolver in **[Apollo Server documentation](https://www.apollographql.com/docs/graphql-tools/resolvers#Resolver-function-signature)**.

Since modules are isolated (see [why](https://medium.com/the-guild/why-is-true-modular-encapsulation-so-important-in-large-scale-graphql-projects-ed1778b03600)), there is no common context unless you explicitly create one. In the [case of authentication](https://www.apollographql.com/docs/apollo-server/security/authentication/#putting-user-info-on-the-context) for example, you need to create an authentication module that places the authenticated user into the context, then explicitly import that authentication module from each module that uses authentication.

GraphQL Modules also uses the context; it adds to the context a field called `injector`, which you can use to get access to the dependency injection container of your `GraphQLModule`.

You can use the `injector` from any resolver like that:

```typescript
import { ModuleContext } from '@graphql-modules/core';

export default {
  Query: {
    myQuery: (_, args, { injector }: ModuleContext) => injector.get(MyProvider).doSomething()
  }
};
```

### Context Builders

In addition to the added `injector`, GraphQL Modules lets you add custom fields to the `context`.

Each module can have its own `context` function, which takes the network session that contains the request, the current context and the injector and can extend the GraphQL `context` with any field.

To add a custom `context` to your `GraphQLModule`, do the following:

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
      myField: 'some-value'
    };
  }
});
```

> Your custom context-building function should return either `object` or `Promise<object>`.

Then, in any of your resolvers, you can access it this way:

```typescript
import { ModuleContext } from '@graphql-modules/core';
import { IMyModuleContext } from './my-module';

export default {
  Query: {
    myQuery: (_, args, { myField }: ModuleContext<IMyModuleContext>) => injector.get(MyProvider).doSomething(myField)
  }
};
```

You can also use this feature to implement authentication easily; you just access the network session, write async code, and return the current user, which is added to the `context`. For example:

```typescript
import { GraphQLModule, Injector } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { AuthenticationProvider } from './auth-provider';

export interface User {
  firstName: string;
  lastName: string;
}

export interface ISession {
  req: express.Request;
  res: express.Response;
}

export const AuthModule = new GraphQLModule({
  typeDefs,
  resolvers,
  providers: [AuthenticationProvider],
  async context(session: ISession, currentContext, { injector }) {
    const authToken = session.req.headers.authentication;
    const currentUser = injector.get(AuthenticationProvider).authorizeUser(authToken);
    return {
      currentUser
    };
  }
});
```

See also the article **[Authentication and Authorization in GraphQL (and how GraphQL-Modules can help)](https://medium.com/the-guild/authentication-and-authorization-in-graphql-and-how-graphql-modules-can-help-fadc1ee5b0c2)**.
