import { Users } from '../providers/users';
import { ResolversHandler } from '@graphql-modules/core';

@ResolversHandler('Query')
export class QueryResolversHandler {
  constructor(private _users: Users) {}
  users() {
    return this._users.allUsers();
  }
  user(_, { id }) {
    return this._users.getUser(id);
  }
}
