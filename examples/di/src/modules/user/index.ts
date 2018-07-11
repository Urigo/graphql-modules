import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Users} from './providers/users';
import {blogModule} from '../blog';

export const userModule = new GraphQLModule({
  name: 'user',
  typeDefs: types,
  resolvers,
  dependencies: () => [blogModule],
  providers: [Users],
});
