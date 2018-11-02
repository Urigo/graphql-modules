import { ModuleContext } from '@graphql-modules/core';
import { Blog } from '../providers/blog';

export default {
  Query: {
    posts: (root, args, { injector }: ModuleContext) => injector.get(Blog).allPosts(),
  },
};
