import { Users } from '../providers/users';
import { AppContext } from '@graphql-modules/core';

export default {
  Query: {
    users: (root, args, {injector}: AppContext) => injector.get(Users).allUsers(),
    user: (root, { id }, {injector}: AppContext) => injector.get(Users).getUser(id),
  },
};
