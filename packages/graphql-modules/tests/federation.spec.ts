import 'reflect-metadata';
import { mergeResolvers } from '@graphql-tools/merge';
import { createApplication, createModule, gql } from '../src/index.js';
import { versionInfo } from 'graphql';

describe('federation', () => {
  if (versionInfo.major < 15) {
    console.warn(
      'Federation is only supported in v15 and v16 of graphql-js. Skipping tests...'
    );
    it('dummy', () => {});
    return;
  }

  const {
    buildSubgraphSchema,
  }: typeof import('@apollo/federation') = require('@apollo/federation');

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
          __resolveReference() {},
        },
      },
    });

    expect(() =>
      createApplication({
        modules: [mod],
        schemaBuilder(input) {
          return buildSubgraphSchema({
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
          __resolveObject() {},
        },
      },
    });

    expect(() =>
      createApplication({
        modules: [mod],
        schemaBuilder(input) {
          return buildSubgraphSchema({
            typeDefs: input.typeDefs,
            resolvers: mergeResolvers(input.resolvers) as any,
          });
        },
      })
    ).not.toThrow();
  });
});
