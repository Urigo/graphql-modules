import { Users } from '../providers/users';
import { AppContext } from '@graphql-modules/core';

export default {
  Query: {
    users: (_, args, { injector }: AppContext) =>
      injector.get<Users>(Users).allUsers(),
    user: (_, { id }, { injector }: AppContext) =>
      injector.get<Users>(Users).getUser(id),
  },
};
