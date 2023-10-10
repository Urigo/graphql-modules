import 'reflect-metadata';
import { createApplication } from 'graphql-modules';
import { BlogModule } from './modules/blog';
import { UserModule } from './modules/user';
import http from 'http';
import { createHandler } from 'graphql-http/lib/use/http';

const app = createApplication({
  modules: [BlogModule, UserModule],
});

// Create the GraphQL over HTTP Node request handler
const handler = createHandler({
  schema: app.schema,
  execute: app.createExecution(),
});

// Create a HTTP server using the listener on `/graphql`
const server = http.createServer((req, res) => {
  if (req.url?.startsWith('/graphql')) {
    handler(req, res);
  } else {
    res.writeHead(404).end();
  }
});

server.listen(4000);
console.log('Listening to port 4000');
