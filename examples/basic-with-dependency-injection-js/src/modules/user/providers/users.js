const { Injectable } = require('@graphql-modules/di');

const users = [{
  _id: 0,
  username: 'Sample User',
}];

class Users {
  getUser(id) {
    return users.find(({ _id }) => _id === id);
  }

  allUsers() {
    return users;
  }
}

module.exports.Users = Injectable()(Users)