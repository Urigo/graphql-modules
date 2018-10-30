import { Blog } from '../providers/blog';
import { injectFn } from '@graphql-modules/core';

export default {
  Post: {
    id: post => post._id,
    title: post => post.title,
    author: injectFn((blog: Blog, post) => blog.getAuthor(post.authorId), Blog),
  },
};
