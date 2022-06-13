import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { graphqlApplication } from './app';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

const { schema, createExecution, createSubscription, createApolloExecutor } =
  graphqlApplication;

const executor = createApolloExecutor();

const app = express();
const httpServer = createServer(app);
// Creating the WebSocket subscription server

const server = new ApolloServer({
  schema,
  executor,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

server.applyMiddleware({ app });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: server.graphqlPath,
});

const execute = createExecution();
const subscribe = createSubscription();

// Passing in an instance of a GraphQLSchema and
// telling the WebSocketServer to start listening
const serverCleanup = useServer({ schema, execute, subscribe }, wsServer);

httpServer.listen({ port: 4000 }, () => {
  // tslint:disable-next-line: no-console
  console.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});
