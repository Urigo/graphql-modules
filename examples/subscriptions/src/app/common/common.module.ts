import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'graphql-subscriptions';

export const CommonModule = new GraphQLModule({
  providers: [PubSub]
});
