import {GraphQLModule} from '@graphql-modules/core';
import {Blog} from './providers/blog';
import gql from 'graphql-tag';
import resolvers from './resolvers';
import { UserModule } from '@modules/user';

export const BlogModule = new GraphQLModule({
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
