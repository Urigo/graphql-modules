import { ApolloServer } from 'apollo-server';
import { ApolloGateway } from '@apollo/gateway';

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'accounts', url: 'http://localhost:4001/graphql' },
    { name: 'reviews', url: 'http://localhost:4002/graphql' },
    { name: 'products', url: 'http://localhost:4003/graphql' },
    { name: 'inventory', url: 'http://localhost:4004/graphql' }
  ]
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: session => session
  });

  server.listen().then(({ url }) => {
    // tslint:disable-next-line: no-console
    console.log(`🚀 Server ready at ${url}`);
  });
})();
