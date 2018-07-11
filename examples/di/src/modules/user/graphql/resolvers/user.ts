import { Blog } from '../../../blog/implementations/blog';

export const resolvers = {
  User: {
    id: user => user._id,
    username: user => user.username,
    posts: (user, args, { container }) => {
      return container.get(Blog).getPostsOf(user._id);
    },
  },
};
