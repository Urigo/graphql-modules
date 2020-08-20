import { createModule, gql } from 'graphql-modules';

export const UserModule = createModule({
  id: 'user',
  dirname: __dirname,
  typeDefs: gql`
    type User {
      id: String
      username: String
    }
  `,
  resolvers: {
    User: {
      id: (user: any) => user._id,
      username: (user: any) => user.username,
    },
  },
});
