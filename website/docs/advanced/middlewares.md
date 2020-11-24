---
id: middlewares
title: Middlewares
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Middleware is a way to intercept individual resolve functions or a group of them and return a different result or throw an exception based on a condition. Each middleware can access everything that resolve function receives. The ability to access context and the [`Injector`](../di/introduction.md) makes it even more powerful.

## Middleware function

The middleware function can be `sync` or `async` and accepts two arguments. First one is an object containing `root`, `args`, `context` and `info` properties, we call it `event`. The other argument is a function that calls the next middleware, called `next`.

### What is the `event` object?

Take a look at the regular resolve function.

```typescript
function resolve(root, args, context, info) {
  /* ... */
}
```

It accepts four arguments and in Middlewares we simply wrap them in an object.

```typescript
function middleware({ root, args, context, info }, next) {
  /* ... */
}
```

Because a middleware function can access `context`, it can also extract the `Injector` and get access to Dependency Injection.

### How to use `next` function?

The second argument of a middleware is the `next` function and its only job is to call the middleware or the resolve function itself.

```typescript
function middleware({ root, args, context, info }, next) {
  /* code */

  return next();
}
```

It's important to understand that every middleware should do one of three things:

- throw an exception
- return the result of `next()`
- return a value

In case where a middleware returns nothing (`undefined`), it's going to be used as the result of a field resolver. So be careful!

## Intercepting results

Middlewares are capable of intercepting the field resolver or even not invoke it at all and resolve a different value.

An example of how to let the field resolver run and intercept its result:

```typescript
async function middleware({ root, args, context, info }, next) {
  /* code */

  const result = await next();

  if (someCondition(result)) {
    return null;
  }

  return result;
}
```

You can also resolve any value, without calling the field resolve function:

```typescript
async function middleware({ root, args, context, info }, next) {
  /* code */

  return {
    /* my result */
  };
}
```

## Exceptions

Middlewares behave like regular resolve functions, meaning they can also throw exceptions. It's a useful thing when you need to make sure a field can only be access when the user is logged in or has valid rights.

```typescript
async function middleware({ root, args, context, info }, next) {
  if (!context.injector.get(Auth).isLoggedIn()) {
    throw new Error('Not logged in');
  }

  return next();
}
```

## Registering middlewares

You know how to write middlewares and what they offer, now let's match a middleware with a corresponding type and field.

Three ways of registering middlewares:

- A specific field of a specific type
- All fields of a specific type
- All fields of all types

Here's a first option, intercepting the `Query.me` field resolver:

```typescript
{
  "Query": {
    "me": [yourMiddleware]
  }
}
```

To intercept all fields of a specific type use `*` mask:

```typescript
{
  "Query": {
    "*": [yourMiddleware]
  }
}
```

To intercept all fields of all possible types, use `*` mask twice:

```typescript
{
  "*": {
    "*": [yourMiddleware]
  }
}
```

Now let's understand how to register middlewares in a Module and an Application. Take a look at following example.

<Tabs
defaultValue="module"
values={[
{label: 'Module', value: 'module'},
{label: 'Application', value: 'application'},
]
}>
<TabItem value="module">

```typescript
import { createModule } from 'graphql-modules';

const myModule = createModule({
  /* ... */,
  middlewares: {
    Query: {
      me: [myMiddleware]
    }
  }
})
```

</TabItem>
<TabItem value="application">

```typescript
import { createApplication } from 'graphql-modules';

const application = createApplication({
  /* ... */,
  middlewares: {
    Query: {
      me: [myMiddleware]
    }
  }
})
```

</TabItem>
</Tabs>

## Execution order

Without strict rules on the order of execution, you might get unexpected results.

```log
-> Application *.*
  -> Module *.*
    -> Application Type.*
      -> Module Type.*
        -> Application Type.Field
          -> Module Type.Field
```
