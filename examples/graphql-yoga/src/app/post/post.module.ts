import { createModule, gql } from 'graphql-modules';
import { PostsProvider } from './post.provider';
import { PubSub, PUB_SUB, providePubSub } from './pubsub';

export const PostModule = createModule({
  id: 'post',
  dirname: __dirname,
  providers: [PostsProvider, providePubSub()],
  typeDefs: gql`
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
        subscribe(
          _root: any,
          _args: any,
          { injector }: GraphQLModules.Context
        ) {
          return injector.get<PubSub>(PUB_SUB).subscribe('POST_ADDED');
        },
      },
    },
    Query: {
      posts(_root: any, _args: any, { injector }: GraphQLModules.Context) {
        return injector.get(PostsProvider).getPosts();
      },
    },
    Mutation: {
      addPost(_root: any, args: any, { injector }: GraphQLModules.Context) {
        return injector.get(PostsProvider).addPost(args);
      },
    },
  },
});
