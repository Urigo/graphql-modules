import 'reflect-metadata';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { AppModule } from './app/app.module';

const WS_PORT = 5000;

// Create WebSocket listener server
const websocketServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

// Bind it to port and start listening
websocketServer.listen(WS_PORT);

const subscriptionServer = SubscriptionServer.create(
  {
    schema: AppModule.schema,
    execute,
    subscribe,
    ...AppModule.subscriptions
  },
  {
    server: websocketServer,
    path: '/graphql'
  }
);
