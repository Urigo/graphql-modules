---
id: testing
title: Testing
sidebar_label: Testing
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

GraphQL Modules provides a set of utilities for testing your modules and also for more granular testing of module's smaller units, like providers and middlewares.

To access the testing utilities, import `testkit` object from `graphql-modules` package:

```typescript
import { testkit } from 'graphql-modules';
```

The `testkit` object and its API will grow over time, we expect to implement more and more useful features in upcoming releases.

> GraphQL Modules depend on **Reflect API** for reflection and for defining dependencies between DI parts, please import `reflect-metadata` in every test file or setup your testing framework to import it somewhere globally.

> The [Jest framework](https://jestjs.io/) is used in all example but its API is very similar to other testing frameworks.

## Testing application

When it comes to integration testing of an Application, the best practice is to avoid any significant modifications. That's why in our Test Kit you will find `mockApplication(app)` function that accepts the original Application and lets you modify the Modules and application-level providers.

The `testkit.mockApplication()` resolves a `MockedApplication` object that extends your original `Application` with few useful methods.

### Replacing a module

One of those methods is `replaceModule()`. In combination with `testkit.mockModule()`, it allows you to modify a module and overwrite its providers.

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { application } from './application';
import { myModule, ENVIRONMENT } from './my-module';

test('ing', () => {
  const app = testkit.mockApplication(application).replaceModule(
    testkit.mockModule(myModule, {
      providers: [
        {
          provide: ENVIRONMENT,
          useValue: 'testing',
        },
      ],
    })
  );

  expect(app.schema.getQueryType()).toBeDefined();
});
```

In the example above we modified the original application by setting testing `ENVIRONMENT` in `myModule`. We used `testkit.mockApplication`, `replaceModule` and `testkit.mockModule` together.

### Overwriting application providers

Now let's talk about `addProviders()` function. It allows you to overwrite application-level providers.

> In GraphQL Modules, always the last provider wins. What does it mean? When you pass a list of providers and two of them try to provide the same token, only the last one counts.
> With this on mind, it's easy to overwrite providers, just put it at the end of the list. This is exactly how `addProviders()` works.

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { application, ENVIRONMENT } from './application';

test('ing', () => {
  const app = testkit.mockApplication(application).addProviders([
    {
      provide: ENVIRONMENT,
      useValue: 'testing',
    },
  ]);

  expect(app.schema.getQueryType()).toBeDefined();
});
```

In the example above we modified the original application by setting the `ENVIRONMENT` to `testing`. We used `testkit.mockApplication` and `addProviders`.

## Testing modules

In general, the idea behind testing a module is to create an application out of it. Instead of using `createApplication()`, our Test Kit provides a `testModule()` function. It calls `createApplication` under the hood but comes with a set of helpful options.

The easiest way to test a module would be to write the following code:

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { myModule } from './my-module';

test('ing', () => {
  const app = testkit.testModule(myModule);

  expect(app.schema.getQueryType()).toBeDefined();
});
```

Probaly none of your modules will work with `testkit.testModule` out of the box. That's because the module and especially its type definitions depend on types from another module or Dependency Injection is incomplete.

### Turning type extensions into definitions

In case your module extends the `Query` type or other types and does not depend on other modules, transforming `extend type X` into `type X` should do the work.

To turn on the transformation please enable `replaceExtensions` flag in options - `testModule(mod, options)`.

<Tabs
defaultValue="test"
values={[
{label: 'my-module.spec.ts', value: 'test'},
{label: 'my-module.ts', value: 'module'},
]}>
<TabItem value="test">

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { myModule } from './my-module';

test('ing', () => {
  const app = testkit.testModule(myModule, {
    replaceExtensions: true,
  });

  expect(app.schema.getQueryType()).toBeDefined();
});
```

</TabItem>
<TabItem value="module">

```typescript
import { createModule, gql } from 'graphql-modules';

export const myModule = createModule({
  id: 'my-module',
  typeDefs: gql`
    extend type Query {
      me: User
    }

    type User {
      id: ID
    }
  `,
});
```

</TabItem>
</Tabs>

The `replaceExtensions` flag turned your module's schema into a valid and executable schema.

### Extending module's schema

In case your module extends the `Query` type or other types and using `replaceExtensions` flag won't work, `testkit.testModule` allows to define additional `typeDefs` and `resolvers`.

<Tabs
defaultValue="test"
values={[
{label: 'my-module.spec.ts', value: 'test'},
{label: 'my-module.ts', value: 'module'},
]}>
<TabItem value="test">

```typescript
import 'reflect-metadata';
import { testkit, gql } from 'graphql-modules';
import { myModule } from './my-module';

test('ing', () => {
  const app = testkit.testModule(myModule, {
    typeDefs: gql`
      type User {
        name: String
      }
    `,
    resolvers: {
      Query: {
        me() {
          return {
            name: 'Bob',
          };
        },
      },
    },
    replaceExtensions: true,
  });

  expect(app.schema.getQueryType()).toBeDefined();
});
```

</TabItem>
<TabItem value="module">

```typescript
import { createModule, gql } from 'graphql-modules';

export const myModule = createModule({
  id: 'my-module',
  typeDefs: gql`
    extend type Query {
      me: User
    }
  `,
});
```

</TabItem>
</Tabs>

In the example above, the `replaceExtensions` transformed `extend type Query` into `type Query` and additional typeDefs and resolvers were provided. As you can see, these two approaches of extending the schema can be used together and simplified testing a lot.

### Inherit typeDefs from other modules

The `testkit.testModule` allows to add type definitions from other modules using `inheritTypeDefs` option. Thanks to tree-shaking performed by `inheritTypeDefs`, your tested module includes only the relevant types.

<Tabs
defaultValue="test"
values={[
{label: 'my-module.spec.ts', value: 'test'},
{label: 'my-module.ts', value: 'module'},
{label: 'other-module.ts', value: 'other-module'},
]}>
<TabItem value="test">

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { myModule } from './my-module';
import { otherModule } from './other-module';

test('ing', () => {
  const app = testkit.testModule(myModule, {
    inheritTypeDefs: [otherModule],
  });

  expect(app.schema.getTypes().Message).not.toBeDefined();
});
```

</TabItem>
<TabItem value="module">

```typescript
import { createModule, gql } from 'graphql-modules';

export const myModule = createModule({
  id: 'my-module',
  typeDefs: gql`
    type Query {
      me: User
    }
  `,
});
```

</TabItem>
<TabItem value="other-module">

```typescript
import { createModule, gql } from 'graphql-modules';

export const otherModule = createModule({
  id: 'other-module',
  typeDefs: gql`
    extend type Query {
      messages: [Message]
      users: [User]
    }

    type Message {
      text: String
    }

    type User {
      name: String
    }
  `,
});
```

</TabItem>
</Tabs>

In the example above, the tested module inherits `User` type from `other-module` and thanks to tree-shaking the `Message` type and `Query.messages` and `Query.users` are not in the schema.

The `inheritTypeDefs` is useful when you don't want to define types manually but rather use existing definitions.

### Importing other modules

There's a chance you may want to include other modules in the tested application.

The `testkit.testModule()` let's you do it with `modules` options.

It accepts an array of modules and has exactly the same effect as `createAppliction({ modules: [...] })`.

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { myModule } from './my-module';
import { otherModule } from './other-module';

test('ing', () => {
  const app = testkit.testModule(myModule, {
    modules: [otherModule],
  });
});
```

### Providers and Middlewares

The `testkit.testModule()` accepts `providers` and `middlewares`. They both end up on application-level.

More on that in next two sections: [Testing Providers](#testing-providers), [Testing Middlewares](#testing-middlewares).

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { myModule } from './my-module';
import { myMiddleware } from './my-middleware';
import { MyProvider } from './my-provider';

test('ing', () => {
  const app = testkit.testModule(myModule, {
    providers: [
      {
        provide: MyProvider,
        useValue: {},
      },
    ],
    middlewares: {
      Query: {
        '*': [myMiddleware],
      },
    },
  });
});
```

### Executing operations

As explained earlier, testing a module means creating an application. There's a reason behind it.

The `testkit.testModule` calls `createApplication` internally, this way we keep exactly the same logic as your GraphQL API operates on.

We highly recommend to test the entire execution flow instead of focusing on individual pieces. That's why `testkit` ships with `execute` helper.

```typescript
import 'reflect-metadata';
import { testkit, gql } from 'graphql-modules';
import { myModule, UsersProvider } from './my-module';

test('ing', async () => {
  const app = testkit.testModule(myModule, {
    providers: [
      {
        provide: UsersProvider,
        useValue: {
          getCurrentUser() {
            return {
              name: 'Bob',
            };
          },
        },
      },
    ],
  });

  const result = testkit.execute(app, {
    document: gql`
      {
        me {
          name
        }
      }
    `,
  });

  expect(result.data.me.name).toEqual('Bob');
});
```

The `testkit.execute` doesn't help a lot but without it, you would have to call `app.createExecution`, extract `app.schema` and put it all together to execute an operation. Two lines of code you don't need to worry about!

## Testing providers

There are two ways of testing providers, using `testkit.testModule` and `testkit.testInjector`. The former was already covered in one of the previous sections.

The `testkit.testInjector` let's you play with providers purely on Injector level or in other words in total isolation. There are no modules or application which means no hierarchy and layering.

### testInjector

<Tabs
defaultValue="test"
values={[
{label: 'logger.spec.ts', value: 'test'},
{label: 'logger.ts', value: 'provider'},
]}>
<TabItem value="test">

```typescript
import 'reflect-metadata';
import { testkit } from 'graphql-modules';
import { Logger, LoggerTransport } from './logger';

test('ing', () => {
  const transportLogSpy = jest.fn();
  const injector = testkit.testInjector([
    Logger,
    {
      provide: LoggerTransport,
      useValue: {
        log: transportLogSpy,
      },
    },
  ]);

  const logger = injector.get(Logger);

  logger.log('hello');

  expect(transportLogSpy).toHaveBeenCalledWith('hello');
});
```

</TabItem>
<TabItem value="provider">

```typescript
import { Injectable, Inject, InjectionToken, Scope } from 'graphql-modules';

export const LoggerTransport = new InjectionToken<ILoggerTransport>(
  'logger-transport'
);

export interface ILoggerTransport {
  log(msg: string): void;
}

@Injectable({
  scope: Scope.Singleton,
})
export class Logger {
  constructor(@Inject(LoggerTransport) private transport: ILoggerTransport) {}

  log(msg: string) {
    this.transport.log(msg);
  }
}
```

</TabItem>
</Tabs>

In the example above, thanks to the abstraction, we were able to provide a custom transport layer for our Logger.
This way we know that every call of `Logger.log(msg)` passes the `msg` to the `ILoggerTransport.log(msg)`.

### readProviderOptions

From the performance perspective, it's important to make sure all sinleton providers are in fact singletons and `testkit.readProviderOptions` helps with that.

Let's use again the `Logger` example. This time we want to check the scope of the provider.

```typescript
import 'reflect-metadata';
import { testkit, Scope } from 'graphql-modules';
import { Logger } from './logger';

test('ing', () => {
  const options = testkit.readProviderOptions(Logger);

  expect(options.scope).toEqual(Scope.Singleton);
});
```

The `testkit.readProviderOptions` returns the `ProviderOptions` object with `scope`, `global` and `executionContextIn` properties.

## Testing middlewares

Testing a middleware requires a GraphQL Schema. Using `testkit.testModule` fits perfectly in this scenario.

Depending on complexity of a middleware function, you may want to use or mock different pieces of GraphQL Modules. We tried to cover the most common scenario in the example below.

<Tabs
defaultValue="test"
values={[
{label: 'my-module.spec.ts', value: 'test'},
{label: 'my-module.ts', value: 'module'},
{label: 'auth.ts', value: 'auth'},
]}>
<TabItem value="test">

```typescript
import 'reflect-metadata';
import { testkit, gql } from 'graphql-modules';
import { myModule } from './my-module';

test('ing', () => {
  const app = testkit.testModule(myModule);

  const result = await testkit.execute(app, {
    document: gql`
      {
        me {
          name
        }
      }
    `,
    contextValue: {
      isLoggedIn: false,
    },
  });

  expect(result.errors).toHaveLength(1);
  expect(result.data.me).toBeNull();
});
```

</TabItem>
<TabItem value="module">

```typescript
import { createModule, gql } from 'graphql-modules';
import { AuthProvider, authMiddleware } from './auth';

export const myModule = createModule({
  id: 'my-module',
  typeDefs: gql`
    type Query {
      me: User
    }

    type User {
      name: String
    }
  `,
  resolvers: {
    Query: {
      me() {
        return {
          name: 'Bob',
        };
      },
    },
  },
  providers: [AuthProvider],
  middleware: {
    Query: {
      me: [authMiddleware],
    },
  },
});
```

</TabItem>
<TabItem value="auth">

```typescript
import { Injectable, Inject, Scope, CONTEXT } from 'graphql-modules';

@Injectable({
  scope: Scope.Operation,
})
export class AuthProvider {
  constructor(@Inject(CONTEXT) private context: { isLoggedIn: boolean }) {}

  isLoggedIn() {
    return this.context.isLoggedIn === true;
  }
}

async function authMiddleware({ context }, next) {
  if (!context.injector.get(AuthProvider).isLoggedIn()) {
    throw new Error('Not logged in');
  }

  return next();
}
```

</TabItem>
</Tabs>

The `authMiddleware` prevents private data from leaking out by using `AuthProvider.isLoggedIn()` method. The `isLoggedIn` flag is provided via context of the GraphQL operation. This is done for simplicity of the example but usually you would validate a visitor's session or something similar.

Because in `contextValue` we marked the incoming request as not authenticated (`{ isLoggedIn: false }`), we expect the GraphQL Operation to fail before resolving the original `Query.me` field.

> If you wish to see more testing utilities or have some ideas, reach out to us.
