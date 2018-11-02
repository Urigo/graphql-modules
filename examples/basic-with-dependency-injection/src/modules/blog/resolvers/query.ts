import { AppContext } from '@graphql-modules/core';
import { Blog } from '../providers/blog';

export default {
  Query: {
    posts: (root, args, { injector }: AppContext) => injector.get(Blog).allPosts(),
  },
};
