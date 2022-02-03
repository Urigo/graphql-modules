---
id: api
title: API Reference
---

## CONTEXT

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/application/tokens.ts)

`CONTEXT` is an InjectionToken representing the provided `GraphQLModules.GlobalContext`

```ts
import { CONTEXT, Inject, Injectable } from 'graphql-modules'

@Injectable()
export class Data {
  constructor(@Inject(CONTEXT) private context: GraphQLModules.GlobalContext) {}
}
```

## MODULE_ID

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/module/tokens.ts)

`MODULE_ID` is an InjectionToken representing module's ID

```ts
import { MODULE_ID, Inject, Injectable } from 'graphql-modules'

@Injectable()
export class Data {
  constructor(@Inject(MODULE_ID) moduleId: string) {
    console.log(`Data used in ${moduleId} module`)
  }
}
```

## Application

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/application/types.ts)

A return type of `createApplication` function.

- `typeDefs` - A list of type definitions defined by modules.
- `resolvers` - An object with resolve functions defined by modules.
- `schema` - Ready to use GraphQLSchema object combined from modules.
- `injector` - The application (Singleton) injector.
- `createOperationController` - Take over control of GraphQL Operation
- `createSubscription` - Creates a `subscribe` function that runs the subscription phase of GraphQL.
  Important when using GraphQL Subscriptions.
- `createExecution` - Creates a `execute` function that runs the execution phase of GraphQL.
  Important when using GraphQL Queries and Mutations.
- `createSchemaForApollo` - Experimental
- `createApolloExecutor` - Experimental

## ApplicationConfig

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/application/types.ts)

Application's configuration object. Represents the first argument of `createApplication` function.

- `modules` - A list of GraphQL Modules
- `providers` - A list of Providers - read the ["Providers and Tokens"](di/providers) chapter.
- `middlewares` - A map of middlewares - read the ["Middlewares"](advanced/middlewares) chapter.
- `schemaBuilder` - Creates a GraphQLSchema object out of typeDefs and resolvers

## createApplication

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/application/application.ts)

Creates Application out of Modules. Accepts `ApplicationConfig`.

```ts
import { createApplication } from 'graphql-modules'
import { usersModule } from './users'
import { postsModule } from './posts'
import { commentsModule } from './comments'

const app = createApplication({
  modules: [usersModule, postsModule, commentsModule]
})
```

## createModule

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/module/module.ts)

Creates a Module, an element used by Application. Accepts `ModuleConfig`.

```ts
import { createModule, gql } from 'graphql-modules'

export const usersModule = createModule({
  id: 'users',
  typeDefs: gql`
    // GraphQL SDL
  `,
  resolvers: {
    // ...
  }
})
```

## ModuleConfig

[_source file_](https://github.com/Urigo/graphql-modules/blob/master/packages/graphql-modules/src/module/types.ts)

Module's configuration object. Represents the first argument of `createModule` function.

- `id` - Unique identifier of a module
- `dirname` - Pass `__dirname` variable as a value to get better error messages.
- `typeDefs` - An object or a list of GraphQL type definitions (SDL).
- `resolvers` - An object or a list of GraphQL resolve functions.
- `middlewares` - A map of middlewares - read the ["Middlewares"](advanced/middlewares) chapter.
- `providers` - A list of Providers - read the ["Providers and Tokens"](di/providers) chapter.
