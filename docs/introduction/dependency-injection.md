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

Let's start by creating a simple class called `UserProvider`. We are also decorating it with a special decorator called `@Injectable` - this mark the class as available to use using dependency injection.

`modules/my-module/user.provider.ts`

```typescript
import { Injectable } from '@graphql-modules/core';

@Injectable()
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
import { Injectable } from '@graphql-modules/core';

@Injectable()
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

And to use this function from our Provider in the actual resolver implementation, we need to access the GraphQL context, and get injector out of it:

```typescript
import { ModuleContext } from '@graphql-modules/core';

export default {
    Query: {
        user: (_, { id }: { id: string }, { injector }: ModuleContext) =>
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

To use `Provider` from other module, you can just inject it using .

Injection token are just a way to identify your value and fetch it from the poll of the available injectables.

It could be either `class`, `string` or `Symbol`.

To get `OtherProvider` from `MyProvider`, do the following:

```typescript
import { Injectable, Inject } from '@graphql-modules/core';
import { OtherProvider } from '../my-other-module/other.provider';

@Injectable()
export class MyProvider {
    constructor(private otherProvider: OtherProvider) {

    }
}
```

> We added `private` on the argument declaration because it's just a TypeScript trick to declare a class member and set it at the same time, so now `this.otherProvider` will be available to use.

## Injection Tokens

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
import { Injectable, Inject } from '@graphql-modules/core';

interface IOtherProviderSignature {
    doSomething: () => void;
}

@Injectable()
export class MyProvider {
    constructor(@Inject(MY_CLASS_TOKEN) private otherProvider: IOtherProviderSignature) {

    }
}
```

> This is a very common and useful design-pattern related to dependency injection, and with the power of TypeScript interfaces, you can easily use it.

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

### Value

Value providers are an easy way to pass an existing instance of `class` or any other value that you wish to make available to `@Inject`.

You can use any value, and attach it to a dependency injection token.

```typescript
const MY_VALUE = 'myUsefulVal8e';

export const myModule = new GraphQLModule({
    name: 'my-module',
    providers: [
        { provide: MY_VALUE, useValue: 'Hello!' },
    ],
});
```

> You can use Value injectables to inject instances and global injectables, such as `Logger` instance, database connection/collections, secret tokens and more.

## Built-in Injectables

GraphQL Modules give you some built-in injectables, and you can inject them into your providers/resolvers and use them according to your need.

### `OnRequest hook`

With this, you can get access to useful information: the top `GraphQLModule` instance, GraphQL Context, and the network request.

```typescript
import { injectable, OnRequest, inject } from '@graphql-modules/core';

@Injectable()
export class MyProvider implements OnRequest {

    onRequest(networkRequest, currentContext, graphQlAppModule) {
        // ...do your magic...
    }
}
```

`onRequest` hook [API is available here](/TODO)

### `ModuleConfig(moduleName: string)`

This injectable will fetch the a module's configuration object that passed via `forRoot`.

You can read more about [module configuration here](/TODO).

```typescript
import { Injectable, ModuleConfig, Inject } from '@graphql-modules/core';

@Injectable()
export class MyProvider {
    constructor(@Inject(ModuleConfig('my-module')) private config) {

    }
}
```

### `CommunicationBridge`

GraphQL Module has a built-in Pub/Sub mechanism you can use to dispatch messages between modules, called `CommunicationBridge`.

The messages are built in a form of `string => any` - so the key of each message must be a `string`, and you can basically dispatch anything that you can send over network.

It's useful to dispatch messages between modules without knowing who will handle the message (for implementing features like notifications and auditing).

```typescript
import { Injectable, CommunicationBridge } from '@graphql-modules/core';

@Injectable()
export class MyProvider {
    constructor(private pubsub: CommunicationBridge) {
        // Listen to messages and handle them
        pubsub.subscribe('NOTIFY_USER', payload => {
            // Do something
        });
    }

    doSomething() {
        // Publish messages
        pubsub.publish('DO_SOMETHING_ELSE', {
            foo: 'bar',
        });
    }
}
```

You can read more about [communication between modules here](/TODO) and [microservices support here](/TODO).

`CommunicationBridge` [API is available here](/TODO)
