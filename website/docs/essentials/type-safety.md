---
id: type-safety
title: Type-Safety
sidebar_label: Type Safety
---

If you are using TypeScript, and you wish to get a better integration for GraphQL and TypeScript while writing your API and resolvers, we have a few tools that might make it simple for you.

## Using Context type

While writing you resolvers, if you wish to type your `context` argument based on your actual `context` shape, you can use `GraphQLModules.Context`. It a global interface expose for you by GraphQL-Modules and allow you to easily type your `context` object.

Using `GraphQLModules.Context` is simple and because it's a globally available type, you just use it, there's no need to import it from `graphql-modules` package.

```typescript
const resolvers = {
  Query: {
    myQuery(root, args, context: GraphQLModules.Context, info) {
      // ...
    },
  },
};
```

## Shaping Context type

GraphQL Modules expose a global namespace called `GraphQLModules`, so there's no need to pass the same signature over and over again as part of generic types of different APIs.

Context is global and shared across modules and application which means you can define it once and it applies automatically everywhere.

Use and extend `GraphQLModules.GlobalContext` like this:

```typescript
declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      request: any;
    }
  }
}
```

Now every piece of GraphQL Modules understands the context and you gain much stronger type-safety. If you are using `GraphQLModules.Context` in your resolvers, it will get updated automatically.

## Strict Resolvers Types

If you wish to have even more control over you implementation, you can use GraphQL-Code-Generator to generate resolvers signature types per each module you write. This is useful because this way you can find issues during development/build time, and get complete type-safety and auto-complete in your IDE.

We created a special GraphQL-Code-Generator `preset` for that purpose. It generates a complete, unified, type signature for your schema, and sub-files per each module, containing only the GraphQL types declared/extended in your specific module.

To get started, [follow the instructions in `graphql-code-generator.com` website](https://graphql-code-generator.com/docs/presets/graphql-modules).

> TIP: To get the most out of your GraphQL-Code-Generator integration, please [refer to this blog post](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen). You can use your own model types, automatically type `parent` value of your resolvers, have a fine-grain control of the output and much more!
