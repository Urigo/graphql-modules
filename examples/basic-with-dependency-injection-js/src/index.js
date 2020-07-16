require('reflect-metadata');
const { BlogModule } = require('./modules/blog');
const { UserModule } = require('./modules/user');
const express = require('express');
const graphQLHTTP = require('express-graphql');

const app = createApplication({
  modules: [BlogModule, UserModule],
});

const server = express();

const execute = app.createExecution();

server.use('/graphql', graphQLHTTP({
  schema: AppModule.schema,
  customExecuteFn: execute,
  graphiql: true,
}));

server.listen(4000, () => {
  console.log('Live http://localhost:4000/graphql');
});
