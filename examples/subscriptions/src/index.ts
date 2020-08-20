import 'reflect-metadata';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { app } from './app';

const WS_PORT = 5000;

const schema = app.schema;
const execute = app.createExecution();
const subscribe = app.createSubscription();

// Create WebSocket listener server
const websocketServer = createServer((_request, response) => {
  response.writeHead(404);
  response.end();
});

// Bind it to port and start listening
websocketServer.listen(WS_PORT, () => {
  console.log(`Live http://localhost:${WS_PORT}/graphql`);
});

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server: websocketServer,
    path: '/graphql',
  }
);
