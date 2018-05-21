import {GraphQLModule} from '@graphql-modules/core';
import {resolvers, types} from './schema';

@GraphQLModule({
  name: 'user',
  types,
  resolvers,
})
export class UserModule {
}