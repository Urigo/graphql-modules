const { Blog } = require('../providers/blog');

module.exports = {
  Query: {
    posts: (root, args, { injector }) => injector.get(Blog).allPosts(),
  },
};
