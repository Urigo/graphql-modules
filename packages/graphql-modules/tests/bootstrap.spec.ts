import 'reflect-metadata';
import { createApplication, createModule } from '../src';
import { parse } from 'graphql';

test('fail when modules have non-unique ids', async () => {
  const modFoo = createModule({
    id: 'foo',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        foo: String
      }
    `),
  });

  const modBar = createModule({
    id: 'foo',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        bar: String
      }
    `),
  });

  expect(() => {
    createApplication({
      modules: [modFoo, modBar],
    });
  }).toThrow(`Modules with non-unique ids: foo`);
});

test('should allow multiple type extensions in the same module', async () => {
  const m1 = createModule({
    id: 'test',
    typeDefs: parse(/* GraphQL */ `
      type Query {
        dummy: String!
      }
      type Mutation {
        foo: String!
      }
      extend type Mutation {
        bar: String!
      }
      extend type Mutation {
        test: String!
      }
    `),
    resolvers: {
      Mutation: {
        foo: () => '1',
        bar: () => '1',
        test: () => '1',
      },
    },
  });

  const app = createApplication({
    modules: [m1],
  });

  const schema = app.schema;
  expect(Object.keys(schema.getMutationType()?.getFields() || {}).length).toBe(
    3
  );
});

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
