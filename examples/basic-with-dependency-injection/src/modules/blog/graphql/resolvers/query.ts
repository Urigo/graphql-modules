import { Blog } from '../../providers/blog';

export const resolvers = {
  Query: {
    posts: (_, args, { injector }) => {
      return injector.get(Blog).allPosts();
    },
  },
};
