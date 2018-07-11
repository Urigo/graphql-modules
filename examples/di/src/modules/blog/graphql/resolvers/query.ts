import { Blog } from '../../implementations/blog';

export const resolvers = {
    Query: {
      posts: (_, args, { container }) => {
        return container.get(Blog).allPosts();
      },
    },
  };
