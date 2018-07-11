import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Users} from './implementations/users';

export const userModule = new GraphQLModule({
  name: 'user',
  typeDefs: types,
  resolvers,
  dependencies: ['blog'],
  providers: [Users],
});
