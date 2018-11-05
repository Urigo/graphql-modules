import { GraphQLModule } from '@graphql-modules/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SocialNetworkModule } from './social-network/social-network.module';

export const AppModule = new GraphQLModule({
  imports: [
    AuthModule,
    UserModule,
    SocialNetworkModule,
  ],
});
