import 'reflect-metadata';
import {
  createApplication,
  createModule,
  Injectable,
  Inject,
  CONTEXT,
  Scope,
  gql,
} from '../src';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { parse } from 'graphql';

test('Operation scoped provider should be created once per GraphQL Operation', async () => {
  const constructorSpy = jest.fn();
  const loadSpy = jest.fn();

  @Injectable({
    scope: Scope.Operation,
  })
  class Dataloader {
    constructor(@Inject(CONTEXT) context: GraphQLModules.GlobalContext) {
      constructorSpy(context);
    }

    load(id: number) {
      loadSpy(id);
      return {
        id,
        title: 'Sample Title',
      };
    }
  }

  const postsModule = createModule({
    id: 'posts',
    providers: [Dataloader],
    typeDefs: gql`
      type Post {
        id: Int!
        title: String!
      }

      type Query {
        post(id: Int!): Post!
      }
    `,
    resolvers: {
      Query: {
        post(
          _parent: {},
          args: { id: number },
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Dataloader).load(args.id);
        },
      },
    },
  });

  const app = createApplication({
    modules: [postsModule],
  });

  const schema = makeExecutableSchema({
    typeDefs: app.typeDefs,
    resolvers: app.resolvers,
  });

  const contextValue = { request: {}, response: {} };
  const document = parse(/* GraphQL */ `
    {
      foo: post(id: 1) {
        id
        title
      }
      bar: post(id: 1) {
        id
        title
      }
    }
  `);

  const result = await app.createExecution()({
    schema,
    contextValue,
    document,
  });

  // Should resolve data correctly
  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    foo: {
      id: 1,
      title: 'Sample Title',
    },
    bar: {
      id: 1,
      title: 'Sample Title',
    },
  });

  expect(constructorSpy).toHaveBeenCalledTimes(1);
  expect(constructorSpy).toHaveBeenCalledWith(contextValue);

  expect(loadSpy).toHaveBeenCalledTimes(2);
  expect(loadSpy).toHaveBeenCalledWith(1);
});
