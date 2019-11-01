---
id: data-loader
title: Solve N+1 Using DataLoader
sidebar_label: Solve N+1 Using DataLoader
---

DataLoader is a generic library which aims to solve the `n+1` issue in large-scale GraphQL Applications.
You can **[read more about DataLoader](https://github.com/facebook/dataloader)**.

DataLoader can be used in GraphQL Modules with an easy setup.
You can use them as providers or in providers.
If you want to use them as providers, you can extend the `DataLoader` class to benefit dependency injection or wrap factory functions with `Inject`.
`ProviderScope.Session` is recommended for this usage because `DataLoader` works on a cache-per-request mechanism.

## As Provider

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { ProviderScope } from '@graphql-modules/di';
import DataLoader from 'dataloader';

export const USER_DATA_LOADER = Symbol('USER_DATA_LOADER');
export const UserModule = new GraphQLModule({
  providers: [
    {
      provide: USER_DATA_LOADER,
      scope: ProviderScope.Session,
      useFactory: () => new DataLoader(keys => myBatchGetUsers(keys));
    }
  ],
  resolvers: {
    Query: {
      getUserById: (root, args, context) => context.injector.get(USER_DATA_LOADER).load(args.id)
    }
  }
});
```

### With Dependency Injection

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { InjectFunction } from '@graphql-modules/di';
import { MyExternalDataProvider } from './my-external-data-provider';

export const USER_DATA_LOADER = Symbol('USER_DATA_LOADER');
export const UserModule = new GraphQLModule({
  providers: [
    {
      provide: USER_DATA_LOADER,
      scope: ProviderScope.Session,
      useFactory: InjectFunction(MyExternalDataProvider)(
        myExternalDataProvider => new DataLoader(keys => myExternalDataProvider.getData(keys))
      )
    }
  ],
  resolvers: {
    Query: {
      getUserById: (root, args, { injector }) => injector.get(USER_DATA_LOADER).load(args.id)
    }
  }
});
```

### With Authentication Token

You can see how to generate DataLoader in GraphQLModules using factory functions and dependency injection.

```typescript
import { GraphQLModule, ModuleSessionInfo } from '@graphql-modules/core';
import { InjectFunction, ProviderScope } from '@graphql-modules/di';

export const USER_DATA_LOADER = Symbol('USER_DATA_LOADER');
export const UserModule = new GraphQLModule({
  providers: [
    {
      scope: ProviderScope.Session
      provide: USER_DATA_LOADER,
      useFactory:
        InjectFunction(ModuleSessionInfo)(
          // Use dependency injection to get `ModuleSessionInfo` and access network session
          ({ session }) => new DataLoader(
            ids => genUsers(session.req.authToken, ids)
          )
        )
    }
  ],
  resolvers: {
    Query: {
      getUserById: (root, { id }, { injector }) => injector.get(USER_DATA_LOADER).load(id)
    }
  }
});
```

## In Providers with Dependency Injection

```typescript
import { Injectable, ProviderScope } from '@graphql-modules/di';
import DataLoader from 'dataloader';
import { MyExternalDataProvider } from './my-external-data-provider';

@Injectable({
  scope: ProviderScope.Session
})
export class UserProvider {
  private dataLoader = new DataLoader(keys => this.myDataProvider.findUsers(keys));
  constructor(private myDataProvider: MyExternalDataProvider) {}
  getUserById(userId: string) {
    return this.dataLoader.load(userId);
  }
}
```
