---
id: data-sources
title: Data Sources
sidebar_label: Data Sources Integration
---

# Data Sources

As defined in Apollo Server documentation, data sources are specific classes that encapsulates fetching data from a particular service, with built-in support for caching, deduplication and error handling. A data source instance uses the cache of your GraphQL Server, and is passed through your Application Context in normal case.

GraphQL-Modules has built-in support for Data Sources in its own encapsulation-based modular dependency injection system. GraphQL-Modules considers DataSources as session-scoped providers, and passes the cache logic of the module.

Let's assume you have a data source class for the communication between your external REST API. The only you do is to add `Injectable` decorator for this class to make it able to be part of GraphQL-Modules DI.

To learn more about Data Sources, check Apollo docs;
[Data sources - Apollo Server](https://www.apollographql.com/docs/apollo-server/features/data-sources.html)

## REST Data Source Example

```ts
  import { RESTDataSource } from 'apollo-datasource-rest';
  import { Injectable } from '@graphql-modules/di';

  @Injectable({
    scope: ProviderScope.Session
  })
  export class MoviesAPI extends RESTDataSource {
    constructor() {
      super();
      this.baseURL = 'https://movies-api.example.com/';
    }

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

Then add this DataSource provider to our module, and you can use that data source in your resolvers just like other kind of providers.

```ts
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

```ts
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

```ts
  const { schema, context, cache } = YourGraphQLModule;

  new ApolloServer({
    schema,
    context,
    cache
  });
```

[Learn more about custom cache storage mechanism](https://www.apollographql.com/docs/apollo-server/features/data-sources.html#Using-Memcached-Redis-as-a-cache-storage-backend)
