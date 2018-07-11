import { Users } from '../..//implementations/users';

export const resolvers = {
  Query: {
    users: (_, args, { user }) => {
      return user.get(Users).allUsers();
    },
    user: (_, { id }, { user }) => {
        return user.get(Users).getUser(id);
    },
  },
};
