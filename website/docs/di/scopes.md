---
id: scopes
title: Scopes
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Scope defines a life cycle of Services and Tokens. There are two kinds of scopes, **Singleton** and **Operation**, former is used by default.

{@import ./reflect-note.md}

## Singleton

As mentioned before, Singleton scope is the default choice in GraphQL Modules. Every Service and Token is created even before the first incoming GraphQL operation and never gets distroyed (only when Node process is terminated).

> We decided to make it the default choice, because of performance related reasons. In most cases, there's no need to instantiate classes on every new request and dispose them later on.

<Tabs
defaultValue="service"
values={[
{label: 'Service', value: 'service'},
{label: 'Factory Provider', value: 'factory'},
]}>
<TabItem value="service">

```typescript
import { Injectable, createModule } from 'graphql-modules';

@Injectable()
class Data {}

export const myModule = createModule({
  id: 'my-module',
  providers: [Data],
  /* ... */
});
```

</TabItem>
<TabItem value="factory">

```typescript
import { Injectable, InjectionToken, createModule } from 'graphql-modules';

const Env = new InjectionToken<'production' | 'development'>('environment');

export const myModule = createModule({
  id: 'my-module',
  providers: [
    {
      provide: Env,
      useFactory() {
        return process.env.NODE_ENV === 'production'
          ? 'production'
          : 'development';
      },
    },
  ],
  /* ... */
});
```

</TabItem>
</Tabs>

## Operation

All classes and values are created within the context of execution, meaning every incoming GraphQL Operation.

> Because of performance related reasons, we recommend to use Singletons whenever possible.

The `Data` class defined below gets instantiated for every new GraphQL operation and disposed once the operation is resolved. Operation Scope doesn't overlap for incoming requests, so for 3 requests at a time, 3 instances of `Data` are created, one per each request.

To improve the performance a bit, GraphQL Modules instantiate services on demand. When `Data` is not called anywhere directly or indirectly by resolvers, the service is not created.

All services and tokens are destroyed right after GraphQL execution phase.

<Tabs
defaultValue="service"
values={[
{label: 'Service', value: 'service'},
{label: 'Factory Provider', value: 'factory'},
]}>
<TabItem value="service">

```typescript
import { Injectable, Scope, createModule } from 'graphql-modules';

@Injectable({
  scope: Scope.Operation, // <- here
})
class Data {}

export const myModule = createModule({
  id: 'my-module',
  providers: [Data],
  /* ... */
});
```

</TabItem>
<TabItem value="factory">

```typescript
import {
  Injectable,
  Scope,
  InjectionToken,
  createModule,
} from 'graphql-modules';

const Env = new InjectionToken<'production' | 'development'>('environment');

export const myModule = createModule({
  id: 'my-module',
  providers: [
    {
      provide: Env,
      scope: Scope.Operation, // <- here
      useFactory() {
        return process.env.NODE_ENV === 'production'
          ? 'production'
          : 'development';
      },
    },
  ],
  /* ... */
});
```

</TabItem>
</Tabs>

## Using both

**Directly** accessing a Singleton service in an Operation scoped service is possible, but not the other way around.

With [`@ExecutionContext`](../advanced/execution-context.md) decorator, your Singleton services will be able to **indirectly** access Operation scoped Tokens and Services.
