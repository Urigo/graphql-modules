import 'reflect-metadata';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLApp } from '@graphql-modules/core';
import { userModule } from './modules/user';
import { blogModule } from './modules/blog';

const gqlApp = new GraphQLApp({
  modules: [
    userModule,
    blogModule,
  ],
});

const app = express();

app.use('/graphql', graphqlHTTP(async req => ({
  schema: gqlApp.schema,
  graphiql: true,
  context: await gqlApp.buildContext(req),
})));

app.listen(4000, () => {
  console.log(`Server ready at http://localhost:4000`);
});
