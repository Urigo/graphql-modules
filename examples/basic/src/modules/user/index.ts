import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';

export const userModule = new GraphQLModule({
  name: 'user',
  typeDefs: types,
  resolvers,
});
