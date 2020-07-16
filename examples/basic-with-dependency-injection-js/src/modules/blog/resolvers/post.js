const { Blog } = require('../providers/blog');

module.exports = {
  Post: {
    id: post => post._id,
    title: post => post.title,
    author: (post, args, { injector }) => injector.get(Blog).getAuthor(post.authorId),
  },
};
