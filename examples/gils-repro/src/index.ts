import { createServer } from 'node:http';
import { config } from 'dotenv';
import { createYoga } from 'graphql-yoga';
import 'reflect-metadata';
import { useGraphQLModules } from '@envelop/graphql-modules';
import { createGraphQLApp } from './modules-app.js';

config();

async function main() {
  const application = await createGraphQLApp();
  const yoga = createYoga({ plugins: [useGraphQLModules(application)] });
  const server = createServer(yoga);

  server.listen(
    {
      port: 4000,
    },
    () => {
      console.log('GraphQL API located at http://localhost:4000/graphql');
    }
  );
}

main();
