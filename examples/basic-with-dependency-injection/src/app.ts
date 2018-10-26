import { GraphQLModule } from '@graphql-modules/core';
import { UserModule } from './modules/user';
import { BlogModule } from './modules/blog';

export const app = new GraphQLModule({
  imports: [
    UserModule,
    BlogModule,
  ],
});
