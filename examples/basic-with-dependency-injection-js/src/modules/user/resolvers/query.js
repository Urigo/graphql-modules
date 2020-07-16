const { Users } = require('../providers/users');

module.exports = {
  Query: {
    users: (root, args, { injector }) => injector.get(Users).allUsers(),
    user: (root, { id }, { injector }) => injector.get(Users).getUser(id),
  },
};
