import { GraphQLModule } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server';

export async function bootstrap(AppModule: GraphQLModule) {
  const { schema, context } = AppModule;
  const server = new ApolloServer({
    schema,
    context,
    introspection: true,
  });
  const { url } = await server.listen();

  console.log(`Server ready at ${url}`);
}
