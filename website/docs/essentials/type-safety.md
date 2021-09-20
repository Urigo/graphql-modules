---
id: type-safety
title: Type-Safety
sidebar_label: Type Safety
---

If you are using TypeScript, and you wish to get a better integration for GraphQL and TypeScript while writing your API and resolvers, we have a few tools that might make it simple for you.

## Shaping Context type

GraphQL Modules expose a global namespace called `GraphQLModules`, so there's no need to pass the same signature over and over again as part of generic types of different APIs. The `Context` type is part of the `GraphQLModules` namespace.

`GraphQLModules.Context` is global and shared across modules and application which means you can define it once and it applies automatically everywhere. It is a global interface exposed for you by GraphQL Modules and allow you to easily type your `context` object.

To extend `Context`, add a declaration statement in your code to add new type properties to `GraphQLModules.GlobalContext` (which makes up part of `Context`):

```typescript
declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      request: RequestType;
      myData: myDataType;
    }
  }
}
```

## Using Context type

While writing your resolvers, if you wish to give a type to the `context` argument based on your actual `context` shape, you can use `GraphQLModules.Context`. 

Using `GraphQLModules.Context` is simple and because GraphQL Modules makes it a globally available type, you just use it, there's no need to import it from `graphql-modules` package. You can use it directly in your resolvers:

```typescript
const resolvers = {
  Query: {
    myQuery(root, args, context: GraphQLModules.Context, info) {
      // ...
    },
  },
};
```
Or assign it declaratively or programatically to resolvers globally with [Graphql Code Generator](https://www.graphql-code-generator.com/docs/presets/graphql-modules):

```yaml
schema: './src/modules/**/typedefs/*.graphql'
generates:
  ./server/src/modules/:
    preset: graphql-modules
    config:
      contextType: 'GraphQLModules.Context', # Your extended context type!
    presetConfig:
      baseTypesPath: ../generated-types/graphql.ts # Where to create the complete schema types
      filename: generated-types/module-types.ts # Where to create each module types
    plugins:
      - typescript
      - typescript-resolvers
     ...
```

Now every piece and type of GraphQL Modules understands the context and you gain much stronger type-safety. If you are using `GraphQLModules.Context` in your resolvers, it will get updated automatically.

## Strict Resolvers Types

If you wish to have even more control over you implementation, you can use GraphQL-Code-Generator to generate resolvers signature types per each module you write. This is useful because this way you can find issues during development/build time, and get complete type-safety and auto-complete in your IDE.

We created a special GraphQL-Code-Generator `preset` for that purpose. It generates a complete, unified, type signature for your schema, and sub-files per each module, containing only the GraphQL types declared/extended in your specific module.

To get started, [follow the instructions in `graphql-code-generator.com` website](https://graphql-code-generator.com/docs/presets/graphql-modules).

> TIP: To get the most out of your GraphQL-Code-Generator integration, please [refer to this blog post](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen). You can use your own model types, automatically type `parent` value of your resolvers, have a fine-grain control of the output and much more!
