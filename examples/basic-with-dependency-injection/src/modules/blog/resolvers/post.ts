import { ResolversHandler } from '@graphql-modules/core';
import { Blog } from '../providers/blog';

@ResolversHandler('Post')
export class PostResolversHandler {
  constructor(private blog: Blog) {}
  id(post) {
    return post._id;
  }
  title(post) {
    return post.title;
  }
  author(post) {
    return this.blog.getAuthor(post.authorId);
  }
}
