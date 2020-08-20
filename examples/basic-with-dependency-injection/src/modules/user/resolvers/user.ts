export default {
  User: {
    id: (user: any) => user._id,
    username: (user: any) => user.username,
  },
};
