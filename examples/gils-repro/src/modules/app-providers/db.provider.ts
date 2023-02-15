/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Scope } from 'graphql-modules';
import postgres, { QueryResultBase, QueryResultRow } from 'pg';
import 'reflect-metadata';

type TypedQueryResult<Entity> = QueryResultBase & { rows: Entity[] };

@Injectable({
  scope: Scope.Singleton,
  global: true,
})
export class DBProvider {
  constructor(private pool: postgres.Pool) {}

  public async query<Entity extends QueryResultRow>(
    queryStatement: string,
    values?: any[] | undefined
  ): Promise<TypedQueryResult<Entity>> {
    return this.pool.query(queryStatement, values);
  }
}
