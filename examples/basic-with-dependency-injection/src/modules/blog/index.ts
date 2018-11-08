import {GraphQLModule} from '@graphql-modules/core';
import {Blog} from './providers/blog';
import gql from 'graphql-tag';
import { UserModule } from '../user';
import { PostResolversHandler } from './resolvers/post';
import { QueryResolversHandler } from './resolvers/query';
import { UserResolversHandler } from './resolvers/user';

export const BlogModule = new GraphQLModule({
  imports: [UserModule],
  providers: [Blog],
  resolversHandlers: [
    PostResolversHandler,
    QueryResolversHandler,
    UserResolversHandler,
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
