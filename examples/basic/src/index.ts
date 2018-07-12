import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { userModule } from './modules/user';
import { socialNetworkModule } from './modules/social-network';
import { authModule } from './modules/auth';
import { GraphQLApp } from '@graphql-modules/core';

async function run() {
  const gqlApp = new GraphQLApp({
    modules: [
      userModule,
      socialNetworkModule,
      authModule,
    ],
  });

  await gqlApp.init();

  const app = express();

  app.use('/graphql', graphqlHTTP(async req => ({
    schema: gqlApp.schema,
    graphiql: true,
    context: await gqlApp.buildContext(req),
  })));

  app.listen(4000, () => {
    console.log('Visit http://localhost:4000/graphql');
  });
}

run();
