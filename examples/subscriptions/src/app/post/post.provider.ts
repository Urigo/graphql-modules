import { Injectable } from '@graphql-modules/di';
import { PubSub } from 'graphql-subscriptions';

export interface Post {
  author: string;
  comment: string;
}

@Injectable()
export class PostsProvider {
  posts: Post[] = [];
  constructor(private pubSub: PubSub) {}
  getPosts() {
    return this.posts;
  }
  addPost(post: Post) {
    this.posts.push(post);
    this.pubSub.publish('POST_ADDED', { postAdded: post });
  }
}
