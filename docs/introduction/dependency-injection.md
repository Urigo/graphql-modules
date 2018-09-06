---
id: dependency-injection
title: Dependency Injection
sidebar_label: Dependency Injection
---

GraphQL Modules let you use dependency injection between your modules, and let you inject config, functions, classes and instances to your modules.

We are wrapping **[InversifyJS](http://inversify.io/)** and expose a simple API that covers most of the use-cases of relations between backend modules.

We learned not to force you to use dependency injection too early in the process, because dependency injection make sense on some specific use cases and you should need to use it only when it helps you move faster and as your codebase grows.

GraphQL Modules let you choose whether to use dependency injection or not.

### Providers

Let's start by creating a simple class called `UserProvider`. We are also decorating it with a special decorator called `@injectable` - this mark the class as available to use using dependency injection.

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

Now, let's implement `Query.user` resolver as a simple function inside `UserProvider`:

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
