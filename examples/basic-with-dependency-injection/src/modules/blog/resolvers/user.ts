import { Blog } from '../providers/blog';
import { AppContext } from '@graphql-modules/core';

export default {
  User: {
    posts: (user, args, { injector }: AppContext) =>
      injector.get(Blog).getPostsOf(user._id),
  },
};
