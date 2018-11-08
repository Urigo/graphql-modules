import { ResolversHandler } from '@graphql-modules/core';
import { Blog } from '../providers/blog';

@ResolversHandler('User')
export class UserResolversHandler {
  constructor(private blog: Blog) {}
  posts(user) {
    return this.blog.getPostsOf(user._id);
  }
}
