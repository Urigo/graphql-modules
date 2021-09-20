---
id: type-safety
title: Type-Safety
sidebar_label: Type Safety
---

If you are using TypeScript, and you wish to get a better integration for GraphQL and TypeScript while writing your API and resolvers, we have a few tools that might make it simple for you.

## Shaping Context type

GraphQL Modules exposes a global namespace called `GraphQLModules`, so there's no need to pass the same signature over and over again as part of generic types of different APIs. This namespace includes the `Context` type.

`GraphQLModules.Context` is a global interface exposed for you by GraphQL Modules and allow you to easily type your `context` object. It is global and shared across modules and application which means you can define it once and it applies automatically everywhere.

To extend `GraphQLModules.Context`, add a declaration statement in your code to add new type properties to `GraphQLModules.GlobalContext` (which makes up part of `GraphQLModules.Context`):

```typescript
declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      request: RequestType;
      customData: customDataType;
    }
  }
}
```
Now every piece of GraphQL Modules understands the context type and you gain much stronger type-safety. Changes to `GraphQLModules.Context` will get updated automatically wherever it is used.

## Using Context type

Now that you've extended the `Context` type based on your actual context shape, you can use `GraphQLModules.Context` while writing your resolvers. 

Using `GraphQLModules.Context` is simple and because GraphQL Modules makes it a globally available type, you just use it, there's no need to import it from `graphql-modules` package. You can use it directly in your resolvers by typing the `context` argument:

```typescript
const resolvers = {
  Query: {
    myQuery(root, args, context: GraphQLModules.Context, info) {
      // ...
    },
  },
};
```
Or assign it globally with [Graphql Code Generator](https://www.graphql-code-generator.com/docs/presets/graphql-modules):

```yaml
schema: './src/modules/*.graphql'
generates:
  ./src/modules/:
    preset: graphql-modules
    config:
      contextType: 'GraphQLModules.Context', # Your extended context type!
    presetConfig:
      baseTypesPath: ../generated/schema-types.ts
      filename: generated/module-types.ts
    plugins:
      - typescript
      - typescript-resolvers
     ...
```

## Strict Resolvers Types

If you wish to have even more control over you implementation, you can use GraphQL-Code-Generator to generate resolvers signature types per each module you write. This is useful because this way you can find issues during development/build time, and get complete type-safety and auto-complete in your IDE.

We created a special GraphQL-Code-Generator `preset` for that purpose. It generates a complete, unified, type signature for your schema, and sub-files per each module, containing only the GraphQL types declared/extended in your specific module.

To get started, [follow the instructions in `graphql-code-generator.com` website](https://graphql-code-generator.com/docs/presets/graphql-modules).

> TIP: To get the most out of your GraphQL-Code-Generator integration, please [refer to this blog post](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen). You can use your own model types, automatically type `parent` value of your resolvers, have a fine-grain control of the output and much more!
