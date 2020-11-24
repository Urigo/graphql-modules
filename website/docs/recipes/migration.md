---
id: migration
title: Migration from v0.X
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

> Note: this page is still in progress!

## `DocumentNode` for `typeDefs`

v0 accepted `string` as `typeDefs`, while v1 doesn't.

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

```typescript
import { gql, createModule } from 'graphql-modules';

const myModule = createModule({
  /// ...
  typeDefs: gql`
    type Query {
      foo: String
    }
  `,
});
```

</TabItem>
<TabItem value="0">

```typescript
const myModule = GraphQLModule({
  // ...
  typeDefs: `type Query { foo: String }`,
});
```

</TabItem>
</Tabs>

## Classes to Utility Functions

You no longer need to create `new GraphQLModule()`, you can use `createModule` instead:

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

```typescript
const myModule = createModule({ ... });
```

</TabItem>
<TabItem value="0">

```typescript
const myModule = new GraphQLModule({ ... });
```

</TabItem>
</Tabs>

## Resolvers Composition => Middleware

With version `0.x` we had resolvers-composition, which was our way to define wrappers for resolvers.

In v1, we changed the name to Middlewares, and changed the API a bit, to make it more flexible and more compatible with similar middlewares implementations:

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

To define:

```typescript
function yourMiddleware({ root, args, context, info }, next) {
  /* code */

  return next();
}
```

To use:

```typescript
const myModule = createModule({
  // ...
  middlwares: {
    Query: {
      me: [yourMiddleware],
    },
  },
});
```

</TabItem>
<TabItem value="0">

To define:

```typescript
export const yourMiddleware = () => (next) => async (
  root,
  args,
  context,
  info
) => {
  /* code */

  return next(root, args, context, info);
};
```

To use:

```typescript
const myModule = new GraphQLModule({
  /*...*/
  resolversComposition: {
    'Query.me': [yourMiddleware],
  },
});
```

</TabItem>
</Tabs>

## Module/Application Structure

With version `0.x` of GraphQL Modules, we were trying to make modules more dynamic, and build a hierarchy tree of dependencies between modules. This wasn't a great solution for all use-cases, and made things complicated.

In v1, we changed behavior modules to be flat, and added `Application` to define the root of injection.

You no longer need to define `imports` and define strict dependencies between modules, since they are all flatten and merged together by the `Application`.

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

```typescript
const moduleOne = createModule({ ... });
const moduleTwo = createModule({ ... });

const application = createApplication({
  modules: [moduleOne, moduleTwo]
})
```

</TabItem>
<TabItem value="0">

```typescript
const moduleOne = new GraphQLModule({ ... });
const moduleTwo = new GraphQLModule({ imports: [moduleOne], ...})

const rootModule = new GraphQLModule({
  imports: [moduleTwo],
})
```

</TabItem>
</Tabs>

## Shared Injectables

In V0, you needed to create an `Injectable`, add to to a module, and then in order to consume it in another module, you needed to make sure you have a dependency (with `imports`) between your modules. This was very strict and made development harder.

Since we moved to a flatten structure of `Application`, all you need to do in order to share an `Injectable`, is just to add `global: true`:

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

```typescript
// Module 1

@Injectable({
  global: true
})
class MyProvider {
  // ...
}

const moduleOne = createModule({ providers: [MyProvider] });

// Module 2
@Injectable()
class MyOtherProvider {
  constructor(myProvider: MyProvider) {

  }
}

const moduleTwo = createModule({ ... });
```

</TabItem>
<TabItem value="0">

```typescript
// Module 1

@Injectable()
class MyProvider {
  // ...
}

const moduleOne = new GraphQLModule({
  providers: [MyProvider],
});

// Module 2
@Injectable()
class MyOtherProvider {
  constructor(myProvider: MyProvider) {}
}
const moduleTwo = new GraphQLModule({ imports: [moduleOne] });

const rootModule = new GraphQLModule({
  imports: [moduleTwo],
});
```

</TabItem>
</Tabs>

## Module Config

In V0, we had the concept of `ModuleConfig` which was a very specific way to instantiate a module with configuration.

In V1, it's no longer exists, and we believe there are simpler way to do that, with custom tokens.

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

```typescript
import { createModule, InjectionToken } from '@graphql-modules/core';

export interface MyModuleConfig {
  secretKey: string;
  remoteEndpoint: string;
  someDbInstance: SomeDBInstance;
}

export const MyConfig = new InjectionToken<MyModuleConfig>();

export const createMyModule = (config: MyModuleConfig) =>
  createModule({
    // ...
    providers: [
      {
        provide: MyConfig,
        useValue: config,
      },
    ],
  });

const application = createApplication({
  modules: [
    createMyModule({
      secretKey: '123',
      remoteEndpoint: 'http://...',
      someDbInstance: db,
    }),
  ],
});
```

And to consume, that same way as in V0:

```typescript
@Injectable()
export class MyProvider {
  constructor(@Inject(MyConfig) private config: MyModuleConfig) {
    // ...
  }
}
```

</TabItem>
<TabItem value="0">

```typescript
import { GraphQLModule } from '@graphql-modules/core';

export interface MyModuleConfig {
  secretKey: string;
  remoteEndpoint: string;
  someDbInstance: SomeDBInstance;
}

// You can access the config object like below inside the module declaration
export const MyModule = new GraphQLModule<MyModuleConfig>({
  providers: ({ config: { someDbInstance } }) => [
    MyProvider,
    {
      provide: SomeDbInstance,
      useValue: someDbInstance,
    },
  ],
});
```

And to consume:

```typescript
@Injectable()
export class MyProvider {
  constructor(@Inject(ModuleConfig) private config: MyModuleConfig) {
    // ...
  }
}
```

</TabItem>
</Tabs>

## Session

In v0, we had a concept of Session to manage the execution of each operation. In v1, we dropped it, in favor of a simpler solution.

Internally, we are using JavaScript `Proxy` to manage flows of execution, which allow us to share Injectables between Singleton and Operation scopes.

## Context

In v0, you could create a `context` per each module. In v1, `context` is external for GraphQL-Modules and it's not directly in use. You can do whatever you want with that, and just access it in GraphQL-Modules if you need, but we no longer require you to do specific things with your `context`.

<Tabs
defaultValue="1"
values={[
{label: 'V1', value: '1'},
{label: 'V0', value: '0'},
]}>
<TabItem value="1">

With v1, you can manage your own `context` without anything special that needs to be done in order to GraphQL-Modules to work.

You can inject `CONTEXT` in order to get access to the global execution context, and Modules you create doesn't take part in building that object.

</TabItem>
<TabItem value="0">

```typescript
const MyModule = new GraphQLModule({
  context(session: MyModuleSession) {
    session.res.on('finish', () => {
      // Some cleanup
    });
    return {
      authToken: session.req.headers.authorization,
    };
  },
});
```

</TabItem>
</Tabs>

## Dependency Injection Scopes

WIP!
