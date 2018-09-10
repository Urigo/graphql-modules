import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Users} from './providers/users';

export const userModule = new GraphQLModule({
  name: 'user',
  typeDefs: types,
  resolvers,
  providers: [Users],
});
