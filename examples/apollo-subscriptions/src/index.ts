import 'reflect-metadata';
import * as express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { AppModule } from './app/app.module';

const { schema, subscriptions } = AppModule;

const server = new ApolloServer({
  schema,
  context: session => session,
  subscriptions
});

const app = express();
server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 4000 }, () => {
  // tslint:disable-next-line: no-console
  console.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  // tslint:disable-next-line: no-console
  console.info(`🚀 Subsciription ready at ws://localhost:4000${server.subscriptionsPath}`);
});
