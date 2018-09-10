export default {
  User: {
    id: user => user._id,
    username: user => user.username,
  },
};
