import { GraphQLApp } from '@graphql-modules/core';
import { ApolloServer, Config } from 'apollo-server';

export async function run(app: GraphQLApp) {
  const serverConfig = app.generateServerConfig<Config>({
    introspection: true,
  });
  const server = new ApolloServer(serverConfig);
  const { url } = await server.listen();

  console.log(`Server ready at ${url}`);
}
