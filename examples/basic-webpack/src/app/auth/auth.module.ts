import { GraphQLModule } from '@graphql-modules/core';
import { Request } from 'express';
import gql from 'graphql-tag';
import { UserModule } from '../user/user.module';

export const AuthModule = new GraphQLModule({
  typeDefs: gql`
    type Query {
      me: User
    }

    type User {
      id: String
    }
  `,
  resolvers: {
    User: {
      id: user => user._id
    },
    Query: {
      me: (root, args, context) => context.authenticatedUser
    }
  },
  imports: [UserModule],
  context: async (session: Request) => {
    const authHeader = session.headers.authorization;
    return {
      authenticatedUser: {
        _id: 1,
        username: 'me'
      }
    };
  }
});
