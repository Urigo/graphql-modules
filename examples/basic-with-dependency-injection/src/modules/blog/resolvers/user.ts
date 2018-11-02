import { Blog } from '../providers/blog';
import { ModuleContext } from '@graphql-modules/core';

// Example with injector in context

export default {
  User: {
    posts: (user, args, { injector }: ModuleContext) => injector.get(Blog).getPostsOf(user._id),
  },
};
