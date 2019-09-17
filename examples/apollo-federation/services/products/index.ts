import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { GraphQLModule } from '@graphql-modules/core';

const ProductsModule = new GraphQLModule({
  name: 'ProductsModule',
  typeDefs: gql`
    extend type Query {
      topProducts(first: Int = 5): [Product]
    }

    type Product @key(fields: "upc") {
      upc: String!
      name: String
      price: Int
      weight: Int
    }
  `,
  resolvers: {
    Product: {
      __resolveReference(object) {
        return products.find(product => product.upc === object.upc);
      }
    },
    Query: {
      topProducts(_, args) {
        return products.slice(0, args.first);
      }
    }
  }
});

const server = new ApolloServer({
  schema: buildFederatedSchema([ProductsModule]),
  context: session => session
});

server.listen({ port: 4003 }).then(({ url }) => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at ${url}`);
});

const products = [
  {
    upc: '1',
    name: 'Table',
    price: 899,
    weight: 100
  },
  {
    upc: '2',
    name: 'Couch',
    price: 1299,
    weight: 1000
  },
  {
    upc: '3',
    name: 'Chair',
    price: 54,
    weight: 50
  }
];
