import { Users } from '../..//implementations/users';

export const resolvers = {
  Query: {
    users: (_, args, { container }) => {
      return container.get(Users).allUsers();
    },
    user: (_, { id }, { container }) => {
        return container.get(Users).getUser(id);
    },
  },
};
