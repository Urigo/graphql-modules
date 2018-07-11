import { Users } from '../../../user/implementations/users';

export const resolvers = {
    Post: {
      id: post => post._id,
      title: post => post.title,
      author: (post, args, { user }) => {
        return user.get(Users).getUser(post.authorId);
      },
    },
  };
