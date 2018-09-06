---
id: dependencies
title: Dependencies Between Modules
sidebar_label: Dependencies Between Modules
---

With GraphQL Modules you can create dependencies between modules. It will effect the initialization order, and effect the order that `Provider`s are loaded.

To add a dependency to another module, start by adding `dependencies` array to your modules declaration, and add the list of dependencies.

To see it in action, let's add another module, and we will demonstrate it in the `my-module`.

Let's add a new module called `my-second-module`:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { UserProvider } from './user.provider';

export const mySecondModule = new GraphQLModule({
    name: 'my-second-module',
    typeDefs,
    resolvers,
});
```

Now, you can add a direct dependency by adding to our first module:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { UserProvider } from './user.provider';

export const myModule = new GraphQLModule({
    name: 'my-module',
    typeDefs,
    resolvers,
    providers: [
        UserProvider,
    ],
    dependencies: [
        mySecondModule,
    ],
});
```

Or, you can add a dependency by using only the name of the module as string:

```typescript
dependencies: [
    'my-second-module',
],
```

> This is useful when you just want to make sure your module is initialized after another module without knowing it directly.

Now GraphQL Modules will make sure to load and initialize `my-second-module` before `my-module`.
