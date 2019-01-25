---
id: implement-your-providers
title: Implement Your Providers
sidebar_label: Implement Your Providers
---

When your app grows and becomes more complex, you can use **Providers** (it's just a class...) to implement your resolvers' logic.

You can define a provider and add it to your module.

`modules/my-module/user.provider`

```typescript
import { Injectable } from '@graphql-modules/di';

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
import { GraphQLModule } from '@graphql-modules/core';
import { UserProvider } from './user.provider';
export default {
    Query: {
        user: (root, { id }, { injector }) => injector.get(UserProvider).getUserById(id), UserProvider),
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

## Use Class Providers to implement Resolvers

You can use classes to implement your resolvers to use Dependency Injection easily.

You need to install `@graphql-modules/class-resolvers` first;

  $ yarn add @graphql-modules/class-resolvers

`query.resolvers.ts`
```typescript
import { Injectable, ProviderScope } from '@graphql-modules/di';

@Injectable({
  scope: ProviderScope.Session
})
export class QueryResolvers {
  constructor(private usersProvider: UsersProvider, private moduleSessionInfo: ModuleSessionInfo) {}
  async currentUser(root, args, context, info) {
    const { authToken } = this.moduleSessionInfo.session;
    const user = await this.usersProvider.getUserByToken(authToken);
    return user;
  }
}
```

`my.module.ts`
```typescript
  import { GraphQLModule } from '@graphql-modules/core';
  import { useClassProviderForTypeResolver } from '@graphql-modules/class-resolvers';
  import { QueryResolvers } from './query.resolvers';
  import { UserModule } from './user.module';

  export const MyModule = new GraphQLModule({
    imports: [
      UsersModule // For User type and UserProviders
    ],
    typeDefs: gql`
      type Query {
        currentUser: User
      }
    `,
    resolvers: {
      Query: useClassProviderForTypeResolver(QueryResolvers), // Extract field resolvers
    },
    providers: [
      QueryResolvers, // Define it as class provider for Dependency Injection
    ]
  });
```
