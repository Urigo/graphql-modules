import { GraphQLModule } from '@graphql-modules/core';
import { Request } from 'express';
import gql from 'graphql-tag';
import { userModule } from '../user/user.module';

export const authModule = new GraphQLModule({
  name: 'auth',
  modules: ['user'],
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
      id: user => user._id,
    },
    Query: {
      me: (root, args, context) => context.authenticatedUser,
    },
  },
  contextBuilder: (req: Request) => ({
    authenticatedUser: {
      _id: 1,
      username: 'me',
    },
  }),
});
