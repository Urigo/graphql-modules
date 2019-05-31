---
id: data-sources
title: Fetch External Data Using Data Sources
sidebar_label: Fetch External Data Using Data Sources
---

As defined in Apollo Server documentation, data sources are specific classes that encapsulates fetching data from a particular service, with built-in support for caching, deduplication and error handling. A data source instance uses the cache of your GraphQL Server, and is passed through your Application Context in normal case.

GraphQL-Modules has built-in support for Data sources in its own encapsulation-based modular dependency injection system. GraphQL-Modules considers Data sources as providers, and passes the cache logic of the module.

Let's assume you have a data source class for the communication between your external REST API. All you need to do is add the `Injectable` decorator for this class to make it able to be part of GraphQL-Modules DI.

> `ProviderScope.Session` is the recommended scope for Data sources, it will ensure API responses are not cached between sessions. See **[Provider Scopes](/docs/introduction/dependency-injection#provider-scopes)**

To learn more about Data sources, check Apollo docs;
**[Data sources - Apollo Server](https://www.apollographql.com/docs/apollo-server/features/data-sources.html)**

## REST Data Source Example

```typescript
  import { RESTDataSource } from 'apollo-datasource-rest';
  import { Injectable } from '@graphql-modules/di';

  @Injectable({
    scope: ProviderScope.Session
  })
  export class MoviesAPI extends RESTDataSource {
    baseURL = 'https://movies-api.example.com/';

    async getMovie(id) {
      return this.get(`movies/${id}`);
    }

    // an example making an HTTP POST request
    async postMovie(movie) {
      return this.post(
        `movies`, // path
        movie, // request body
      );
    }

    // an example making an HTTP PUT request
    async newMovie(movie) {
      return this.put(
        `movies`, // path
        movie, // request body
      );
    }

    // an example making an HTTP PATCH request
    async updateMovie(movie) {
      return this.patch(
        `movies`, // path
        { id: movie.id, movie }, // request body
      );
    }

    // an example making an HTTP DELETE request
    async deleteMovie(movie) {
      return this.delete(
        `movies/${movie.id}`, // path
      );
    }
  }
```

## Accessing data sources from resolvers

Then add this data source provider to our module, and you can use that data source in your resolvers just like other kind of providers.

```typescript
  import { MoviesAPI } from './movies-api.provider';
  import { GraphQLModule } from '@graphql-modules/core';

  export const MoviesModule = new GraphQLModules({
    providers: [
      MoviesAPI
    ],
    typeDefs: gql`
      type Movie {
        id: ID
        name: String
        # Other fields
      }
      type Query {
        getMovie(id: ID): Movie
      }
    `,
    resolvers: {
      Query: {
        getMovie: (root, args, context, info) => context.injector.get(MoviesAPI).getMovie(args.id)
      }
    }
  });
```

## Using Memcached/Redis as a cache storage backend

As described in Apollo Server docs, GraphQL-Modules also uses in-memory caching mechanism by default. But you can also use other cache mechanism in your GraphQL-Modules application;

```typescript
  import { MemcachedCache } from 'apollo-server-cache-memcached';

  export const MoviesModule = new GraphQLModules({
    providers: [
      MoviesAPI
    ],
    typeDefs,
    resolvers,
    cache: new MemcachedCache(
      ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
      { retries: 10, retry: 10000 }, // Options
    )
  });
```

You can share GraphQL-Modules cache mechanism with your GraphQL Server;

```typescript
  const { schema, selfCache } = YourGraphQLModule;

  new ApolloServer({
    schema,
    cache: selfCache
  });
```

**[Learn more about custom cache storage mechanism](https://www.apollographql.com/docs/apollo-server/features/data-sources.html#Using-Memcached-Redis-as-a-cache-storage-backend)**
