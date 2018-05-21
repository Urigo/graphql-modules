export const resolvers = {
  User: {
    id: user => user._id,
  },
  Query: {
    me: (root, args, context) => context.authenticatedUser,
  },
};
