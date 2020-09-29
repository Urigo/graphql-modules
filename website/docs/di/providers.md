---
id: providers
title: Providers and Tokens
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The building blocks of DI are **Providers** and **Tokens**.

- Token - symbol or class representing an object or any value in Dependency Injection space.
- Provider - provides a value to a token

{@import ./reflect-note.md}

## Defining Tokens

Dependency Injection is an abstraction over actual objects and values.

There are three kinds of providers:

- [Class provider](#class) - creates an instance of a class
- [Value provider](#value) - provides ready-to-use value
- [Factory provider](#factory) - function to provide a value

### Class

Using a class provider in GraphQL Modules is the easiest approach to DI. The class is instantiated automatically and in case of Operation Scope it's created only on demand.

Every Service should be decorated with `@Injectable` as follows:

```typescript title="data.ts"
import { Injectable } from 'graphql-modules';

@Injectable()
export class Data {}
```

```typescript title="module.ts"
import { createModule } from 'graphql-modules';
import { Data } from './data';

export const myModule = createModule({
  id: 'my-module',
  /* ... */
  providers: [Data],
});
```

It's a shorthand expression for:

<Tabs
defaultValue="expression"
values={[
{label: 'Expression', value: 'expression'},
{label: 'Example', value: 'example'},
]}>
<TabItem value="expression">

```typescript
{
  provide: Data,
  useClass: Data,
}
```

</TabItem>
<TabItem value="example">

```typescript title="module.ts"
import { createModule } from 'graphql-modules';
import { Data } from './data';

export const myModule = createModule({
  id: 'my-module',
  /* ... */
  providers: [
    {
      provide: Data,
      useClass: Data,
    },
  ],
});
```

</TabItem>
</Tabs>

### Value

Value provider requires a Token that represents a value, either `InjectionToken` or a class.

<Tabs
defaultValue="expression"
values={[
{label: 'Expression', value: 'expression'},
{label: 'Example', value: 'example'},
]}>
<TabItem value="expression">

```typescript
{
  provide: ApiKey,
  useValue: 'my-api-key',
}
```

</TabItem>
<TabItem value="example">

```typescript title="keys.ts"
import { InjectionToken } from 'graphql-modules';

export const ApiKey = new InjectionToken<string>('api-key');
```

```typescript title="module.ts"
import { createModule } from 'graphql-modules';
import { ApiKey } from './keys';

export const myModule = createModule({
  id: 'my-module',
  /* ... */
  providers: [
    {
      provide: ApiKey,
      useValue: 'my-api-key',
    },
  ],
});
```

</TabItem>
</Tabs>

### Factory

In case you want to create a dependent value, using a factory provider is the answer. Factory can be useful also to create an instance of a class, for example when using third-party libraries.

<Tabs
defaultValue="expression"
values={[
{label: 'Expression', value: 'expression'},
{label: 'Example', value: 'example'},
]}>
<TabItem value="expression">

```typescript
{
  provide: ApiKey,
  useFactory(config: Config) {
    if (config.environment === 'production') {
      return 'my-api-key';
    }

    return null;
  },
  deps: [Config]
}
```

</TabItem>
<TabItem value="example">

```typescript title="keys.ts"
import { InjectionToken } from 'graphql-modules';

export const ApiKey = new InjectionToken<string>('api-key');
```

```typescript title="module.ts"
import { createModule } from 'graphql-modules';
import { ApiKey } from './keys';

export const myModule = createModule({
  id: 'my-module',
  /* ... */
  providers: [
    {
      provide: ApiKey,
      useFactory(config: Config) {
        if (context.environment) {
          return 'my-api-key';
        }

        return null;
      },
      deps: [Config],
    },
  ],
});
```

</TabItem>
</Tabs>

## Using Services and Tokens

Provider is a way to define a value and match it with a Token or a Service. Let's see how to consume Services and Tokens.

### Service

Accessing a service is fairly simple. You ask for a service in a constructor of a class or by using `Injector` directly.

<Tabs
defaultValue="resolver"
values={[
{label: 'Resolver', value: 'resolver'},
{label: 'Service', value: 'service'},
]}>
<TabItem value="resolver">

```typescript
import { Auth } from './auth';

const resolvers = {
  Query: {
    me(parent, args, context, info) {
      const auth = context.injector.get(Auth);

      return auth.getCurrentUser();
    },
  },
};
```

> `Injector` is available in GraphQL Context under `injector` property.

</TabItem>
<TabItem value="service">

```typescript
import { Injectable } from 'graphql-modules';
import { Auth } from './auth';

@Injectable()
class Posts {
  constructor(private auth: Auth) {}

  allPosts() {
    if (!this.auth.isLoggedIn()) {
      throw new Error('Auth required');
    }

    return [
      /* ... */
    ];
  }
}
```

</TabItem>
</Tabs>

### InjectionToken

Consuming `InjectionToken` is very similar to `Service`. The only difference is that you need to use `@Inject` decorator but only in some cases.

<Tabs
defaultValue="resolver"
values={[
{label: 'Resolver', value: 'resolver'},
{label: 'Service', value: 'service'},
]}>
<TabItem value="resolver">

```typescript
import { ApiKey } from './keys';

const resolvers = {
  Query: {
    me(parent, args, context, info) {
      const apiKey = context.injector.get(ApiKey);

      if (!this.key) {
        throw new Error('API key is required');
      }

      return auth.getCurrentUser();
    },
  },
};
```

> `Injector` is available in GraphQL Context under `injector` property.

</TabItem>
<TabItem value="service">

```typescript
import { Injectable, Inject } from 'graphql-modules';
import { ApiKey } from './keys';

@Injectable()
class Posts {
  constructor(@Inject(ApiKey) private key: string) {}

  allPosts() {
    if (!this.key) {
      throw new Error('API key is required');
    }

    return [
      /* ... */
    ];
  }
}
```

> `@Inject` decorator is needed because of limitation of type system.

</TabItem>
</Tabs>

## Global Providers and Token

Module is able to share tokens and providers with other modules, even application. When enabling a global flag, the provider still depends on an original Injector.

<Tabs
defaultValue="definition"
values={[
{label: 'Definition', value: 'definition'},
{label: 'Usage', value: 'usage'},
]}>
<TabItem value="definition">

```typescript
// Users module

@Injectable({
  global: true,
})
export class Auth {
  constructor(private logger: Logger) {}

  getCurrentUser() {
    logger.debug(`Asking for authenticated user`);
    return /*... */;
  }
}
```

</TabItem>
<TabItem value="usage">

```typescript
// Posts module

@Injectable()
export class Posts {
  constructor(private auth: Auth, private logger: Logger) {}

  getMyPosts() {
    const me = this.auth.getCurrentUser();

    logger.debug(`Asking for my posts`);

    return /* ... */;
  }
}
```

</TabItem>
</Tabs>

In the scenario above, we've got two modules: Posts and Users.
Both modules defines their own `Logger`.
Users module defines `Auth` service as globally available.
Posts module defines `Posts` service.

When `Posts.getMyPosts()` is called, it fetches a current user from `Auth` service.
The `Auth.getCurrentUser()` calls a logger (provided by `Users` module).
In `Posts.getMyPosts()` a different logger is invoked (provided by `Posts` module).

What all of that mean? Because global providers are accessible in all modules, they still use the injector they were created by.
Global providers are still isolated but their API is public to other modules.

## Lazy with forwardRef

The `forwardRef` function allows to refer to references which are not yet defined. Useful when circular dependency of modules is an issue.

```typescript
import { Injectable, Inject } from 'graphql-modules';
import { ApiKey } from './keys';

@Injectable()
class Posts {
  constructor(@Inject(forwardRef(() => ApiKey)) private key: string) {}

  allPosts() {
    if (!this.key) {
      throw new Error('API key is required');
    }

    return [
      /* ... */
    ];
  }
}
```

## Available Tokens

GraphQL Modules have a set of built-in and ready to use Tokens. They may be handy in some situations.

- [`CONTEXT`](../api.md#context) - represents a provided GraphQL Context (`GraphQLModules.GlobalContext`)
- [`MODULE_ID`](../api.md#module_id) - represents an id of a module
