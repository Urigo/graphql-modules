import { createApplication } from 'graphql-modules';
import { PostModule } from './post/post.module';

export const app = createApplication({
  modules: [PostModule],
  executionContext: false,
});
