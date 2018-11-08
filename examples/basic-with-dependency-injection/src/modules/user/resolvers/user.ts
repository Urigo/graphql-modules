import { ResolversHandler } from '@graphql-modules/core';

@ResolversHandler('User')
export class UserResolversHandler {
  id(user) {
    return user._id;
  }
  username(user) {
    return user.username;
  }
}
