import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'graphql-subscriptions';
import { CommonModule } from '../common/common.module';
import { PostsProvider } from './post.provider';

export const PostModule = new GraphQLModule({
  imports: [CommonModule],
  providers: [PostsProvider],
  typeDefs: `
      type Subscription {
        postAdded: Post
      }

      type Query {
        posts: [Post]
      }

      type Mutation {
        addPost(author: String, comment: String): Post
      }

      type Post {
        author: String
        comment: String
      }
  `,
  resolvers: {
    Subscription: {
      postAdded: {
        // Additional event labels can be passed to asyncIterator creation
        subscribe: (root, args, { injector }) => injector.get(PubSub).asyncIterator(['POST_ADDED'])
      }
    },
    Query: {
      posts: (root, args, { injector }) => injector.get(PostsProvider).getPosts()
    },
    Mutation: {
      addPost: (root, args, { injector }) => {
        return injector.get(PostsProvider).addPost(args);
      }
    }
  }
});
