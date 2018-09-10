import { Blog } from '../providers/blog';
import { AppContext } from '@graphql-modules/core';

export default {
  Query: {
    posts: (_, args, { injector }: AppContext) =>
      injector.get(Blog).allPosts(),
  },
};
