const query = require('./query');
const user = require('./user');

module.exports = {
  ...query,
  ...user,
};
