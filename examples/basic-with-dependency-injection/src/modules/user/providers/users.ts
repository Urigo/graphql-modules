import { Injectable } from '@graphql-modules/di';

const users = [{
  _id: 0,
  username: 'Sample User',
}];

@Injectable()
export class Users {
  getUser(id: number) {
    return users.find(({ _id }) => _id === id);
  }

  allUsers() {
    return users;
  }
}
