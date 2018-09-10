import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Blog} from './providers/blog';
import {userModule} from '../user';

export const blogModule = new GraphQLModule({
  name: 'blog',
  typeDefs: types,
  resolvers,
  dependencies: () => [userModule],
  providers: [Blog],
});
