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

export const MySecondModule = new GraphQLModule({
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
import { MySecondModule } from './my-second-module';

export const MyModule = new GraphQLModule({
    typeDefs,
    resolvers,
    providers: [
        UserProvider,
    ],
    imports: [
        MySecondModule,
    ],
});
```

> This is useful when you just want to make sure your module is initialized after another module without knowing it directly.

Now GraphQL Modules will make sure to load and initialize `MySecondModule` before `MyModule`.
