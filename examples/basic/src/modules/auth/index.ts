import { GraphQLModule } from '@graphql-modules/core';
import { resolvers, types } from './schema';
import { Request } from 'express';
import { contextBuilder } from './context-builder';

export const authModule = new GraphQLModule({
  name: 'auth',
  typeDefs: types,
  resolvers,
  contextBuilder
});
