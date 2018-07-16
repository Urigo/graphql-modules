import { Blog } from '../../providers/blog';

export const resolvers = {
    Query: {
      posts: (_, args, { get }) => {
        return get(Blog).allPosts();
      },
    },
  };
