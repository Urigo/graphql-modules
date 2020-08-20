import { createApplication } from 'graphql-modules';
import { PubSub } from 'graphql-subscriptions';
import { PostModule } from './post/post.module';

export const graphqlApplication = createApplication({
  modules: [PostModule],
  providers: [
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
  ],
});
