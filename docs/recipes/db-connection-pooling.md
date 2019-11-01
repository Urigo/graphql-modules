---
id: db-connection-pooling
title: Database Connection Pooling
sidebar_label: Database Connection Pooling
---

Opening a database connection is an expensive process, and that's why we use **[Connection pool](https://en.wikipedia.org/wiki/Connection_pool)** to reduce the cost.
And it also allows us to have a good transaction management in a single session that uses different providers.

The first example uses PostgreSQL and **[node-postgres](https://node-postgres.com/features/transactions)** below.
The other example combines **[generic-pool](https://github.com/coopernurse/node-pool)** with **MongoDB** which doesn't have the pooling feature in the native driver internally.

## PostgreSQL

We define two providers in `DatabaseModule`: `Pool` is application scoped and `DatabaseProvider` is session-scoped.
So, it will provide us different clients from connection pool for each session/network request.
See **[Dependency Injection](/docs/introduction/dependency-injection)** to learn more about provider scopes.

`database.module.ts`

```typescript
import { Pool } from 'pg';
export const DatabaseModule = new GraphQLModule({
  providers: [
    Pool,
    // or you can use factory providers
    // to pass extra options to the constructor
    // { provide: Pool, useFactory: () => new Pool({ ... }) }
    DatabaseProvider
  ]
});
```

> You can define external classes as **Provider** in GraphQL Modules. In the example above, `Pool` will be constructed once in the application scope.

And we will use the `OnResponse` hook to release the client to the pool after we've done with it.
See **[Dependency Injection](/docs/introduction/dependency-injection)** to learn more about hooks.

`DatabaseProvider` will be created on a session level while the instance of `Pool` will be the same instance always in the application level.

`database.provider.ts`

```typescript
import { Injectable } from '@graphql-modules/di';
import { SQLStatement } from 'sql-template-strings';
import { Pool, PoolClient } from 'pg';

@Injectable({
  scope: ProviderScope.Session
})
export class DatabaseProvider implements OnRequest, OnResponse {
  private _poolClient: PoolClient;
  constructor(private pool: Pool) {}
  public onRequest() {
    this._poolClient = await this.pool.connect();
  }
  public onResponse() {
    if (this._poolClient) {
      this._poolClient.release();
    }
  }
  async getClient() {
    return this.client;
  }
}
```

You can also combine it with data-loaders to solve the `N+1` problem in SQL queries like below:

`database.provider.ts`

```typescript
import { Pool, PoolClient, QueryResultBase, QueryResult } from 'pg';
import { Injectable, ProviderScope } from '@graphql-modules/di';
import { OnRequest, OnResponse } from '@graphql-modules/core';
import { SQLStatement } from 'sql-template-strings';
import DataLoader from 'dataloader';

@Injectable({
  scope: ProviderScope.Session
})
export class DatabaseProvider implements OnRequest, OnResponse {
  private _poolClient: PoolClient;
  constructor(private pool: Pool) {}
  public onRequest() {
    this._poolClient = await this.pool.connect();
  }
  public onResponse() {
    if (this._poolClient) {
      this._poolClient.release();
    }
  }
  private queryDataLoader = new DataLoader<SQLStatement, QueryResult>(
    queryStatementList => Promise.all(queryStatementList.map(queryStatement => this._poolClient.query(queryStatement))),
    {
      // Create a cache key using query text together with its values
      cacheKeyFn: (queryStatement: SQLStatement) => queryStatement.text + queryStatement.values.join(',')
    }
  );
  // Use this method to query to the database instead of client's native one.
  public async query<Entity = any>(queryStatement: SQLStatement): Promise<QueryResultBase & { rows: Entity[] }> {
    // If query is `SELECT`-type query, use DataLoader
    if (queryStatement.text.startsWith('SELECT')) {
      return this.queryDataLoader.load(queryStatement);
    } else {
      // Otherwise it is probably mutation query, so do not use dataloader
      return this._poolClient.query(queryStatement);
    }
  }
}
```

> The example above also uses [sql-template-strings](https://github.com/felixfbecker/node-sql-template-strings), which allows ES6 template strings for prepared SQL statements.

Thanks to this approach, you can use transactions inside GraphQL Modules like below:

`user.entity.ts`

```typescript
interface UserEntity {
  id: string;
  name: string;
  // some other fields
}
```

`users.provider.ts`

```typescript
import { UserEntity } from './user.entity';

@Injectable({
  scope: ProviderScope.Session
})
export class UsersProvider {
  private currentUserId: string;
  constructor(
    private databaseProvider: DatabaseProvider,
    private moduleSessionInfo: ModuleSessionInfo,
    private someOtherProviderHasDbProcess: SomeOtherProviderHasDbProcess
  ) {
    const token = this.moduleSessionInfo.session.req.headers.authorization;
    if (token) {
      this.currentUserId = exchangeTokenWithUserId(token);
    }
  }
  async getCurrentUser() {
    const { rows } = await this.databaseProvider.query<UserEntity>(
      SQL`SELECT * FROM users WHERE id = ${this.currentUserId}`
    );
    return rows[0];
  }
  async createNewUser(name: string, email: string, ...someOtherThings) {
    try {
      await this.databaseProvider.query(SQL`BEGIN`);

      const someEntityWeNeedForOtherQuery = await this.someOtherProviderHasDbProcess.doSomeProcess(...someOtherThings);

      // Other processes in a single transaction that uses the same client for all sessions

      await this.databaseProvider.query(SQL`COMMIT`);
    } catch (e) {
      await this.databaseProvider.query(SQL`ROLLBACK`);
      throw e;
    }
  }
}
```

## MongoDB with generic-pool

You can create a MongoDB pool and connect it at the beginning of each network request until the network request is finished.

`database.module.ts`

```typescript
import { Pool, createPool } from 'generic-pool';
import { MongoClient } from 'mongodb';
import { GraphQLModule } from '@graphql-modules/core';

export const DatabaseModule = new GraphQLModule({
  providers: [
    {
      provide: Pool,
      useFactory: () =>
        createPool({
          create: () => MongoClient.connect('mongodb://YOUR_MONGO_URL_HERE'),
          destroy: client => client.close()
        })
    },
    DatabaseProvider
  ]
});
```

`database.provider.ts`

```typescript
import { Pool } from 'generic-pool';
import { Injectable, ProviderScope } from '@graphql-modules/di';
import { OnRequest, OnResponse } from '@graphql-modules/core';
import { MongoClient } from 'mongodb';

@Injectable({
  scope: ProviderScope.Session
})
export class DatabaseProvider implements OnRequest, OnResponse {
  private _poolClient: MongoClient;
  constructor(private pool: Pool) {}
  public async onRequest() {
    this._poolClient = await pool.acquire();
  }
  public async onResponse() {
    if (this._poolClient) {
      await this.pool.release(this._poolClient);
    }
  }
  public getClient() {
    return this._poolClient;
  }
}
```
