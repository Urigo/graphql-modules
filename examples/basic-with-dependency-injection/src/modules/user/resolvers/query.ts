import { Users } from '../providers/users';
import { InjectFn } from '@graphql-modules/core';

export default {
  Query: {
    users: InjectFn((users: Users) => users.allUsers(), Users),
    user: InjectFn((users: Users, _, { id }) => users.getUser(id), Users),
  },
};
