import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';

@GraphQLModule({
  name: 'social-network',
  types,
  resolvers,
})
export class SocialNetworkModule {
}