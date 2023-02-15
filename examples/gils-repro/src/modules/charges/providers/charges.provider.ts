import DataLoader from 'dataloader';
import { Injectable, Scope } from 'graphql-modules';
import { DBProvider } from '../../app-providers/db.provider.js';
import pgQuery from '@pgtyped/query';
import { IGetChargesByIdsQuery } from '../__generated__/charges.types.js';

const { sql } = pgQuery;

const getChargesByIds = sql<IGetChargesByIdsQuery>`
    SELECT *
    FROM accounter_schema.all_transactions
    WHERE id IN $$cahrgeIds;`;

@Injectable({
  scope: Scope.Singleton,
  global: true,
})
export class ChargesProvider {
  constructor(private dbProvider: DBProvider) {}

  private async batchChargesByIds(ids: readonly string[]) {
    const charges = await getChargesByIds.run(
      {
        cahrgeIds: ids,
      },
      this.dbProvider
    );
    return ids.map((id) => charges.find((charge) => charge.id === id));
  }

  public getChargeByIdLoader = new DataLoader(this.batchChargesByIds, {
    cache: false,
  });
}
