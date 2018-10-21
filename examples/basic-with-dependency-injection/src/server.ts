import { GraphQLModule } from '@graphql-modules/core';
import { ApolloServer, Config } from 'apollo-server';

export async function run(app: GraphQLModule<any, any, any>) {
  const { typeDefs, resolvers, schema } = app;
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schema,
    introspection: true,
  });
  const { url } = await server.listen();

  console.log(`Server ready at ${url}`);
}
