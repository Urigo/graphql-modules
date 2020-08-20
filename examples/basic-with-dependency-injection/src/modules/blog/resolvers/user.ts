import { Blog } from '../providers/blog';

// Example with injector in context

export default {
  User: {
    posts: (user: any, _args: {}, { injector }: GraphQLModules.Context) =>
      injector.get(Blog).getPostsOf(user._id),
  },
};
