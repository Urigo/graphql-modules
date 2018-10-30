import { ResolversHandler } from '@graphql-modules/core';
import { Blog } from '../providers/blog';

// Example for ResolversHandler

@ResolversHandler('Post')
export class PostResolver {

  constructor(private blog: Blog) { }

  id(post) {
    return post._id;
  }
  title(post) {
    return post.title;
  }
  author(post) {
    this.blog.getAuthor(post.authorId);
  }

}
