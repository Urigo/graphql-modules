import { GraphQLApp } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server';

export async function run(app: GraphQLApp) {
  const server = new ApolloServer({
    schema: app.schema,
    context: ({ req }) => app.buildContext(req),
  });

  const { url } = await server.listen();
  console.log(`Server ready at ${url}`);
}
