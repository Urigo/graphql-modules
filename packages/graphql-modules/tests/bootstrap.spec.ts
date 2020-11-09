import 'reflect-metadata';
import { createApplication, createModule } from '../src';
import { parse } from 'graphql';

test('should not thrown when isTypeOf is used', async () => {
  const m1 = createModule({
    id: 'test',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        entity: Node
      }
      interface Node {
        id: ID!
      }
      type Entity implements Node {
        id: ID!
        f: String
      }
    `),
    resolvers: {
      Query: {
        entity: () => ({
          id: 1,
          type: 'entity',
        }),
      },
      Entity: {
        __isTypeOf: (obj: any) => obj.type === 'entity',
        id: () => 1,
        f: () => 'test',
      },
    },
  });

  const app = createApplication({
    modules: [m1],
  });

  const executeFn = app.createExecution();

  const result = await executeFn({
    schema: app.schema,
    document: parse(/* GraphQL */ `
      query test {
        entity {
          ... on Entity {
            f
          }
        }
      }
    `),
    variableValues: {},
  });

  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    entity: {
      f: 'test',
    },
  });
});

test('should allow to add __isTypeOf to type resolvers', () => {
  const m1 = createModule({
    id: 'test',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        entity: Node
      }
      interface Node {
        id: ID!
      }
      type Entity implements Node {
        id: ID
        f: String
      }
    `),
    resolvers: {
      Query: {
        entity: () => ({
          id: 1,
          type: 'entity',
        }),
      },
      Entity: {
        __isTypeOf: (obj: any) => obj.type === 'entity',
        id: () => 1,
        f: () => 'test',
      },
    },
  });

  expect(() => {
    createApplication({
      modules: [m1],
    });
  }).not.toThrow();
});

test('should support __resolveType', async () => {
  const m1 = createModule({
    id: 'test',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        entity: Node
        item: Item
      }

      interface Node {
        id: ID!
      }

      union Item = Entity | Post

      type Entity implements Node {
        id: ID!
        f: String
      }

      type Post implements Node {
        id: ID!
        e: String
      }
    `),
    resolvers: {
      Query: {
        entity: () => ({
          type: 'Entity',
        }),
        item: () => ({
          type: 'Post',
        }),
      },
      Entity: {
        id: () => 1,
        f: () => 'test',
      },
      Post: {
        id: () => 2,
        e: () => 'post',
      },
      Node: {
        __resolveType: (obj: any) => obj.type,
      },
      Item: {
        __resolveType: (obj: any) => obj.type,
      },
    },
  });

  const app = createApplication({
    modules: [m1],
  });

  const executeFn = app.createExecution();

  const result = await executeFn({
    schema: app.schema,
    document: parse(/* GraphQL */ `
      query test {
        entity {
          ... on Entity {
            f
          }
        }
        item {
          ... on Post {
            e
          }
        }
      }
    `),
    variableValues: {},
  });

  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    entity: {
      f: 'test',
    },
    item: {
      e: 'post',
    },
  });
});

test('do not support inheritance of field resolvers of an interface', async () => {
  const mod = createModule({
    id: 'test',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        entity: Node
        item: Item
      }

      interface Node {
        id: ID!
        d: String
      }

      union Item = Entity | Post

      type Entity implements Node {
        id: ID!
        f: String
        d: String
      }

      type Post implements Node {
        id: ID!
        e: String
        d: String
      }
    `),
    resolvers: {
      Query: {
        entity: () => ({
          type: 'Entity',
        }),
        item: () => ({
          type: 'Post',
        }),
      },
      Entity: {
        id: () => 1,
        f: () => 'test',
      },
      Post: {
        id: () => 2,
        e: () => 'post',
      },
      Node: {
        __resolveType: (obj: any) => obj.type,
        d: () => 'should not work, because graphql-js does not support it',
      },
      Item: {
        __resolveType: (obj: any) => obj.type,
      },
    },
  });

  expect(() => {
    createApplication({
      modules: [mod],
    });
  }).toThrow('Only __resolveType is allowed');
});
