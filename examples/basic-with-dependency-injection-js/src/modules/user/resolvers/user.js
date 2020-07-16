module.exports = {
  User: {
    id: user => user._id,
    username: user => user.username,
  },
};
