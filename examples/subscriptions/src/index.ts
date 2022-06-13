import 'reflect-metadata';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { app } from './app';

const WS_PORT = 5000;

// Create WebSocket listener server
const websocketServer = createServer((_request, response) => {
  response.writeHead(404);
  response.end();
});

// Bind it to port and start listening
websocketServer.listen(WS_PORT, () => {
  console.log(`Live http://localhost:${WS_PORT}/graphql`);
});
const wsServer = new WebSocketServer({
  port: 4000,
  path: '/graphql',
});

const schema = app.schema;
const execute = app.createExecution();
const subscribe = app.createSubscription();

useServer(
  {
    schema,
    execute,
    subscribe,
  },
  wsServer
);
