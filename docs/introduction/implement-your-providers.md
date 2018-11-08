---
id: implement-your-providers
title: Implement Your Providers
sidebar_label: Implement Your Providers
---

When your app grows and becomes more complex, you can use **Providers** (it's just a class...) to implement your resolvers' logic.

### With Basic Resolvers

You can define a provider and add it to your module.

`modules/my-module/user.provider`

```typescript
import { Injectable } from '@graphql-modules/core';

@Injectable()
export class UserProvider {
  users = [
    {
      _id: 0,
      username: 'jhon',
    }
  ];
  getUserById(id){
    return this.users.find(user => user._id === id);
  }
}
```

Define a simple schema.

`modules/my-module/schema.graphql`

```graphql
type Query {
    user(id: ID!): User
}

type User {
    id: ID!
    username: String!
}
```

And inject it using `injector` inside of your application's `context` in your resolvers.

`modules/my-module/resolvers.ts`

```typescript
import { ModuleContext } from '@graphql-modules/core';
import { UserProvider } from './user.provider';
export default {
    Query: {
        user: (root, { id }, { injector }: ModuleContext) => injector.get(UserProvider).getUserById(id), UserProvider),
    },
    User: {
        id: user => user._id,
        username: user => user.username,
    },
};
```

Then add all these in your module definition.

`modules/my-module/index.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { UserProvider } from './user.provider';

export const MyModule = new GraphQLModule({
    typeDefs,
    resolvers,
    providers: [
      UserProvider
    ],
});
```

### With Resolvers Handlers

If you implement handler `class`es for your resolvers in GraphQLModule. You can inject **Providers** like you do in other **Providers**.

`modules/my-module/query.handler.ts`

```typescript

import { ResolversHandler } from '@graphql-modules/core';
import { UserProvider } from './user.provider';
 @ResolversHandler('Query')
export class QueryResolvers {
  constructor(private userProvider: UserProvider){}
  user(root, { id }){
    return this.userProvider.getUserById(id);
  }
}

```

Then use those resolvers handler in your module definition 

`modules/my-module/index.ts`

 ```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import { QueryResolvers } from './query.handler';
import { UserProvider } from './user.provider';
 export const myModule = new GraphQLModule({
    name: 'my-module',
    typeDefs,
    resolversHandlers: [
      QueryResolvers
    ],
    providers: [
      UserProvider
    ],
});
```
