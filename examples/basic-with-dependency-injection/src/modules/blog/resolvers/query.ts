import { Blog } from '../providers/blog';

export default {
  Query: {
    posts: (_root: any, _args: {}, { injector }: GraphQLModules.Context) =>
      injector.get(Blog).allPosts(),
  },
};
