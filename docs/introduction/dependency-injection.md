---
id: dependency-injection
title: Dependency Injection
sidebar_label: Dependency Injection
---

GraphQL Modules let you use dependency injection between your modules, and let you inject config, functions, classes and instances to your modules.

We are wrapping **[InversifyJS](http://inversify.io/)** and expose a simple API that covers most of the use-cases of relations between backend modules.

We learned not to force you to use dependency injection too early in the process, because dependency injection make sense on some specific use cases and you should need to use it only when it helps you move faster and as your codebase grows.

GraphQL Modules let you choose whether to use dependency injection or not.

## Providers

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

> `Provider` lifecycle is by default as singleton, so you can use the implemented functions as util functions, but still use `this` to save global variables.

And to use this function from our `Provider` in the actual resolver implementation, we need to access the GraphQL `context`, and get `injector` out of it:

```typescript
import { AppContext } from '@graphql-modules/core';

export default {
    Query: {
        user: (_, { id }: { id: string }, { injector }: AppContext) =>
            injector.get(UserProvider).getUserById(id),
    },
    User: {
        id: user => user._id,
        username: user => user.username,
    },
};
```

So now our resolver is just a proxy to our implementation, which means we can replace easily `UserProvider` during tests and use mocks.

That's also means that we can use `UserProvider` from other modules, and use `getUserById` from modules that depends on `my-module`.

## Import providers from other modules

To use `Provider` from other module, you just need to use `@inject` and specify the injection token you wish to get.

Injection token are just a way to identify your value and fetch it from the poll of the available injectables.

It could be either `class`, `string` or `Symbol`.

To get `OtherProvider` from `MyProvider`, do the following:

```typescript
import { injectable, inject } from '@graphql-modules/core';

@injectable()
export class MyProvider {
    constructor(@inject(OtherProvider) private otherProvider: OtherProvider) {

    }
}
```

> We added `private` on the argument declaration because it's just a TypeScript trick to declare a class member and set it at the same time, so now `this.otherProvider` will be available to use.

## App-Level Providers

Besides adding providers to each module, you can declare and add modules to your `GraphQLApp`.

Add `providers: [...]` to your `GraphQLApp` declaration, and add there the list of `Provider`s you wish to expose.

App-level providers are useful when you need to provide global instances and utils, such as logger, database instance, remote service connection and so on.

## Custom Injectables

You can also create custom `Provider`s, which are non-classes, with dependency injection tokens.

It's useful when you want your module to get something from outside with a specific signature.

You can use custom dependency injection tokens to identify your injectables, so let's assume you need to get a an object that matches the following

### Class

So we already learned how to provide classes. Just specify the class in the list of `providers` on your modules declaration:

```typescript
export const myModule = new GraphQLModule({
    name: 'my-module',
    providers: [
        UserProvider,
    ],
});
```

> Class providers lifecycle are singleton - which means they are created only once, and you are using the same instance for all GraphQL executions.

If you wish to decouple the actual class implementation and the dependency injection token, you can create your own DI token, and declare it this way:

```typescript
const MY_CLASS_TOKEN = 'myAwesomeClassIdentifier';

export const myModule = new GraphQLModule({
    name: 'my-module',
    providers: [
        { provide: MY_CLASS_TOKEN, useClass: MyProvider },
    ],
});
```

This way, you can ask for the actual value of `MY_CLASS_TOKEN` from other providers, without knowing the specific implementation:

```typescript
import { injectable, inject } from '@graphql-modules/core';

interface IOtherProviderSignature {
    doSomething: () => void;
}

@injectable()
export class MyProvider {
    constructor(@inject(MY_CLASS_TOKEN) private otherProvider: IOtherProviderSignature) {

    }
}
```

### Value

Value providers are an easy way to pass an existing instance of `class` or any other value that you wish to pass.

Think about it as a way to get values from outside the module, which usually shared across modules like `Logger`.

To
