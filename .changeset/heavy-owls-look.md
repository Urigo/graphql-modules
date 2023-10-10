---
'graphql-modules': major
---

Drop Node 16 and Apollo v2 and v3 support

`createApolloExecutor` and `createSchemaForApollo` have been removed in favor of `createApolloGateway`.

You can create `gateway` instance for Apollo Server v4 like this, and pass it directly to `ApolloServer` constructor. You don't need to pass `schema` or `executor` anymore.

```ts
const gateway = application.createApolloGateway()

const apolloServer = new ApolloServer({
  gateway
})
```
