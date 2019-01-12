---
id: integrate-with-data-loaders
title: Integrate With Data Loaders
sidebar_label: Integrate With Data Loaders
---

Data Loader is a generic library which aims to solve `n+1` issue in large scale GraphQL Applications. You can [read more about DataLoaders](https://github.com/facebook/dataloader).

Data Loaders can be used in GraphQL Modules with an easy setup. You can use them as providers or in providers. If you want to use them as providers, you can extend DataLoader class to benefit Dependency Injection or wrap factory function with `Inject`.

## As Providers

```ts
  export const USER_DATA_LOADER = Symbol('USER_DATA_LOADER');
  export const UserModule = new GraphQLModule({
    providers: [
      {
        provide: MY_DATA_LOADER,
        useValue: new DataLoader(keys => myBatchGetUsers(keys));
      }
    ],
    resolvers: {
      Query: {
        getUserById: (root, args, context) => context.injector.get(USER_DATA_LOADER).load(args.id)
      }
    }
  });
```

### With Authentication Token

You can see how to generate DataLoaders in GraphQLModules using factory functions and dependency injection.

```ts
  export const USER_DATA_LOADER = Symbol('USER_DATA_LOADER');
  export const UserModule = new GraphQLModule({
    providers: [
      {
        scope: ProviderScope.Session
        provide: MY_DATA_LOADER,
        useFactory:
          Inject(ModuleSessionInfo)( 
            // Use Dependency Injection to get ModuleSessionInfo to access network session
            ({ session }) => new DataLoader(
              ids => genUsers(session.req.authToken, ids)
            )
          )
      }
    ],
    resolvers: {
      Query: {
        getUserById: (root, args, context) => context.injector.get(USER_DATA_LOADER).load(args.id)
      }
    }
  });
  
```

## In Providers

```ts
  export class UserProvider {
    private dataLoader = new DataLoader(keys => this.myDataProvider.findUsers(keys));
    constructor(private myDataProvider: MyExternalDataProvider){ }
    getUserById(userId: string) {
      return this.dataLoader.load(userId);
    }
  }
```
