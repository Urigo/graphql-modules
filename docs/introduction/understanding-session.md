---
id: understanding-session
title: Understanding Session
sidebar_label: Understanding Session
---

When a GraphQL request arrives in GraphQL-Modules, GraphQL-Modules creates a scope only for that network request. GraphQL-Modules identifies this scope by a unique object that is given in the global application context. Global application context defined in your GraphQL server or library is not the same with module's context; because every resolvers, context builders, dependency injection and all other logics like these are encapsulated.

You can decide how you want to pass this session object like in your application context building phase.

GraphQL-Modules tries to get `session` property of your global application context first, but if there is no `session` property, it takes all application context object as your network session object.

### Using in `express-graphql`
For example `express-graphql` passes `express.Request` by default as global application context;

```typescript
    const MyModule = new GraphQLModule({
        context(session: express.Request) {
            return {
                authToken: session.headers.authorization,
            };
        }
    });

    // Some express code
    app.use('/graphql', graphqlHTTP({
        schema: MyModule.schema
    }));
```

What if we need more stuff in network session;

```typescript
    interface MyModuleSession {
        req: express.Request,
        res: express.Response
    }
    const MyModule = new GraphQLModule({
        context(session: MyModuleSession) {
            res.on('finish', () => {
                // Some cleanup
            });
            return {
                authToken: session.req.headers.authorization,
            };
        }
    });
    // Some express code
    app.use('/graphql', graphqlHTTP((req, res) => ({
        schema: MyModule.schema,
        context: { session: { req, res }, otherThingsWillBeIgnored: ... }
        // or without session property
        context: { req, res }
    })));
```

### Using in `ApolloServer`

On the other hand, `apollo-server` needs to be passed it like below;

```typescript
new ApolloServer({
    modules: [
        MyModule
    ],
    context: ({ req, res }) => ({ req, res }),
    // or
    context: ({ req, res }) => ({ session: { req, res } }),
    // or 
    context: session => ({ session }),
    // or 
    context: session => session,
})
```

### Using in another application that doesn't use GraphQL Modules on the top

If you want to use a `GraphQLModule` in a non-GraphQLModules application, you can safely pass context builder of `GraphQLModule`. 
And you can use internal context of your `GraphQLModule` including **Dependency Injection**.
GraphQL-Modules internally handles `session` without the need of passing `session` specifically.

#### Using `modules` of `ApolloServer`

```typescript
const MyAccountsModule = AccountsModule.forRoot({ ... });
new ApolloServer({
    modules: [ MyAccountsModule ]
    typeDefs: myTypeDefs,
    resolvers: myResolvers,
    context: ({ req, res }) => {
        // My Context Stuff
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
    graphiql: true,
}));
```

This is what `Session` means in GraphQL-Modules. You can read more about **[Provider Scopes](/docs/recipes/dependency-injection#provider-scopes)** in **Dependency Injection** sections of our documentation.
