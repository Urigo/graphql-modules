import { Blog } from '../../../blog/providers/blog';

export const resolvers = {
  User: {
    id: user => user._id,
    username: user => user.username,
    posts: (user, args, { injector }) => {
      return injector.get(Blog).getPostsOf(user._id);
    },
  },
};
