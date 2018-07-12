import { GraphQLApp } from '@graphql-modules/core';
import { userModule } from './modules/user';
import { blogModule } from './modules/blog';
import { infoModule } from './modules/info';

export const app = new GraphQLApp({
  modules: [
    infoModule.withConfig({
      version: 'v1.0.0',
    }),
    userModule,
    blogModule,
  ],
});
