---
id: execution-context
title: Execution Context
---

Execution Context means the context of execution of GraphQL Operation. It's related to Dependendency Injection, especially Singletons and represents the context object created by your GraphQL server.

Why "especially useful in Singletones"?

As you know from ["Introduction to Dependency Injection"](../di/introduction.md) chapter, Singletons can't directly access Operation scoped services, meaning they probably can't also directly access the context object created per each operation. Directly.

Thanks to `@ExecutionContext` decorator, every Singleton service gets access to the GraphQL Context and the Operation scoped Injector.

Take a look at the example below.

```typescript
import { Injectable, ExecutionContext } from 'graphql-modules';
import { Config } from './config';

@Injectable()
export class Data {
  constructor(private config: Config) {}

  @ExecutionContext()
  private context: ExecutionContext;

  someMethod() {
    console.log('Environment', this.config.env);

    const value = this.context.injector.get(SOME_TOKEN);
  }
}
```

The `Config` token requested in the constructor is a Singleton.

Next lines shows the usage of `@ExecutionContext` decorator. It's a property decorator that tells GraphQL Modules to put there the GraphQL Context with Injector.

This way the Singleton `Data` service runs within the execution context of a GraphQL Operation and is able to access Operation scoped Injector and the GraphQL Context object.

It also means, you gain a lot in terms of performance, because the `Data` class is instantiated only once and used in many operations.
