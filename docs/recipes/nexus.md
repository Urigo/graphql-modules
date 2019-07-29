---
id: nexus
title: Nexus Integration
sidebar_label: Nexus
---

**Nexus** is another alternative that follows code-first approach for your GraphQL Server implementation. 

**Nexus** provides you an API to create your type definitions together with resolvers. But, it doesn’t use any **TypeScript** classes or decorators like **TypeGraphQL**. **Nexus** comes with a set of tools that generates **TypeScript** typings in the development stage or you need to write your typings on your own. 

You can add fields dynamically for types inside closures, and this way you have use the power of **JavaScript** instead of dealing with objects like in `graphql-js`.

With GraphQL-Modules, you can seperate generated typings module by module, and this will prevent to have an over-complicated schema implementation for your GraphQL Server.

You can define different output folders like below, so every module will have its own typings instead of having a single typings file for all application. 

Start with creating types using Nexus API;

`chat.type.ts`

```ts
import { objectType } from 'nexus';

export const Chat = objectType({
    name: 'Chat',
    definition: t => {
        t.id('id');
        t.string('title');
        t.string('description');
    }
});
```

`query.type.ts`

```ts
import { objectType, intArg } from 'nexus';
import { ModuleContext } from '@graphql-modules/core';
import { ChatsProvider } from './chats.provider';

export const Query = objectType({
    name: 'Query',
    definition: t => {
        t.list.field('chats', {
            type: 'Chat',
            resolve: (root, args, { injector }: ModuleContext) => injector.get(ChatsProvider).getChats(),
        });
        t.field('chat', {
            type: 'Chat',
            args: {
                id: intArg(),
            },
            resolve: (root, { id }, { injector }: ModuleContext) => injector.get(ChatsProvider).getChat(id),
        });
    }
})
```

`mutation.type.ts`

```ts
import { objectType, intArg, stringArg } from 'nexus';
import { ModuleContext } from '@graphql-modules/core';
import { ChatsProvider } from './chats.provider';

export const Mutation = objectType({
    name: 'Mutation',
    definition: t => {
        t.field('createChat', {
            type: 'Chat',
            args: {
                title: stringArg(),
                description: stringArg()
            },
            resolve: (root, { title, description }, { injector }: ModuleContext) => injector.get(ChatsProvider).createChat({ id: Math.random(), title, description })
        });
        t.int('deleteChat', {
            args: {
                id: intArg(),
            },
            resolve: (root, { id }, { injector }: ModuleContext) => injector.get(ChatsProvider).deleteChat(id)
        });
    }
});
```

You can access GraphQL Modules Dependency Injection using context easily, and also it is really easy to connect generated schema by Nexus to a GraphQLModule.

`chats.module.ts`

```ts
import { GraphQLModule } from '@graphql-modules/core';
import { ChatsProvider } from "./chats.provider";
import { ChatEntity } from './chat.entity-type';
import { CHATS } from './chats.symbol';
import { makeSchema } from 'nexus';
import { Chat } from './chat.type';
import { Query } from './query.type';
import { Mutation } from './mutation.type';
import { join } from 'path';

export const ChatsModule = new GraphQLModule({
  providers: [
    ChatsProvider,
  ],
  extraSchemas: [
      makeSchema({
          types: [
              Chat,
              Query,
              Mutation,
          ],
          outputs: {
            schema: join(__dirname, "./generated/chats.schema.graphql"),
            typegen: join(__dirname, "./generated/chats.types.d.ts"),
          },
      })
  ]
});
```

> GraphQL-Modules helps you to create standalone modules that has encapsulated schema in this case.

> Check out our example with Nexus; [NexusGraphQLModules Example](https://github.com/ardatan/NexusGraphQLModules)

## Integration with other implementations

You can merge different modules from different implementations like below. So you don't have to use same implementation method in all modules. GraphQL-Modules will handle schema merging for you, even if they're from different implementations.

```ts
new GraphQLModule({
   imports: [
        XModuleCreatedUsingSchemaFirst,
        YModuleCreatedUsingNexus,
        ZModuleCreatedUsingTypeGraphQL
   ]
})
```
