import { GraphQLModule } from '@graphql-modules/core';
import { userModule } from './modules/user/user.module';
import { socialNetworkModule } from './modules/social-network/social-network.module';
import { authModule } from './modules/auth/auth.module';

export const app = new GraphQLModule({
  modules: [
    authModule,
    userModule,
    socialNetworkModule,
  ],
});
