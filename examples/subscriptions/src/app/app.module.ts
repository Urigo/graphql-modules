import { GraphQLModule } from '@graphql-modules/core';
import { CommonModule } from './common/common.module';
import { PostModule } from './post/post.module';

export const AppModule = new GraphQLModule({
  imports: [CommonModule, PostModule]
});
