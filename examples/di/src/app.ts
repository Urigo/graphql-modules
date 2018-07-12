import { GraphQLApp } from '@graphql-modules/core';
import { userModule } from './modules/user';
import { blogModule } from './modules/blog';
import { infoModule } from './modules/info';

// TODO: check if they get .withConfig (ModuleConfig)
export const app = new GraphQLApp({
  modules: [infoModule, userModule, blogModule],
});
