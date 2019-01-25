import 'reflect-metadata';
import { GraphQLModule } from '@graphql-modules/core';
import { Injectable, ProviderScope } from '@graphql-modules/di';
import { useClassProviderForTypeResolver } from '../src';
import { execute } from 'graphql';
import gql from 'graphql-tag';

describe('Class Resolvers', async () => {
  it('should handle resolver classes', async () => {
    @Injectable({
      scope: ProviderScope.Session,
    })
    class QueryResolvers {
      foo() {
        return 'FOO';
      }
    }

    const { schema, context } = new GraphQLModule({
      typeDefs: gql`
        type Query {
          foo: String
        }
      `,
      resolvers: {
        Query: useClassProviderForTypeResolver(QueryResolvers),
      },
      providers: [
        QueryResolvers,
      ],
    });

    const result = await execute({
      schema,
      document: gql`query { foo }`,
      contextValue: await context({}),
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['foo']).toBe('FOO');
  });
});
