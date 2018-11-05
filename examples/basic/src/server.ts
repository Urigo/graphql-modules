import { GraphQLModule } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server';

export async function bootstrap({ schema, context }: GraphQLModule<any, any, any>) {

  const server = new ApolloServer({
    schema,
    context,
    introspection: true,
  });

  const { url } = await server.listen();

  console.log(`Server ready at ${url}`);
}
