import { GraphQLModule } from '@graphql-modules/core';
import { Users } from './providers/users';
import resolvers from './resolvers';
import gql from 'graphql-tag';

export const UserModule = new GraphQLModule({
  providers: [Users],
  resolvers,
  typeDefs: gql`
    type User {
      id: String
      username: String
    }

    type Query {
      users: [User]
      user(id: Int!): User
    }
  `,
});
