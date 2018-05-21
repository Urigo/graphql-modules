import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import {bootstrapModules} from '@graphql-modules/core';
import {UserModule} from './modules/user';
import {SocialNetworkModule} from './modules/social-network';
import {AuthModule} from './modules/auth';

const graphQlModulesApp = bootstrapModules([
  UserModule,
  SocialNetworkModule,
  AuthModule,
]);

const app = express();

app.use('/graphql', graphqlHTTP(async req => ({
  schema: graphQlModulesApp.getSchema(),
  graphiql: true,
  context: await graphQlModulesApp.buildContext(req)
})));

app.listen(4000);
