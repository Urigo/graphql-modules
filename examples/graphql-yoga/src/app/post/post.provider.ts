import { Injectable, Inject } from 'graphql-modules';
import { PUB_SUB, PubSub } from './pubsub';
import { Post } from './types';

@Injectable()
export class PostsProvider {
  posts: Post[] = [];

  constructor(@Inject(PUB_SUB) private pubSub: PubSub) {}

  getPosts() {
    return this.posts;
  }

  addPost(post: Post) {
    this.posts.push(post);
    this.pubSub.publish('POST_ADDED', { postAdded: post });
    return post;
  }
}
