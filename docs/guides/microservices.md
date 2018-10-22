---
id: microservices
title: Microservices
sidebar_label: Microservices
---

## Exposing Unified Schema

If you wish to separate your server to smaller parts and deploy them as microservices, you can use GraphQL Modules in they way you used to.

That means that you can still implement small servers and them use [Schema Stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) to merge your small GraphQL schemas into a unified schema.

## Communication Between Servers

You can also use [`CommunicationBridge`](/TODO) to implement messaging mechanism between GraphQL Modules servers.

The default and built-in implementation of the `CommunicationBridge` is using `EventEmitter`, but because it's a very simple API you can implement your own way of sending those messages.

You can implement your own message transmitter by implementing `CommunicationBridge` interface:

```typescript
import { CommunicationBridge } from '@graphql-modules/core';

export class MyCommunicationBridge implements CommunicationBridge {
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

Then, make sure to use it in your `GraphQLModule` declaration:

```typescript
import { GraphQLModule, EventEmitterCommunicationBridge } from '@graphql-modules/core';

const graphQLModule = new GraphQLModule({
    communicationBridge: new MyCommunicationBridge(),
    /* ... */
});
```

### Redis PubSub

Another useful trick is to use an external PubSub services, such as [Redis PubSub](https://redis.io/topics/pubsub).

You can easily create a `RedisCommunicationBridge` this way:

```typescript
import { CommunicationBridge } from '@graphql-modules/core';
import * as redis from 'redis';

export class MyCommunicationBridge implements CommunicationBridge {
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
      },
    };
  }

  publish<T = any>(event: string, payload: T): void {
    this._client.publish(event, JSON.stringify(payload));
  }
}
```
