import 'reflect-metadata';
import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';
import { useGraphQLModules } from '@envelop/graphql-modules';
import { app } from './app';

const yoga = createYoga({
  plugins: [useGraphQLModules(app)],
});

const server = createServer(yoga);

server.listen(4000, () => {
  // tslint:disable-next-line: no-console
  console.info(`🚀 Server ready at http://localhost:4000/graphql`);
});
