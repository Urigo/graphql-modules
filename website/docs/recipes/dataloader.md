---
id: dataloader
title: Solve N+1 Using DataLoader
---

DataLoader is a generic library which aims to solve the `n+1` issue in large-scale GraphQL Applications.
You can **[read more about DataLoader](https://github.com/facebook/dataloader)**.

DataLoader can be used in GraphQL Modules with an easy setup. You can use them as providers or in providers. If you want to use them as providers, you can extend the `DataLoader` class to benefit Dependency Injection or wrap factory functions with `Inject`.
`Scope.Operation` is recommended for this usage because `DataLoader` works on a cache-per-request mechanism.

## DataLoader as a Service

```typescript
import { createModule, Scope, InjectionToken } from 'graphql-modules';
import DataLoader from 'dataloader';

export const USER_DATA_LOADER = new InjectionToken('USER_DATA_LOADER');

export const myModule = createModule({
  providers: [
    {
      provide: USER_DATA_LOADER,
      scope: Scope.Operation,
      useFactory: () => new DataLoader(keys => myBatchGetUsers(keys));
    }
  ],
  resolvers: {
    Query: {
      getUserById(root, args, context) {
        return context.injector.get(USER_DATA_LOADER).load(args.id)
      }
    }
  }
});
```

You don't need to create

## DataLoader in a Service

```typescript
import { Injectable, Scope } from 'graphql-modules';
import DataLoader from 'dataloader';
import { MyExternalDataProvider } from './my-external-data-provider';

@Injectable({
  scope: Scope.Operation,
})
export class UserProvider {
  private dataLoader = new DataLoader((keys) =>
    this.myDataProvider.findUsers(keys)
  );

  constructor(private myDataProvider: MyExternalDataProvider) {}

  getUserById(userId: string) {
    return this.dataLoader.load(userId);
  }
}
```
