import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { graphqlApplication } from './app';

const { createSchemaForApollo } = graphqlApplication;
const schema = createSchemaForApollo();

const server = new ApolloServer({
  schema,
});

const app = express();
server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 4000 }, () => {
  // tslint:disable-next-line: no-console
  console.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  // tslint:disable-next-line: no-console
  console.info(
    `🚀 Subsciription ready at ws://localhost:4000${server.subscriptionsPath}`
  );
});
