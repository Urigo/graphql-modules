require('reflect-metadata');
const { AppModule } = require('./modules/app/app.module');
const express = require('express');
const graphQLHTTP = require('express-graphql');

const app = express();

app.use('/graphql', graphQLHTTP({
  schema: AppModule.schema,
  graphiql: true,
}));

app.listen(4000);
