import { Users } from '../providers/users';
import { ModuleContext } from '@graphql-modules/core';

export default {
  Query: {
    users: (root, args, {injector}: ModuleContext) => injector.get(Users).allUsers(),
    user: (root, { id }, {injector}: ModuleContext) => injector.get(Users).getUser(id),
  },
};
