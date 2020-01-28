---
id: your-first-module
title: Your First Module
sidebar_label: Your First Module
---

You have understood the basics behind separating the schema. Let's create your first module.

Start by creating a `modules/my-first-module` directory under your project's root. Then, create a file `index.ts`.

Here is a quick example:

`modules/my-first-module/index.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export const MyFirstModule = new GraphQLModule({
  typeDefs: gql`
    type Query {
      myData: Data
    }

    type Data {
      field: String
    }
  `
});
```

That's it. You now have a ready-to-use `GraphQLModule`. Our next step is to expose it using `ApolloServer`.
