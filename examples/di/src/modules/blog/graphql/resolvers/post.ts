import { Users } from '../../../user/implementations/users';

export const resolvers = {
    Post: {
      id: post => post._id,
      title: post => post.title,
      author: (post, args, { container }) => {
        return container.get(Users).getUser(post.authorId);
      },
    },
  };
