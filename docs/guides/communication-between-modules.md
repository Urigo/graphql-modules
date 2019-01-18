---
id: communication-between-modules
title: Communication Between Modules
sidebar_label: Modules Communication
---

While modules should be a standalone unit of code, it's not possible to create a complete standalone modules.

Modules need to interact with each other, execute functions, send messages and more.

GraphQL Modules provide multiple ways of doing it, and you should pick the right one according to your needs.

## Using Direct Dependency Injection

If your modules are coupled and you they should know each other because their logic and combined with each user, you cam use direct dependency injection.

```typescript
import { Injectable } from '@graphql-modules/di';
import { OtherProvider } from '../my-other-module/other.provider';

@Injectable()
export class MyProvider {
    constructor(private otherProvider: OtherProvider) {

    }
}
```

## Using Dependency Injection Tokens

If you wish to communicate other module with importing directly from it, you can use dependency-injection tokens:

```typescript
import { Inject, Injectable } from '@graphql-modules/di';

export interface IOtherProviderSignature {
    doSomething: () => void;
}

@Injectable()
export class MyProvider {
    constructor(@Inject(MY_CLASS_TOKEN) private otherProvider: IOtherProviderSignature) {

    }
}
```

Then, your app or other modules can use the following to implement it:

```typescript
class MyImplementation implements IOtherProviderSignature {
    doSomething() {
        // ... some code ...
    }
}
```

And provide it using `providers`:

```typescript
{ provide: MY_CLASS_TOKEN, useClass: MyImplementation }
```

## Communication Bridge - PubSub

GraphQL Modules can work with `PubSub` mechanism for dealing with messages between modules.

It's useful when you want to notify other module about something, without knowing it directly, and without depending on it.

`PubSub` is implemented as a simple Pub/Sub mechanism, with the ability to publish and subscribe to messages.

First, you need to tell `GraphQLModule` how do you wish to transmit your messages. Apollo Server provides a simple `PubSub` implementation based on `EventEmitter`.

To use it, create an instance of `EventEmitterCommunicationBridge` and pass to to a shared `GraphQLModule` instance:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'apollo-server';

const CommunicationModule = new GraphQLModule({
    providers: [
      PubSub
      /* ... */
    ]
    imports: [ /* ... */],
});
```

And don't forget to import this common module to the modules you want to use `PubSub`.

```typescript
import { GraphQLModule } from '@graphql-modules/core';

export const FooModule = new GraphQLModule({
  imports: [
    CommunicationModule
  ]
})
```

```typescript
import { GraphQLModule } from '@graphql-modules/core';

export const BarModule = new GraphQLModule({
  imports: [
    CommunicationModule
  ],
  providers: [
    MyProvider
  ]
})
```

Then, to use `PubSub`, you can do the following:

```typescript
import { PubSub } from 'apollo-server';
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class MyProvider {
    constructor(private pubsub: PubSub) {
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
S
This kind of modules communication is useful for implementing notifications, auditing, logging and more.

It's also useful for implementing communication between GraphQL Modules servers. There are various PubSub implementations based on EventEmitter, Redis and RabbitMQ.
[You can read more about PubSub mechanism in Apollo docs.](https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#PubSub-Implementations)
