import 'reflect-metadata';
import { mergeResolvers } from '@graphql-tools/merge';
import { createApplication, createModule, gql } from '../src';
import { versionInfo } from 'graphql';

describe('federation', () => {

  if (versionInfo.major !== 15) {
    console.warn('Federation is only supported in v15.x.x of graphql-js. Skipping tests...');
    it('dummy', () => {});
    return;
  }

  const { buildFederatedSchema }: typeof import('@apollo/federation') = require('@apollo/federation');

  test('allow __resolveReference', async () => {
    const mod = createModule({
      id: 'test',
      typeDefs: gql`
      type Query {
        me: User!
      }

      type User {
        id: ID!
        username: String
      }
    `,
      resolvers: {
        User: {
          __resolveReference() { },
        },
      },
    });

    expect(() =>
      createApplication({
        modules: [mod],
        schemaBuilder(input) {
          return buildFederatedSchema({
            typeDefs: input.typeDefs,
            resolvers: mergeResolvers(input.resolvers) as any,
          });
        },
      })
    ).not.toThrow();
  });

  test('allow __resolveObject', async () => {
    const mod = createModule({
      id: 'test',
      typeDefs: gql`
      type Query {
        me: User!
      }

      type User {
        id: ID!
        username: String
      }
    `,
      resolvers: {
        User: {
          __resolveObject() { },
        },
      },
    });

    expect(() =>
      createApplication({
        modules: [mod],
        schemaBuilder(input) {
          return buildFederatedSchema({
            typeDefs: input.typeDefs,
            resolvers: mergeResolvers(input.resolvers) as any,
          });
        },
      })
    ).not.toThrow();
  });

})
