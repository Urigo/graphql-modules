---
id: your-first-module
title: Your First Module
sidebar_label: Your First Module
---

So now we understand the basics behind separating the schema, let's create your first module.

Start by creating a `modules/my-first-module` directory under your project's root. Then, create a file called `index.ts`:

Here is a quick example:

`modules/my-first-module/index.ts`
```typescript
import { GraphQLModule } from '@graphql-modules/core';

export const myFirstModule = new GraphQLModule({
    name: 'my-first-module',
    typeDefs: gql`
        type Query {
            myData: Data
        }

        type Data {
            field: String
        }
    `,
});
```

> `name` is used to set the name of your module, it will also effect other aspects of your module later (such as config, context building and more)

Now let's import this module and use it as part of our `GraphQLApp`:

```typescript
import { GraphQLApp } from '@graphql-modules/core';
import { myFirstModule } from './modules/my-first-module';

const graphQlApp = new GraphQLApp({
    modules: [
        myFirstModule,
    ],
});
```

That's it, you now have a ready-to-use `GraphQLModule` and `GraphQLApp`, our next step is to expose it using `ApolloServer`.
