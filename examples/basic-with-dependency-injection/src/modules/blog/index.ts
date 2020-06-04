import { createModule, gql } from 'graphql-modules';
import { Blog } from './providers/blog';
import resolvers from './resolvers';
import { Users } from '../user/providers/users';

export const BlogModule = createModule({
  id: 'blog',
  dirname: __dirname,
  providers: [Blog, Users],
  resolvers,
  typeDefs: gql`
    extend type Query {
      posts: [Post]
    }

    type Post {
      id: String
      title: String
      author: User
    }

    extend type User {
      posts: [Post]
    }
  `,
});
