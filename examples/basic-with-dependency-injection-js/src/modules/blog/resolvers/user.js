const { Blog } = require('../providers/blog');

// Example with injector in context

module.exports = {
  User: {
    posts: (user, args, { injector }) => injector.get(Blog).getPostsOf(user._id),
  },
};
