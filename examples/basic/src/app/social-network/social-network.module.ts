import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
import { UserModule } from '../user/user.module';

export const SocialNetworkModule = new GraphQLModule({
  typeDefs: gql`
    type User {
      friends: [User]
    }
  `,
  resolvers: {
    User: {
      friends: user => user.friends,
    },
  },
  imports: [
    UserModule,
  ],
});
