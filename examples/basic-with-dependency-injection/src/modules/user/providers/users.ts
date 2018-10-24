import { injectable } from '@graphql-modules/core';

const users = [{
  _id: 0,
  username: 'Sample User',
}];

@injectable()
export class Users {
  getUser(id: number) {
    return users.find(({ _id }) => _id === id);
  }

  allUsers() {
    return users;
  }
}
