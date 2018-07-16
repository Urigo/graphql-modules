import { Users } from '../../providers/users';

export const resolvers = {
  Query: {
    users: (_, args, { get }) => {
      return get(Users).allUsers();
    },
    user: (_, { id }, { injector }) => {
        return injector.get(Users).getUser(id);
    },
  },
};
