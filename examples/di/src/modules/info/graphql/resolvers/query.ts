import { Info } from '../../providers/info';

export const resolvers = {
  Query: {
    version: (_, args, { info }) => {
      return info.get(Info).getVersion();
    },
  },
};
