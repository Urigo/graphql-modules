import { Blog } from '../providers/blog';
import { injectFn } from '@graphql-modules/core';

export default {
  User: {
    posts: injectFn((blog: Blog, user) => blog.getPostsOf(user._id), Blog),
  },
};
