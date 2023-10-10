import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { graphqlApplication } from './app';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import bodyParser from 'body-parser';
import cors from 'cors';

const { schema, createExecution, createSubscription, createApolloGateway } =
  graphqlApplication;

const gateway = createApolloGateway();

const app = express();
const httpServer = createServer(app);
// Creating the WebSocket subscription server

const server = new ApolloServer({
  gateway,
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

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const execute = createExecution();
const subscribe = createSubscription();

// Passing in an instance of a GraphQLSchema and
// telling the WebSocketServer to start listening
const serverCleanup = useServer({ schema, execute, subscribe }, wsServer);

async function main() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server)
  );

  httpServer.listen({ port: 4000 }, () => {
    // tslint:disable-next-line: no-console
    console.info(`🚀 Server ready at http://localhost:4000/graphql`);
  });
}

main().catch((error) => {
  // tslint:disable-next-line: no-console
  console.error(error);
  process.exit(1);
});
