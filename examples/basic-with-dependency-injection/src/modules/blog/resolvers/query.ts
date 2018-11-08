import { ResolversHandler } from '@graphql-modules/core';
import { Blog } from '../providers/blog';

@ResolversHandler('Query')
export class QueryResolversHandler {
  constructor(private blog: Blog) {}
  posts() {
    return this.blog.allPosts();
  }
}
