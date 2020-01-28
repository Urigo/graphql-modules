---
id: understanding-session
title: Understanding Session
sidebar_label: Understanding Session
---

When a GraphQL request arrives at GraphQL Modules, GraphQL Modules creates a scope only for that network request.
GraphQL Modules identifies this scope by a unique object given in the global application context.
The global application context defined in your GraphQL server/library is not the same with the module's context, because all resolvers, context builders, dependency injections, etc. are encapsulated in the global application context.

You can decide how to pass the session object in your application's context-building phase.

GraphQL Modules tries to get the `session` property of your global application context first, but if there is no `session` property, it takes all application context objects as your network session objects.

### Using in `express-graphql`

For example, `express-graphql` passes `express.Request` by default as the global application context:

```typescript
const MyModule = new GraphQLModule({
  context(session: express.Request) {
    return {
      authToken: session.headers.authorization
    };
  }
});

// Some `express` code
app.use(
  '/graphql',
  graphqlHTTP({
    schema: MyModule.schema
  })
);
```

If we need more stuff in the network session:

```typescript
interface MyModuleSession {
  req: express.Request,
  res: express.Response
}
const MyModule = new GraphQLModule({
  context(session: MyModuleSession) {
    session.res.on('finish', () => {
      // Some cleanup
    });
    return {
      authToken: session.req.headers.authorization,
    };
  }
});
// Some `express` code
app.use('/graphql', graphqlHTTP((req, res) => ({
  schema: MyModule.schema,
  context: { session: { req, res }, /* other things will be ignored ... */ }
  // or without the `session` property
  context: { req, res }
})));
```

### Using in `ApolloServer`

On the other hand, `apollo-server` needs to be passed it like below:

```typescript
new ApolloServer({
  modules: [MyModule],
  context: ({ req, res }) => ({ req, res }),
  // or
  context: ({ req, res }) => ({ session: { req, res } }),
  // or
  context: session => ({ session }),
  // or
  context: session => session
});
```

### Using in another application that doesn't use GraphQL Modules on the top

Even if you want to use `GraphQLModule` in a non-GraphQL-Modules application, you can safely pass the context builder of `GraphQLModule`.
And you can use the internal context of your `GraphQLModule` including **Dependency Injection**.
GraphQL Modules internally handles `session` without the need of passing `session` specifically.

#### Using `modules` of `ApolloServer`

```typescript
const MyAccountsModule = AccountsModule.forRoot({ ... });
new ApolloServer({
  modules: [MyAccountsModule]
  typeDefs: myTypeDefs,
  resolvers: myResolvers,
  context: ({ req, res }) => {
    // My context stuff
    return {
      myContextProp: {...},
      ...MyAccountsModule.context({ req, res })
    }
  }
})
```

#### Using schema stitching

You can safely extract reusable `typeDefs`, `resolvers` and `context` from your `GraphQLModule`, and use it outside `GraphQLModule`.

```typescript
import { mergeTypeDefs, mergeResolvers } from 'graphql-toolkit';

const MyAccountsModule = AccountsModule.forRoot({ ... });

const schema = mergeSchemas({
  typeDefs: [
    MyAccountsModule.typeDefs,
    gql`
      type Query {
        someField: SomeType
      }
    `
  ],
  resolvers: [
    MyAccountsModule.resolvers,
    {
      Query: {
        someField: ...
      }
    }
  ]
});

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));
```

This is what `Session` means in GraphQL Modules.
You can read more about **[Provider Scopes](/docs/recipes/dependency-injection#provider-scopes)** in the **Dependency Injection** section.
