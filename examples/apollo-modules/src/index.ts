import 'reflect-metadata';
import { concatAST } from 'graphql';
import { app } from './app';
import { ApolloServer } from 'apollo-server';

const executor = app.__createApolloExecutor();

const server = new ApolloServer({
  modules: [{ typeDefs: concatAST(app.typeDefs), resolvers: app.resolvers }],
  executor,
});

server.listen(4000, () => {
  console.log('Live http://localhost:4000');
});
