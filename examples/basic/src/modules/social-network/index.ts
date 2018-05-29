import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';

export const socialNetworkModule = new GraphQLModule({
  name: 'socialNetwork',
  typeDefs: types,
  resolvers,
});
