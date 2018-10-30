import { Users } from '../providers/users';
import { injectFn } from '@graphql-modules/core';

export default {
  Query: {
    users: injectFn((users: Users) => users.allUsers(), Users),
    user: injectFn((users: Users, _, { id }) => users.getUser(id), Users),
  },
};
