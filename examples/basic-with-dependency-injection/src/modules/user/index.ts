import { createModule, gql } from 'graphql-modules';
import { Users } from './providers/users';
import resolvers from './resolvers';

export const UserModule = createModule({
  id: 'user',
  dirname: __dirname,
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
