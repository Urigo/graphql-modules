import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export const socialNetworkModule = new GraphQLModule({
  name: 'socialNetwork',
  typeDefs: gql`
    type User {
      friends: [User]
    }
  `,
  dependencies: ['user'],
  resolvers: {
    User: {
      friends: user => user.friends,
    },
  },
});
