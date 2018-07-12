import { GraphQLModule } from '@graphql-modules/core';
import { resolvers, types } from './schema';
import { contextBuilder } from './context-builder';

export const authModule = new GraphQLModule({
  name: 'auth',
  typeDefs: types,
  resolvers,
  dependencies: ['user'],
  contextBuilder,
});
