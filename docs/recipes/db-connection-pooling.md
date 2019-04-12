---
id: db-connection-pooling
title: Database Connection Pooling
sidebar_label: Database Connection Pooling
---

Opening a database connection is an expensive process, and that's why we use **[Connection pool](https://en.wikipedia.org/wiki/Connection_pool)** to reduce the cost. And it also allows us to have a good transaction management in a single session that uses different providers.

The example uses PostgreSQL and **[node-postgres](https://node-postgres.com/features/transactions)** below. However, you can also do it with any other modern databases such as [MongoDB](https://www.compose.com/articles/connection-pooling-with-mongodb/) and [MySQL](https://www.compose.com/articles/connection-pooling-with-mongodb/)

We define two providers in `DatabaseModule`, the first one is `Pool` which will be application scoped, and `DatabaseProvider` will be session-scoped. So, it will provide us different clients from connection pool for each session/network request. See Dependency Injection part of our docs to learn more about provider scopes.

`database.module.ts`
```ts
import { Pool } from 'pg';
export const DatabaseModule = new GraphQLModule({
    providers: [
        Pool, // or you can use factory providers to pass extra options to the constructor { provide: Pool, useFactory: () => new Pool({ ... }) }
        DatabaseProvider
    ]
});
```

> You can define external classes as **Provider** in GraphQL-Modules. In that example, `Pool` will be constructed once in the application scope.

And we will use `OnResponse` hook to release the client to the pool after we've done with it. See Dependency Injection part of our docs to learn more about hooks.

`DatabaseProvider` will be created on a session level while the instance of `Pool` will be the same instance always in the application level.
`database.provider.ts`
```ts
import { Injectable } from '@graphql-modules/di';
import { SQLStatement } from 'sql-template-strings';
import { Pool, PoolClient } from 'pg';

@Injectable({
    scope: ProviderScope.Session
})
export class DatabaseProvider implements OnResponse {
    private _poolClient: PoolClient;
    constructor(private pool: Pool) {}
    public onResponse() {
        if (this._poolClient) {
            this._poolClient.release();
        }
    }
    async getClient() {
        if (!this.client) {
            this.client = await pool.connect();
        }
        return this.client;
    }
}
```

You can also combine it with data-loaders to solve N+1 problem in SQL queries like below;

`database.provider.ts`

```ts
import { Pool, PoolClient, QueryResultBase, QueryResult } from 'pg';
import { Injectable, ProviderScope } from '@graphql-modules/di';
import { OnResponse } from '@graphql-modules/core';
import { SQLStatement } from 'sql-template-strings';
import DataLoader from 'dataloader';

@Injectable({
  scope: ProviderScope.Session
})
export class DatabaseProvider implements OnResponse {
  private _poolClient: PoolClient;
  constructor(private pool: Pool) {}
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
    if (!this._poolClient) {
      this._poolClient = await this.pool.connect();
    }
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

> That example also uses [sql-template-strings](https://github.com/felixfbecker/node-sql-template-strings) that allows you use ES6 template strings for prepared SQL statements.

Thanks to this approach, you can use transactions inside GraphQL-Modules like below;

`user.entity.ts`

```ts
interface UserEntity {
    id: string;
    name: string;
    // some other fields
}
```

`users.provider.ts`

```ts

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

            // Other processes in a single transaction that uses same client for all session

            await this.databaseProvider.query(SQL`COMMIT`);
        } catch(e) {
            await this.databaseProvider.query(SQL`ROLLBACK`);
            throw e;
        }
    }
}
```
