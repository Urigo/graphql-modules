import { Blog } from '../../implementations/blog';

export const resolvers = {
    Query: {
      posts: (_, args, { blog }) => {
        return blog.get(Blog).allPosts();
      },
    },
  };
