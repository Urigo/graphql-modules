---
id: integrate-with-graphql-code-generator
title: Integrate With GraphQL Code Generator
sidebar_label: Integrate With GraphQL Code Generator
---

GraphQL Modules comes with a built-in support for [GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator)

To get started, add `graphql-code-generator` and any template such as `graphql-codegen-typescript-template` to your app:

    $ yarn add graphql-code-generator graphql-codegen-typescript

And create `schema.ts` to expose merged `typeDefs` of your GraphQL Modules application.
Note that GraphQL Modules won't load any other things such as injectors, resolvers and providers when you just try to get `typeDefs` from your top module; because GraphQL Modules loads every part of module in a lazy way.

So, that

```typescript
import 'reflect-metadata';
import { AppModule } from './modules/app.module';

// Get typeDefs from top module, and export it.
export default AppModule.typeDefs;
```

Then, create `codegen.yml` on your project root. In the example, TypeScript file is used.
Check [GraphQL Code Generator](https://graphql-code-generator.com/) docs for more details.

```yaml
overwrite: true
schema: ./src/schema.ts # You can use .js files as well
require:
  - ts-node/register/transpile-only # required if you're using TS-Node
  - tsconfig-paths/register # required if you're using custom paths
generates:
  ./src/generated-models.ts:
    plugins:
      - typescript-common
      - typescript-server
      - typescript-resolvers
```

You can add a script to `package.json`.

```json
{
  //...
  "scripts": {
    //...
    "generate-types": "gql-gen",
    //...
  }
  //...
}
```

