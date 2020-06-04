import { createApplication } from 'graphql-modules';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SocialNetworkModule } from './social-network/social-network.module';

export const app = createApplication({
  modules: [AuthModule, UserModule, SocialNetworkModule],
});
