import { createModule, gql } from 'graphql-modules';

export const AuthModule = createModule({
  id: 'auth',
  dirname: __dirname,
  typeDefs: gql`
    type Query {
      me: User
    }
  `,
  resolvers: {
    Query: {
      me: () => ({
        _id: 1,
        username: 'me',
      }),
    },
  },
});
