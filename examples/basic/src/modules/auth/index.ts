import {GraphQLModule, GraphQLModuleContextBuilder, IGraphQLContext} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Request} from 'express';

@GraphQLModule({
  name: 'auth',
  types,
  resolvers,
})
export class AuthModule implements GraphQLModuleContextBuilder {
  buildContext(httpRequest: Request): IGraphQLContext {
    // You can use httpRequest to test token/cookie/headers

    return {
      authenticatedUser: {
        _id: 1,
        username: 'sdsd',
      }
    };
  }
}