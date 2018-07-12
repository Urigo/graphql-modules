import { injectable, inject, CommunicationBridge } from '@graphql-modules/core';
import { Users } from '../../user/providers/users';

const posts = [
  {
    _id: 0,
    authorId: 0,
    title: 'Title 1',
  },
  {
    _id: 1,
    authorId: 1,
    title: 'Title 2',
  },
  {
    _id: 2,
    authorId: 0,
    title: 'Title 3',
  },
];

@injectable()
export class Blog {
  constructor(
    @inject(Users) private users: Users,
    @inject(CommunicationBridge) private communicationBridge: CommunicationBridge,
  ) {
    // TODO: make it initialized at runtime
    console.log(users);
  }

  getPostsOf(userId: number) {
    this.notify();
    return posts.filter(({ authorId }) => userId === authorId);
  }

  allPosts() {
    this.notify();
    return posts;
  }

  getAuthor(postId: number) {
    const post = posts.find(({ _id }) => _id === postId);

    if (post) {
      return this.users.getUser(post.authorId);
    }
  }

  notify() {
    this.communicationBridge.publish('ASKED_FOR_POST', null);
  }
}
