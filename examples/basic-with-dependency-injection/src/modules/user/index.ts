import { GraphQLModule } from '@graphql-modules/core';
import { Users } from './providers/users';
import gql from 'graphql-tag';
import { QueryResolversHandler } from './resolvers/query';
import { UserResolversHandler } from './resolvers/user';

export const UserModule = new GraphQLModule({
  providers: [Users],
  resolversHandlers: [
    QueryResolversHandler,
    UserResolversHandler,
  ],
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
