---
id: subscriptions
title: Subscriptions
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Subscription is a third kind of GraphQL operation, next to Query and Mutation. Think of it as an event emitter where events are emitted by your backend and consumed by a GraphQL client - frontend in most scenarios.

GraphQL is just a specification and Express GraphQL or Apollo Server are Node implementations of the server-side part of GraphQL. Natural fit for Subscriptions is WebSocket protocol but it could be anything. We're going to focus only on WS and use [`subscriptions-transport-ws`](https://github.com/apollographql/subscriptions-transport-ws) package as our transport layer.

## Setup

For Queries and Mutations we use `createExecution()` method to create an execution logic, in case of Subscriptions it's very similar. We construct subscription phase with `createSubscription()` method and provide it to a GraphQL server.

```typescript
import { createApplication } from 'graphql-modules';

const application = createApplication({
  modules: [
    /* ... */
  ],
});

const subscribe = application.createSubscription();
```

> `createSubscription()` accepts an object with `subscribe` property in case you want to use your own subscription logic. It uses `subscribe` from `graphql` by default.

Why do we need it? GraphQL Modules needs to understand the life cycle of a subscription to avoid memory leaks.

## Example

We recommend to use [`graphql-subscriptions`](https://github.com/apollographql/graphql-subscriptions) as it provides handful utility functions (filtering for example) and an event emitter.

Provide `PubSub` with an instance as the value so as a singleton service it becomes available across all modules.

```typescript title="application.ts"
import { createApplication } from 'graphql-modules';
import { PubSub } from 'graphql-subscriptions';
import { myModule } from './my-module';

const application = createApplication({
  modules: [myModule /*...*/],
  providers: [
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
  ],
});
```

Accessing `PubSub` in a module can be done both, in a resolve function and `Messages` service.

Take a look at two things here, how `MESSAGE_ADDED` event was emitter in `Messages.send()` and how `Subscriptions.messageAdded` subscribes to events.

```typescript title="my-module.ts"
import { createModule, Injectable, gql } from 'graphql-modules';
import { PubSub } from 'graphql-subscriptions';

const MESSAGE_ADDED = 'MESSAGE_ADDED';

const messages = [
  /* ... */
];

@Injectable()
class Messages {
  constructor(private pubsub: PubSub) {}

  async all() {
    return messages;
  }

  async send(body: string) {
    const message = {
      id: generateRandomId(),
      body,
    };

    messages.push(message);

    this.pubsub.publish(MESSAGE_ADDED, { messageAdded: message });

    return message;
  }
}

export const myModule = createModule({
  id: 'my-module',
  providers: [Messages],
  typeDefs: gql`
    type Query {
      messages: [Message!]
    }

    type Mutation {
      sendMessage(message: String!): Message!
    }

    type Subscription {
      messageAdded: Message
    }

    type Message {
      id: ID!
      body: String!
    }
  `,
  resolvers: {
    Query: {
      messages(parent, args, ctx: GraphQLModules.Context) {
        return ctx.injector.get(Messages).all();
      },
    },
    Mutation: {
      sendMessage(parent, { message }, ctx: GraphQLModules.Context) {
        return ctx.injector.get(Messages).send(message);
      },
    },
    Subscription: {
      messageAdded: {
        subscribe(root, args, ctx: GraphQLModules.Context) {
          return ctx.injector.get(PubSub).asyncIterator([MESSAGE_ADDED]);
        },
      },
    },
  },
});
```

Here are reference implementations of using GraphQL Subscriptions with WebSockets in both, Apollo Server and Express GraphQL.

<Tabs
defaultValue="apollo"
values={[
{label: 'Apollo Server', value: 'apollo'},
{label: 'Express GraphQL', value: 'express'},
]
}>
<TabItem value="apollo">

```typescript title="server.ts"
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { application } from './application';

const execute = application.createExecution();
const subscribe = application.createSubscription();
const schema = application.schema;

const server = new ApolloServer({
  schema,
  executeFn: execute,
  subscribeFn: subscribe,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

</TabItem>
<TabItem value="express">

```typescript title="server.ts"
import 'reflect-metadata';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { application } from './application';

const execute = application.createExecution();
const subscribe = application.createSubscription();
const schema = application.schema;

const server = express();

server.use(
  '/',
  graphqlHTTP({
    schema,
    customExecuteFn: execute,
    graphiql: true,
  })
);

const webServer = createServer(app);

webServer.listen(4000, () => {
  console.log('🚀 Server ready at http://localhost:4000');

  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: webServer,
      path: '/',
    }
  );
});
```

</TabItem>
</Tabs>
