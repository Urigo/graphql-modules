import { createApplication } from 'graphql-modules';
import { PubSub } from 'graphql-subscriptions';
import { PostModule } from './post/post.module';

export const app = createApplication({
  providers: [
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
  ],
  modules: [PostModule],
});
