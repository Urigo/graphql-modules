import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export const UserModule = new GraphQLModule({
  name: 'User',
  typeDefs: gql`
    type User {
      id: String
      username: String
    }
  `,
  resolvers: {
    User: {
      id: user => user._id,
      username: user => user.username,
    },
  },
});
