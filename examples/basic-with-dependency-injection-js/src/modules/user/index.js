const { GraphQLModule } = require('@graphql-modules/core');
const { Users } = require('./providers/users');
const resolvers = require('./resolvers');
const gql = require('graphql-tag');

module.exports.UserModule = new GraphQLModule({
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
