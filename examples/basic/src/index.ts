declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      request: any;
    }
  }
}

import 'reflect-metadata';
import { createApplication } from 'graphql-modules';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
import { SocialNetworkModule } from './app/social-network/social-network.module';

const server = express();
const app = createApplication({
  modules: [UserModule, AuthModule, SocialNetworkModule],
  executionContext: false,
});
const execute = app.createExecution();

server.use(
  '/graphql',
  graphqlHTTP((request: any) => ({
    schema: app.schema,
    graphiql: true,
    customExecuteFn: execute as any,
    context: { request },
  }))
);

server.listen(4000, () => {
  console.log('Live http://localhost:4000/graphql');
});
