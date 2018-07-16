import { Info } from '../../providers/info';

export const resolvers = {
  Query: {
    version: (_, args, { get }) => {
      return get(Info).getVersion();
    },
  },
};
