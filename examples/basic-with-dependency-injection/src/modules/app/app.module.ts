import { GraphQLModule } from '@graphql-modules/core';
import { UserModule } from '../user';
import { BlogModule } from '../blog';

export const AppModule = new GraphQLModule({
  imports: [
    UserModule,
    BlogModule,
  ],
});
