import { GraphQLModule } from '@graphql-modules/core';
import { UserModule } from '@modules/user';
import { BlogModule } from '@modules/blog';

export const AppModule = new GraphQLModule({
  imports: [
    UserModule,
    BlogModule,
  ],
});
