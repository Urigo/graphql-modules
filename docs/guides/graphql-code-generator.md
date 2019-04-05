---
id: graphql-code-generator
title: Integrate With GraphQL Code Generator
sidebar_label: GraphQL Code Generator
---

GraphQL Modules comes with a built-in support for **[GraphQL Code Generator](https://graphql-code-generator.com)**

To get started, add `@graphql-codegen/cli` and necessary templates to your app:

    $ yarn add @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers

And create `schema.ts` to expose `schema` of your GraphQL Modules application.
Note that GraphQL Modules won't load any other things such as injectors, resolvers and providers when you just try to get type definitions from your top module; because GraphQL Modules loads every part of module in a lazy way.

- Create `src/schema.ts` to expose your type definitions to GraphQL Code Generator without any business logic.

`src/schema.ts`
```typescript
import { AppModule } from './modules/app.module';

// Get typeDefs from top module, and export it.
export default AppModule.schema;
```

Then, create `codegen.yml` on your project root. In the example, TypeScript file is used.
Check **[GraphQL Code Generator](https://graphql-code-generator.com/)** docs for more details.

`codegen.yml`
```yaml
overwrite: true
schema: ./src/schema.ts # You can use .js files as well
require:
  - ts-node/register/transpile-only # required if you're using TS-Node
generates:
  ./src/generated-models.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      contextType: @graphql-modules/core#ModuleContext
```

You can add a script to `package.json`.

```json
{
  //...
  "scripts": {
    //...
    "generate-types": "graphql-codegen",
    //...
  }
  //...
}
```

Then you can use these generated typings everywhere in your project;

```typescript
  import { UsersProvider } from '../providers/users.provider';
  import { QueryResolvers } from '../../generated-models';

  export const Query: QueryResolvers = {
      // all parameters and return value are typed
      users: (root, args, context, info) => context.injector.get(UsersProvider).getUsers(args)
  };
```

You can see the blog post that explains why you would need this integration;
**[Writing Strict-Typed GraphQL TypeScript project w/ GraphQL-Modules and GraphQL Code Generator](https://medium.com/p/c22f6caa17b8)**
