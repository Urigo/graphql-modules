---
id: implement-providers
title: Implement Your Providers
sidebar_label: Implement Providers
---

When your app grows and becomes more complex, you can use **Providers** - classes that implement your resolvers' logic.

You can define a provider and add it to your module.

`modules/my-module/user.provider.ts`

```typescript
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class UserProvider {
  users = [
    {
      _id: '0',
      username: 'jhon'
    }
  ];
  getUserById(id) {
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

And inject the data using the `injector` in the `context` of your resolvers.

`modules/my-module/resolvers.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { UserProvider } from './user.provider';
export default {
  Query: {
    user: (root, { id }, { injector }) => injector.get(UserProvider).getUserById(id)
  },
  User: {
    id: user => user._id,
    username: user => user.username
  }
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
  providers: [UserProvider]
});
```
