const { createModule, gql } = require('../../../../../dist/graphql-modules/src');
const { Blog } = require('./providers/blog');
const resolvers = require('./resolvers');
const { UserModule } = require('../user');

module.exports.BlogModule = createModule({
  id: 'blog',
  dirname: __dirname,
  providers: [Blog, Users],
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
