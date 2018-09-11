import { GraphQLApp, } from '@graphql-modules/core';
import { userModule } from './modules/user';
import { blogModule } from './modules/blog';

export const app = new GraphQLApp({
  modules: [
    userModule,
    blogModule,
  ],
});
