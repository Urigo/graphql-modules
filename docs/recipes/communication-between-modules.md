---
id: communication-between-modules
title: Communication Between Modules
sidebar_label: Communication Between Modules
---

While basically modules should be a standalone unit of code, it's not possible to create **completely** standalone modules.
Modules need to interact with each other, execute functions, send messages and more.
GraphQL Modules provides multiple ways of doing it, and you should pick the right one according to your needs.

## Using Direct Dependency Injection

If your modules are coupled, you can use direct dependency injection.

```typescript
import { Injectable } from '@graphql-modules/di';
import { OtherProvider } from '../my-other-module/other.provider';

@Injectable()
export class MyProvider {
  constructor(private otherProvider: OtherProvider) {}
}
```

## Using Injection Tokens

If you wish to make a module communicate with other modules without direct imports, you can use injection tokens:

```typescript
import { Inject, Injectable } from '@graphql-modules/di';

export interface IOtherProviderSignature {
  doSomething: () => void;
}

@Injectable()
export class MyProvider {
  constructor(@Inject(MY_CLASS_TOKEN) private otherProvider: IOtherProviderSignature) {}
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

## Using a Communication Bridge: PubSub

GraphQL Modules can work with `PubSub` mechanism for dealing with messages between modules.

It's useful when you want to notify other modules of something, without knowing them directly.

`PubSub` is implemented as a simple Pub/Sub mechanism for publishing/subscribing to messages.

First, you need to tell `GraphQLModule` how to transmit your messages. [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) provides a simple `PubSub` implementation based on `EventEmitter`.

To use it, pass the `PubSub` class as a provider in a shared `GraphQLModule` instance:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'graphql-subscriptions';

const CommonModule = new GraphQLModule({
    providers: [
      PubSub
      /* ... */
    ]
    imports: [ /* ... */],
});
```

And import this common module when you want to use `PubSub`.

```typescript
import { GraphQLModule } from '@graphql-modules/core';

export const FooModule = new GraphQLModule({
  imports: [CommonModule]
});
```

```typescript
import { GraphQLModule } from '@graphql-modules/core';

export const BarModule = new GraphQLModule({
  imports: [CommonModule],
  providers: [MyProvider]
});
```

To use `PubSub`, you can do the following:

```typescript
import { Injectable } from '@graphql-modules/di';
import { PubSub } from 'graphql-subscriptions';

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
      foo: 'bar'
    });
  }
}
```

This kind of communication between modules is useful for implementing notifications, auditing, logging, etc.

It's also useful for implementing communication between GraphQL Modules servers. There are various PubSub implementations based on EventEmitter, Redis and RabbitMQ.

### Existing Implementations for PubSub

`PubSub` can be replaced by another implementations. The following are existing ready-to-use implementations:

- **[Redis](https://github.com/davidyaha/graphql-redis-subscriptions)**
- **[Google PubSub](https://github.com/axelspringer/graphql-google-pubsub)**
- **[MQTT enabled broker](https://github.com/davidyaha/graphql-mqtt-subscriptions)**
- **[RabbitMQ](https://github.com/cdmbase/graphql-rabbitmq-subscriptions)**
- **[Kafka](https://github.com/ancashoria/graphql-kafka-subscriptions)**
- **[Postgres](https://github.com/GraphQLCollege/graphql-postgres-subscriptions)**
