import { injectable, inject } from '@graphql-modules/core';
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
  constructor(@inject(Users) private users: Users) {}

  getPostsOf(userId: number) {
    return posts.filter(({ authorId }) => userId === authorId);
  }

  allPosts() {
    return posts;
  }

  getAuthor(postId: number) {
    const post = posts.find(({ _id }) => _id === postId);

    if (post) {
      return this.users.getUser(post.authorId);
    }
  }
}
