import {GraphQLModule} from '@graphql-modules/core';
import {Blog} from './providers/blog';
import gql from 'graphql-tag';
import resolvers from './resolvers';
import { UserModule } from '../user';
import { PostResolver } from './resolversHandlers/post';

export const BlogModule = new GraphQLModule({
  name: 'Blog',
  imports: [UserModule],
  providers: [Blog],
  resolvers,
  resolverHandlers: [
    PostResolver,
  ],
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
