---
id: dependency-injection
title: Dependency Injection
sidebar_label: Dependency Injection
---

GraphQL Modules let you use dependency injection between your modules, and let you inject config, functions, classes and instances to your modules.

We expose a simple API that covers most of the use-cases of relations between backend modules.

We learned not to force you to use dependency injection too early in the process, because dependency injection make sense on some specific use cases and you should need to use it only when it helps you move faster and as your codebase grows.

GraphQL Modules let you choose whether to use dependency injection or not.

## Providers

Let's start by creating a simple class called `UserProvider` with `@Injectable()` decorator.

`modules/my-module/user.provider.ts`

```typescript
import { Injectable } from '@graphql-modules/di';

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

export const MyModule = new GraphQLModule({
    typeDefs,
    resolvers,
    providers: [
        UserProvider,
    ],
});
```

Now, let's implement `Query.user` resolver as a simple function inside `UserProvider`:

```typescript
import { Injectable } from '@graphql-modules/di';

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

And to use this function from our Provider in the actual resolver implementation, get `injector` from `context`:

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
import { Injectable } from '@graphql-modules/di';
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

export const MyModule = new GraphQLModule({
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
export const MyModule = new GraphQLModule({
    providers: [
        UserProvider,
    ],
});
```

Or use another class which has same interface;

```typescript
export class MyModule = new GraphQLModule({
  providers: [
    {
      provide: SomeAbstractClass,
      useClass: MyImplementation,
    }
  ]
});
```

> Class providers lifecycle are singleton by default - which means they are created only once, and you are using the same instance for all GraphQL executions.

> But you can change the lifecycle using  **Provider Scopes**.

### Value

Value providers are an easy way to pass an existing instance of `class` or any other value that you wish to make available to `@Inject`.

You can use any value, and attach it to a dependency injection token.

```typescript
const MY_VALUE = 'myUsefulVal8e';

export const MyModule = new GraphQLModule({
    providers: [
        {  
          provide: MY_VALUE,
          useValue: 'Hello!',
        },
    ],
});
```

> You can use Value injectables to inject instances and global injectables, such as `Logger` instance, database connection/collections, secret tokens and more.

### Factory

Factory providers another way to pass an instance of `provider`; so the return value of the function will be the value of the provider.

```typescript
const MY_VALUE = 'myUsefulVal8e';

export const MyModule = new GraphQLModule({
    providers: [
        {
          provide: MY_VALUE, 
          useFactory: () => {
            //some extra logic
            return myValue
          },
        },
    ],
});
```

## Hooks

### `OnInit` hook

This hook is called once when your application is started.

Example;

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnInit } from '@graphql-modules/core';
@Injectable()
export class DatabaseProvider implements OnInit {
    constructor(private dbClient: DbClient) {}
    onInit() {
        this.dbClient.connect();
        console.info('Database Client is connected!');
    }
}
```

### `OnRequest` hook

You can get access to useful information: the top `GraphQLModule` instance, GraphQL Context, and the network session by defining this hook as a method in your class provider.

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnRequest } from '@graphql-modules/core';

Example;

@Injectable({
    scope: ProviderScope.Session
})
export class AuthProvider implements OnRequest {
    userId: string;
    onRequest(moduleSessionInfo: ModuleSessionInfo) {
        // ...do your magic...
        // Let's assume you have your network request object under req property of network session
        const authToken = moduleSessionInfo.session.req.headers.authentication;
        this.userId = someFnForTokenExchange(authToken);
    }
}
```

> `OnRequest` hook is called on each HTTP GraphQL request with a single `ModuleSessionInfo` parameter.
[API of `OnRequest` is available here](/docs/api/core/api-interfaces-onrequest)
[API of `ModuleSessionInfo` is available here](/docs/api/core/api-classes-modulesessioninfo)

### `OnResponse` hook (experimental)

It takes same parameter like `OnRequest` hook but it gets called even before the server sends HTTP response to the client.

Example;

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnResponse } from '@graphql-modules/core';

@Injectable()
export class MyProvider implements OnResponse {

    onResponse(moduleSessionInfo: ModuleSessionInfo) {
        // ...do your magic...
        clearDatabasePool(moduleSessionInfo.session);
    }
}
```

> `OnResponse` hook is called on each HTTP GraphQL request with a single `ModuleSessionInfo` parameter.
[API of `OnResponse` is available here](/docs/api/core/api-interfaces-onresponse)
[API of `ModuleSessionInfo` is available here](/docs/api/core/api-classes-modulesessioninfo)

### `OnConnect hook`

This hook is similar to `OnRequest` hook, but this is called on the initialization of WebSockets connection. It is exactly same with `OnConnect` hook that is passed to `subscriptions` in **Apollo Server**.

[You can learn more from Apollo docs.](https://www.apollographql.com/docs/graphql-subscriptions/authentication.html)

Example;

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnConnect } from '@graphql-modules/core';

@Injectable({
    scope: ProviderScope.Session
})
export class AuthProvider implements OnConnect {
    userId: string;
    onConnect(connectionParams) {
        // ...do your magic...
        const authToken = connectionParams.authentication;
        this.userId = someFnForTokenExchange(authToken);
    }
}
```

> `OnConnect` hook is called once for each WebSocket GraphQL connection.
[API of `OnConnect` is available here](/docs/api/core/api-interfaces-onconnct)

### `OnDisconnect hook`

This hook is similar to `OnResponse` hook, but this is called on the termination of WebSockets connection. It is exactly same with `OnDisconnect` hook that is passed to `subscriptions` in **Apollo Server**.

[You can learn more from Apollo docs.](https://www.apollographql.com/docs/graphql-subscriptions/authentication.html)

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnDisconnect } from '@graphql-modules/core';

@Injectable()
export class MyProvider implements OnDisconnect {

    onDisconnect(connectionParams, webSocket) {
        // ...do your magic...
        clearSomeSubscriptions(moduleSessionInfo.session);
    }
}
```

> `OnDisconnect` hook is called once for each WebSocket GraphQL connection.
[API of `OnDisconnect` is available here](/docs/api/core/api-interfaces-ondisconnect)

> The other `OnOperation` and `OnOperationComplete` hooks work similar to GraphQL Subscription Server implementation;
[See more in SubscriptionServer docs](https://github.com/apollographql/subscriptions-transport-ws)

## Provider Scopes

You can define different life-time for your provider. You have three options;

```typescript
  import { Injectable, ProviderScope } from '@graphql-modules/di';
  @Injectable({
    scope: ProviderScope.Application | ProviderScope.Session | ProviderScope.Request
  })
  export class MyProvider {}
```

### Application Scope (by default)

If you define a provider in this scope which is default, the provider will be instantiated on application-start and will be same in the entire application and all the following requests. The providers in this scope can be considered as a shared state across all users’ interactions with our application.
It’s basically means that the instance will be treated as [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern).

```typescript
  import { Injectable, ProviderScope } from '@graphql-modules/di';
  @Injectable({
    scope: ProviderScope.Application
  })
  export class MyProvider {}
```

### Session Scope

When a network request is arriving to your GraphQL-Server, GraphQL-Server calls the context factory of the parent module. The parent module creates a session injector together with instantiating session-scoped providers with that session object which contains the current context, session injector and network request. This session object is passed through module’s resolvers using module’s context.

In other words, providers defined in the session scope are constructed in the beginning of the network request, then kept until the network request is closed. While application-scoped providers is kept during the application runtime, and shared between all the following network requests and resolvers inside of these requests, this type of providers would not be shared between different requests but in resolver calls those belong to same network request.

This session scope is kept on memory for all the following network requests of the same connection if the connection uses WebSockets. For regular HTTP, it is terminated immediately.

### Request Scope

If you have request-scoped providers in your GraphQL Module, these providers are generated in every injection. This means a request-scoped provider is never kept neither application state, nor session state. So, this type of providers works just like [Factory](https://en.wikipedia.org/wiki/Factory_method_pattern). It creates an instance each time you request from the injector.

You can see more about scoped providers;
**[Scoped Providers in GraphQL-Modules Dependency Injection](https://medium.com/the-guild/scoped-providers-in-graphql-modules-dependency-injection-system-949cd2588e0)**

## Built-in `ModuleSessionInfo` Provider

Every GraphQL-Module creates a `ModuleSessionInfo` instance in each network request that contains raw Request from the GraphQL Server, `SessionInjector` that contains Session-scoped instances together with Application-scoped ones and `Context` object which is constructed with `contextBuilder` of the module. But, notice that you cannot use this built-in provider in Application Scope.
