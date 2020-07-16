const { Injectable, Inject } = require('@graphql-modules/di');
const { Users } = require('../../user/providers/users');

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

class Blog {
  constructor(users) {
    this.users = users
  }

  getPostsOf(userId) {
    return posts.filter(({ authorId }) => userId === authorId);
  }

  allPosts() {
    return posts;
  }

  getAuthor(postId) {
    const post = posts.find(({ _id }) => _id === postId);

    if (post) {
      return this.users.getUser(post.authorId);
    }
  }
}

Inject(Users)(Blog, undefined, 0)

module.exports.Blog = Injectable()(Blog)
