---
id: integrate-with-graphql-code-generator
title: Integrate With GraphQL Code Generator
sidebar_label: Integrate With GraphQL Code Generator
---

GraphQL Modules comes with a built-in support for [GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator)

To get started, add `graphql-code-generator` and `graphql-codegen-typescript-template` to your app.

```bash
yarn add graphql-code-generator graphql-codegen-typescript-template
```

And create `schema.ts` to expose merged `typeDefs` of your GraphQL Modules application.

```typescript
import { AppModule } from './modules/app.module';
import { makeExecutableSchema } from 'graphql-tools';

const { typeDefs } = AppModule;
export const schema = makeExecutableSchema({ typeDefs });
```

Then, add a script in `package.json` to generate types easily.

```json
{
  //...
  "scripts": {
    //...
    "generate-types": "gql-gen --template graphql-codegen-typescript-template --schema src/schema.ts --out src/generated-types.ts",
    //...
  }
  //...
}
```

Finally, you can use those typings everywhere.

```typescript
import { ResolversHandler } from '@graphql-modules/core';
import { QueryResolvers } from './generated-types';

@ResolversHandler('Query')
export class QueryResolversHandler implements QueryResolvers.Resolvers {
  user(root, { id }){
    return {
      _id: id,
      username: 'jhon',
    };
  }
}
```
