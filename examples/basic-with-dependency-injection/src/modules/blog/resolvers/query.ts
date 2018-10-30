import { Blog } from '../providers/blog';
import { InjectFn } from '@graphql-modules/core';

// Example for InjectFn

export default {
  Query: {
    posts: InjectFn((blog: Blog) => blog.allPosts(), Blog),
  },
};
