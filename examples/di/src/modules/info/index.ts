import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Info} from './providers/info';

export const infoModule = new GraphQLModule({
  name: 'info',
  typeDefs: types,
  resolvers,
  providers: [Info],
});
