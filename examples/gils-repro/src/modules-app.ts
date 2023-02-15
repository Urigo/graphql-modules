import { createApplication } from 'graphql-modules';
import { DBProvider } from './modules/app-providers/db.provider.js';
import postgres from 'pg';
import { chargesModule } from './modules/charges/index.js';
import { commonModule } from './modules/common/index.js';

const { Pool } = postgres;

export async function createGraphQLApp() {
  return createApplication({
    modules: [commonModule, chargesModule],
    providers: () => [
      {
        provide: Pool,
        useFactory: () =>
          new Pool({
            connectionString: process.env.PGURI,
            ssl: {
              rejectUnauthorized: false,
            },
          }),
      },
      DBProvider,
    ],
  });
}
