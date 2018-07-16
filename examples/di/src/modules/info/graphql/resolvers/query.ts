import { Info } from '../../providers/info';

export const resolvers = {
  Query: {
    version: (_, args, { injector }) => {
      return injector.get(Info).getVersion();
    },
  },
};
