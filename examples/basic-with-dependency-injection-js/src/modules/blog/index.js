const { GraphQLModule } = require('@graphql-modules/core');
const { Blog } = require('./providers/blog');
const gql = require('graphql-tag');
const resolvers = require('./resolvers');
const { UserModule } = require('../user');

module.exports.BlogModule = new GraphQLModule({
  imports: [UserModule],
  providers: [Blog],
  resolvers,
  typeDefs: gql`
    type Query {
      posts: [Post]
    }

    type Post {
      id: String
      title: String
      author: User
    }

    type User {
      posts: [Post]
    }
  `,
});
