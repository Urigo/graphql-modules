---
id: dependency-injection
title: Dependency Injection
sidebar_label: Dependency Injection
---

GraphQL Modules lets you use dependency injection among your modules, and lets you inject configs, functions, classes and instances into your modules.

We expose a simple API that covers most use cases concerning backend modules.

We learned not to force using dependency injection too early in the process, because dependency injection makes sense only in some specific use cases, and using it can be recommended only when your codebase is quite large and you need to move fast.

GraphQL Modules lets you choose whether to use dependency injection or not.

## Providers

Let's start by creating a simple class `UserProvider` with the `@Injectable()` decorator.

`modules/my-module/user.provider.ts`

```typescript
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class UserProvider {}
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
  providers: [UserProvider]
});
```

Now, let's implement the `Query.user` resolver as a simple function inside `UserProvider`:

```typescript
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class UserProvider {
  getUserById(id: string) {
    return {
      _id: id,
      username: 'jhon'
    };
  }
}
```

> The lifecycle of a `Provider` is by default a singleton. So you can use the implemented functions as utility and still use `this` to save global variables.

To use this function from our Provider in the actual resolver implementation, get `injector` from `context`:

```typescript
import { ModuleContext } from '@graphql-modules/core';

export default {
  Query: {
    user: (_, { id }: { id: string }, { injector }: ModuleContext) => injector.get(UserProvider).getUserById(id)
  },
  User: {
    id: user => user._id,
    username: user => user.username
  }
};
```

Now our resolver is just a proxy to our implementation: we can easily replace `UserProvider` with mocks during tests.
We can use `UserProvider` and `getUserById` from other modules.

## Import providers from other modules

To use `Provider` from other modules, you can just inject it using `@Inject(INJECTION_TOKEN)`.

Injection tokens are used just for identifying your value and fetching it from the available injectables.
It could be either `class`, `string` or `Symbol`.

To get `OtherProvider` from `MyProvider`, do the following:

```typescript
import { Injectable } from '@graphql-modules/di';
import { OtherProvider } from '../my-other-module/other.provider';

@Injectable()
export class MyProvider {
  constructor(private otherProvider: OtherProvider) {}
}
```

> We added `private` on the argument declaration; it's just a TypeScript trick to declare a class member and set it at the same time, and so now `this.otherProvider` is available to use.

## Injection Tokens

If you wish to decouple the actual class implementation and the injection token, you can create your own injection token and declare it this way:

```typescript
const MY_CLASS_TOKEN = 'myAwesomeClassIdentifier';

export const MyModule = new GraphQLModule({
  providers: [{ provide: MY_CLASS_TOKEN, useClass: MyProvider }]
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
  constructor(@Inject(MY_CLASS_TOKEN) private otherProvider: IOtherProviderSignature) {}
}
```

> This is a very common and useful design pattern related to dependency injection. The power of TypeScript interfaces enables you to use it easily.

## Custom Injectables

You can also create custom `Provider`s (which are non-classes) with injection tokens.
It's useful when you want your module to get something from outside with a specific signature.
You can use custom injection tokens to identify your injectables.

### Class

We have already learned how to provide classes:
just specify the class in the list of `providers` in your module declaration.

```typescript
export const MyModule = new GraphQLModule({
  providers: [UserProvider]
});
```

Or use another class which has same interface.

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

> The lifecycle of a class provider is a singleton by default, i.e. they are created only once and you are using the same instance for all GraphQL executions. But you can change the lifecycle using **Provider Scopes**.

### Value

Value providers are an easy way to pass an existing instance of `class` or any other value that you wish to make available to `@Inject`.

You can use any value, and attach it to an injection token.

```typescript
const MY_VALUE = 'myUsefulValue';

export const MyModule = new GraphQLModule({
  providers: [
    {
      provide: MY_VALUE,
      useValue: 'Hello!'
    }
  ]
});
```

> You can use value injectables to inject instances and global injectables, such as `Logger` instance, database connection/collections, secret tokens etc.

### Factory

Factories provide another way to pass an instance of `provider`. The return value of the fuctory function is used as the value of the provider.

```typescript
const MY_VALUE = 'myUsefulVal8e';

export const MyModule = new GraphQLModule({
  providers: [
    {
      provide: MY_VALUE,
      useFactory: () => {
        // some extra logic
        return myValue;
      }
    }
  ]
});
```

## Hooks

### `OnInit` hook

This hook is called once when your application is started.

Example:

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

By defining this hook as a method in your class provider, you can get access to useful information: the top `GraphQLModule` instance, GraphQL Context, and the network session.

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
    // ... do your magic ...
    // Let's assume you have your network request object under req property of network session
    const authToken = moduleSessionInfo.session.req.headers.authentication;
    this.userId = someFnForTokenExchange(authToken);
  }
}
```

> The `OnRequest` hook is called on each HTTP GraphQL request with a single `ModuleSessionInfo` parameter.
> See also **[API of `OnRequest`](/docs/api/core/api-interfaces-onrequest)**.
> See also **[API of `ModuleSessionInfo`](/docs/api/core/api-classes-modulesessioninfo)**.

### `OnResponse` hook (experimental)

It takes the same parameter as the `OnRequest` hook but gets called right before the server sends the HTTP response to the client.

Example:

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnResponse } from '@graphql-modules/core';

@Injectable()
export class MyProvider implements OnResponse {
  onResponse(moduleSessionInfo: ModuleSessionInfo) {
    // ... do your magic ...
    clearDatabasePool(moduleSessionInfo.session);
  }
}
```

> The `OnResponse` hook is called on each HTTP GraphQL request with a single `ModuleSessionInfo` parameter.
> See also **[API of `OnResponse`](/docs/api/core/api-interfaces-onresponse)**.
> See also **[API of `ModuleSessionInfo`](/docs/api/core/api-classes-modulesessioninfo)**.

### `OnError` hook (experimental)

It takes one parameter of the type `Error`; it gets called when any error is thrown during execution of resolvers.

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnError } from '@graphql-modules/core';

@Injectable()
export class MyProvider implements OnError {
  onError(error: Error) {
    // ... do your magic ...
    logError(error.message);
  }
}
```

> This hook is not called if there is an error on dependency injection or context building because then dependency injection completely stops.

### `OnConnect` hook

This hook is similar to `OnRequest` but it is called on the initialization of the WebSocket connection.
It is exactly the same with the `OnConnect` hook passed to `subscriptions` in **[SubscriptionServer](https://github.com/apollographql/subscriptions-transport-ws)**.

See also **[Apollo document on authentication over WebSocket](https://www.apollographql.com/docs/graphql-subscriptions/authentication.html)**.

Example:

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnConnect } from '@graphql-modules/core';

@Injectable({
  scope: ProviderScope.Session
})
export class AuthProvider implements OnConnect {
  userId: string;
  onConnect(connectionParams) {
    // ... do your magic ...
    const authToken = connectionParams.authentication;
    this.userId = someFnForTokenExchange(authToken);
  }
}
```

> The `OnConnect` hook is called once for each WebSocket GraphQL connection.
> See also **[API of `OnConnect`](/docs/api/core/api-interfaces-onconnct)**.

### `OnDisconnect` hook

This hook is similar to `OnResponse` but it is called on the termination of the WebSocket connection.
It is exactly the same as the `OnDisconnect` hook passed to `subscriptions` in **[SubscriptionServer](https://github.com/apollographql/subscriptions-transport-ws)**.

See also **[Apollo document on authentication over WebSocket](https://www.apollographql.com/docs/graphql-subscriptions/authentication.html)**.

```typescript
import { Injectable } from '@graphql-modules/di';
import { OnDisconnect } from '@graphql-modules/core';

@Injectable()
export class MyProvider implements OnDisconnect {
  onDisconnect(connectionParams, webSocket) {
    // ... do your magic ...
    clearSomeSubscriptions(moduleSessionInfo.session);
  }
}
```

> The `OnDisconnect` hook is called once for each WebSocket GraphQL connection.
> See also **[API of `OnDisconnect`](/docs/api/core/api-interfaces-ondisconnect)**.

> The other `OnOperation` and `OnOperationComplete` hooks work similarly to the GraphQL Subscription Server implementation.
> See also **[the document of subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws)**.

## Provider Scopes

You can define different lifecycles for your provider. You have three options.

```typescript
import { Injectable, ProviderScope } from '@graphql-modules/di';
@Injectable({
  scope: ProviderScope.Application | ProviderScope.Session | ProviderScope.Request
})
export class MyProvider {}
```

See also **[Scoped Providers in GraphQL Modules Dependency Injection](https://medium.com/the-guild/scoped-providers-in-graphql-modules-dependency-injection-system-949cd2588e0)**.

### Application Scope (by default)

If you define a provider in this scope (which is default), the provider will be instantiated on the application start and remain the same in the entire application and all the following requests.
The providers in this scope can be considered as a shared state across all users’ interactions with our application.
It basically means that the instance will be treated as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern).

```typescript
import { Injectable, ProviderScope } from '@graphql-modules/di';
@Injectable({
  scope: ProviderScope.Application
})
export class MyProvider {}
```

### Session Scope

When a network request arrives at your GraphQL server, the GraphQL server calls the context factory of the parent module.
The parent module creates a session injector and instantiates session-scoped providers with the session object which contains the current context, session injector and network request.
This session object is passed through the module's resolvers using the module's context.

In other words, providers defined in the session scope are constructed at the start of the network request and then kept until the network request is closed.
Whereas application-scoped providers are kept during the application runtime and shared between all the following network requests and resolvers in the requests, this type of providers would not be shared between different requests; in resolver calls those belong to the same network request.

This session scope is kept on memory for all the following network requests of the same connection if the connection uses WebSocket. For regular HTTP, it is terminated immediately.

### Request Scope

If you have request-scope'd providers in your GraphQL Module, these providers are generated in every injection.
This means a request-scoped provider is never kept by neither the application state, nor the session state.
So this type of providers works just like a [factory](https://en.wikipedia.org/wiki/Factory_method_pattern).
It creates an instance each time you request from the injector.

## Built-in `ModuleSessionInfo` Provider

Every GraphQL-Module creates on each network request a `ModuleSessionInfo` instance that contains the raw request from the GraphQL Server, the `SessionInjector` with session-scoped instances and application-scoped instances, and the `Context` object constructed by `contextBuilder` of the module.
Note that you cannot use this built-in provider in the application scope.
