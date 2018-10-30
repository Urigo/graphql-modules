import { Blog } from '../providers/blog';
import { injectFn } from '@graphql-modules/core';

export default {
  Query: {
    posts: injectFn((blog: Blog) => blog.allPosts(), Blog),
  },
};
