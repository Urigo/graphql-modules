import 'reflect-metadata';
import { createServer } from '@graphql-yoga/node';
import { useGraphQLModules } from '@envelop/graphql-modules';
import { app } from './app';

const server = createServer({
  plugins: [useGraphQLModules(app)],
});

server.start().then(() => {
  // tslint:disable-next-line: no-console
  console.info(`🚀 Server ready at http://localhost:4000/graphql`);
});
