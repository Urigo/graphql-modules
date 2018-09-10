export const resolvers = {
  User: {
    id: user => user._id,
    username: user => user.username,
  },
};
