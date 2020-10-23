import 'reflect-metadata';
import { createApplication } from 'graphql-modules';
import { BlogModule } from './modules/blog';
import { UserModule } from './modules/user';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';

const app = createApplication({
  modules: [BlogModule, UserModule],
});

const server = express();

const execute = app.createExecution();

server.use(
  '/graphql',
  graphqlHTTP({
    schema: app.schema,
    customExecuteFn: execute as any,
    graphiql: true,
  })
);

server.listen(4000, () => {
  console.log('Live http://localhost:4000/graphql');
});
