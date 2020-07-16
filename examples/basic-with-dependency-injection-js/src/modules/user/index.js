const { createModule, gql } = require('../../../../../dist/graphql-modules/src');
const { Users } = require('./providers/users');
const resolvers = require('./resolvers');
const gql = require('graphql-tag');

module.exports.UserModule = createModule({
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
