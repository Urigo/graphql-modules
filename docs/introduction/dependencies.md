---
id: dependencies
title: Dependencies Between Modules
sidebar_label: Dependencies Between Modules
---

With GraphQL Modules you can create dependencies between modules.
They will affect the initialization order, and the order in which `Provider`s are loaded.

To add a dependency to another module, start by adding the `imports` array to your module declaration.

To see it in action, let's add a new module called `my-second-module`:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';

export const MySecondModule = new GraphQLModule({
  typeDefs,
  resolvers
});
```

Now, we can add a direct dependency by adding to our first module:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { UserProvider } from './user.provider';
import { MySecondModule } from './my-second-module';

export const MyModule = new GraphQLModule({
  typeDefs,
  resolvers,
  providers: [UserProvider],
  imports: [MySecondModule]
});
```

> This is useful when you just want to automatically guarantee that your module is initialized after another module.

Now GraphQL Modules will make sure to load and initialize `MySecondModule` before `MyModule`.

## Exclusions from Schema

You can exclude some types or only some fields from a specific type while importing a module's schema into another by using `withExclusionsFromSchema` like below;

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './schema.graphql';
import resolvers from './resolvers';
import { UserProvider } from './user.provider';
import { MySecondModule } from './my-second-module';

export const MyModule = new GraphQLModule({
  typeDefs,
  resolvers,
  providers: [UserProvider],
  imports: [MySecondModule.withExclusionsFromSchema(['Query.unwanted', 'Unwanted.*'])]
});
```

Now `MyModule` does not import from `MySecondModule` both `typeDefs` and `resolvers` of the specified unwanted fields.
