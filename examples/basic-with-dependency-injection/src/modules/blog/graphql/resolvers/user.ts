import { Blog } from '../../providers/blog';

export default {
  User: {
    posts: (user, args, { injector }) => {
      return injector.get(Blog).getPostsOf(user._id);
    },
  }
}
