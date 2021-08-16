import 'reflect-metadata';
import { createApplication, createModule, gql } from '../src';
import { ApolloServer } from 'apollo-server-express';

describe('Apollo Server', () => {
  test('cacheControl available in info object', async () => {
    const spy = jest.fn();
    const mod = createModule({
      id: 'test',
      typeDefs: gql`
        type Query {
          foo: Boolean!
        }
      `,
      resolvers: {
        Query: {
          foo(_: {}, __: {}, ___: {}, { cacheControl }: any) {
            spy(cacheControl);
            return true;
          },
        },
      },
    });
    const app = createApplication({
      modules: [mod],
    });
    const apollo = new ApolloServer({
      typeDefs: app.typeDefs,
      resolvers: app.resolvers,
      executor: app.createApolloExecutor(),
    });

    const response = await apollo.executeOperation({
      query: /* GraphQL */ `
        query foo {
          foo
        }
      `,
      operationName: 'foo',
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.foo).toBe(true);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        setCacheHint: expect.any(Function),
      })
    );
  });
});
