import { GraphQLApp } from '@graphql-modules/core';
import { userModule } from './modules/user';
import { socialNetworkModule } from './modules/social-network';
import { authModule } from './modules/auth';

export const app = new GraphQLApp({
  modules: [userModule, socialNetworkModule, authModule],
});
