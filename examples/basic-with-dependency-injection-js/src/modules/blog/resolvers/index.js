const query = require('./query');
const user = require('./user');
const post = require('./post');

module.exports = {
  ...user,
  ...query,
  ...post,
};
