import { GraphQLApp } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server';

export async function run(app: GraphQLApp) {
  const serverConfig = app.generateServerConfig();
  const server = new ApolloServer(serverConfig);

  const { url } = await server.listen();

  console.log(`Server ready at ${url}`);
}
