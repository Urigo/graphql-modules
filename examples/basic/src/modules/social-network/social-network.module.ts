import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
import { userModule } from '../user/user.module';

export const socialNetworkModule = new GraphQLModule({
  name: 'socialNetwork',
  typeDefs: gql`
    type User {
      friends: [User]
    }
  `,
  modules: ['user'],
  resolvers: {
    User: {
      friends: user => user.friends,
    },
  },
});
