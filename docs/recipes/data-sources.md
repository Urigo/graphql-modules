---
id: data-sources
title: Fetch External Data Using Data Sources
sidebar_label: Fetch External Data Using Data Sources
---

As defined in the Apollo Server documentation, data sources are specific classes that encapsulate fetching data from particular services, with built-in support for caching, deduplication and error handling.
A data source instance uses the cache of your GraphQL Server and is usually passed through your application context.

GraphQL Modules has built-in support for data sources in its own encapsulation-based modular dependency-injection system.
GraphQL Modules considers data sources as providers and passes the cache logic of the module.

Let's assume you have a data source class for the communication between your external REST API.
All you need to do is add the `Injectable` decorator for this class to let the class be part of GraphQL Modules dependency injection.

> `ProviderScope.Session` is the recommended scope for data sources, it will ensure API responses are not cached between sessions. See **[Provider Scopes](/docs/introduction/dependency-injection#provider-scopes)**.

See also **[Data sources - Apollo Server](https://www.apollographql.com/docs/apollo-server/data/data-sources/)**.

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

  // an example of making an HTTP POST request
  async postMovie(movie) {
    return this.post(
      `movies`, // path
      movie // request body
    );
  }

  // an example of making an HTTP PUT request
  async newMovie(movie) {
    return this.put(
      `movies`, // path
      movie // request body
    );
  }

  // an example of making an HTTP PATCH request
  async updateMovie(movie) {
    return this.patch(
      `movies`, // path
      { id: movie.id, movie } // request body
    );
  }

  // an example of making an HTTP DELETE request
  async deleteMovie(movie) {
    return this.delete(
      `movies/${movie.id}` // path
    );
  }
}
```

## Accessing data sources from resolvers

Then add this data source provider to our module, and you can use that data source in your resolvers just like other kinds of providers.

```typescript
import { MoviesAPI } from './movies-api.provider';
import { GraphQLModule } from '@graphql-modules/core';

export const MoviesModule = new GraphQLModules({
  providers: [MoviesAPI],
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

As described in Apollo Server docs, GraphQL Modules also uses in-memory caching mechanism by default.
But you can also use other cache mechanisms in your GraphQL Modules application.

```typescript
import { MemcachedCache } from 'apollo-server-cache-memcached';

export const MoviesModule = new GraphQLModules({
  providers: [MoviesAPI],
  typeDefs,
  resolvers,
  cache: new MemcachedCache(
    ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
    { retries: 10, retry: 10000 } // Options
  )
});
```

You can share GraphQL Modules cache mechanism with your GraphQL Server.

```typescript
const { schema, selfCache } = YourGraphQLModule;

new ApolloServer({
  schema,
  cache: selfCache
});
```

See also **[Using Memcached/Redis as a cache storage backend](https://www.apollographql.com/docs/apollo-server/data/data-sources/#using-memcachedredis-as-a-cache-storage-backend)**
