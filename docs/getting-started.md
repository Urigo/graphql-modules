---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Install GraphQL Modules using Yarn:

```
    yarn add @graphql-modules/core
```

Or Npm:

```
    npm install --save @graphql-modules/core
```

Then, create your `GraphQLApp` instance:

```typescript
const graphQlApp = new GraphQLApp({
    modules: [],
});
```

`GraphQLApp` manages your module, GraphQL schema, resolver, context building and the communication between your modules.

Great, so now you have a ready-to-use `GraphQLApp` instance.

Go ahead and create your first `GraphQLModule`.
