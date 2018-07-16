import { Users } from '../../providers/users';

export const resolvers = {
  Query: {
    users: (_, args, { get }) => {
      return get(Users).allUsers();
    },
    user: (_, { id }, { get }) => {
        return get(Users).getUser(id);
    },
  },
};
