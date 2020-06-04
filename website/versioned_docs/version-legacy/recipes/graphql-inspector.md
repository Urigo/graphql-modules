---
id: graphql-inspector
title: Integrate With GraphQL Inspector
sidebar_label: GraphQL Inspector
---

**[GraphQL Inspector](https://graphql-inspector.com/)** outputs a list of changes between two GraphQL schemas.
Every change is precisely explained and marked as breaking, non-breaking or dangerous.
It helps you validate documents and fragments against a schema and even find similar or duplicated types.

GraphQL Modules comes with a built-in support for **[GraphQL Inspector](https://graphql-inspector.com/)**.

To get started, add `@graphql-inspector/cli` to your app:

```bash
yarn global add @graphql-inspector/cli
```

And create `schema.ts` to expose the schema of your GraphQL Modules application.
GraphQL Modules won't load other things such as injectors, resolvers and providers when you just try to get type definitions from your top module, because GraphQL Modules loads every part of module lazily.

- Create `src/schema.ts` to expose your type definitions to **[GraphQL Inspector](https://graphql-inspector.com/)** without any business logic.

`src/schema.ts`

```typescript
import { AppModule } from './modules/app.module';

// Get schema from top module, and export it
export default AppModule.schema;
```

Then, you can run:

```bash
introspect ./schema.ts --require ts-node/register
```

See also **[the documentation of GraphQL Inspector](https://graphql-inspector.com/docs/)** to learn more.
