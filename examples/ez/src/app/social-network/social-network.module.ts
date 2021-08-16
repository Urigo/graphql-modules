import { createModule, gql } from 'graphql-modules';

export const SocialNetworkModule = createModule({
  id: 'social-network',
  typeDefs: gql`
    extend type User {
      friends: [User]
    }
  `,
  resolvers: {
    User: {
      friends: (user: any) => user.friends,
    },
  },
});
