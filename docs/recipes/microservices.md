---
id: microservices
title: Microservices
sidebar_label: Microservices
---

## Exposing Unified Schema

If you wish to separate your server to smaller parts and deploy them as microservices, you can use GraphQL Modules in the way you are used to.

That means that you can still implement small servers and then use **Schema Stitching** to merge your small GraphQL schemas into a unified schema.

## Communication Between Servers

You can also use **[`PubSub`](https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#PubSub-Implementations)** to implement messaging mechanism between GraphQL Modules servers.

The default and built-in implementation of the `PubSub` uses `EventEmitter`.
Since it's a very simple API, you can implement your own way of sending messages.

You can implement your own message transmitter by implementing `PubSub` interface:

```typescript
export class MyPubSub {
  subscribe<T = any>(event: string, handler: (payload: T) => void): { unsubscribe: () => void } {
    // 1. You need to keep a record between the event and the handler

    return {
      unsubscribe: () => y{
        // 2. Here you need to implement the logic for unsubscribing for the event
      },
    };
  }

  publish<T = any>(event: string, payload: T): void {
    // 3. Here you need to implement to logic for publishing a new message
  }
}
```

Make sure to use it in a `GraphQLModule` declaration:

```typescript
import { GraphQLModule } from '@graphql-modules/core';

const CommunicationModule = new GraphQLModule({
  provider: [MyPubSub]
  /* ... */
});
```

Finally, import `CommunicationModule` to all other modules where you wish to use `PubSub`.

### Redis PubSub

Another useful trick is to use external PubSub services such as **[Redis PubSub](https://redis.io/topics/pubsub)**.

You can easily create a `RedisPubSub` this way:

```typescript
import * as redis from 'redis';

export class PubSub {
  _client = null;

  constructor() {
    this._client = redis.createClient();
  }

  subscribe<T = any>(event: string, handler: (payload: T) => void): { unsubscribe: () => void } {
    this._client.subscribe(event);

    this._client.on('message', function(channel, message) {
      if (channel !== event) {
        return;
      }

      handler(JSON.parse(message));
    });

    return {
      unsubscribe: () => {
        this._client.unsubscribe(event);
      }
    };
  }

  publish<T = any>(event: string, payload: T): void {
    this._client.publish(event, JSON.stringify(payload));
  }
}
```

### Existing Implementations for PubSub

`PubSub` can be replaced by other implementations.
The following are existing ready-to-use implementations:

- **[Redis](https://github.com/davidyaha/graphql-redis-subscriptions)**
- **[Google PubSub](https://github.com/axelspringer/graphql-google-pubsub)**
- **[MQTT enabled broker](https://github.com/davidyaha/graphql-mqtt-subscriptions)**
- **[RabbitMQ](https://github.com/cdmbase/graphql-rabbitmq-subscriptions)**
- **[Kafka](https://github.com/ancashoria/graphql-kafka-subscriptions)**
- **[Postgres](https://github.com/GraphQLCollege/graphql-postgres-subscriptions)**
