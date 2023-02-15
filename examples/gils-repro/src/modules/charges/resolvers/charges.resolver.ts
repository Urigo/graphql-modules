import { ChargesModule } from '../__generated__/types.js';
import { ChargesProvider } from '../providers/charges.provider.js';

export const chargesResolvers: ChargesModule.Resolvers = {
  Query: {
    chargeById: async (_, { id }, { injector }) => {
      const dbCharge = await injector
        .get(ChargesProvider)
        .getChargeByIdLoader.load(id);
      if (!dbCharge) {
        throw new Error(`Charge ID="${id}" not found`);
      }
      return dbCharge;
    },
  },
  Charge: {
    id: (DbCharge) => DbCharge.id,
  },
};
