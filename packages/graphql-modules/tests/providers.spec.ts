import 'reflect-metadata';
import {
  createApplication,
  createModule,
  Injectable,
  Inject,
  CONTEXT,
  Scope,
  gql,
  forwardRef,
} from '../src';
import { ReflectiveInjector } from '../src/di';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { parse, execute } from 'graphql';
import { stringify } from '../src/di/utils';

test('No error in case of module without providers', async () => {
  @Injectable({
    scope: Scope.Operation,
  })
  class Data {
    lorem() {
      return 'ipsum';
    }
  }

  const mod = createModule({
    id: 'lorem',
    typeDefs: gql`
      type Query {
        lorem: String
      }
    `,
    resolvers: {
      Query: {
        lorem(
          _parent: {},
          _args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Data).lorem();
        },
      },
    },
  });

  const app = createApplication({
    modules: [mod],
    providers: [Data],
  });

  const schema = makeExecutableSchema({
    typeDefs: app.typeDefs,
    resolvers: app.resolvers,
  });

  const contextValue = { request: {}, response: {} };
  const document = parse(/* GraphQL */ `
    {
      lorem
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
    lorem: 'ipsum',
  });
});

test('Make sure we have readable error', async () => {
  @Injectable({ scope: Scope.Singleton })
  class P1 {}

  @Injectable({ scope: Scope.Singleton })
  class P2 {
    // @ts-ignore
    constructor(private p1: P1) {}
  }

  const m1 = createModule({
    id: 'm1',
    providers: [P1],
    typeDefs: parse(`type Query { m1: String }`),
  });
  const m2 = createModule({
    id: 'm2',
    providers: [P2],
    typeDefs: parse(`type Query { m2: String }`),
  });

  expect(() => {
    const app = createApplication({ modules: [m1, m2] });
    app.injector.get(P2);
  }).toThrow('No provider for P1! (P2 -> P1)');
});

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
  expect(constructorSpy).toHaveBeenCalledWith(
    expect.objectContaining(contextValue)
  );

  expect(loadSpy).toHaveBeenCalledTimes(2);
  expect(loadSpy).toHaveBeenCalledWith(1);
});

test('Operation scoped provider should be created once per GraphQL Operation (Apollo Server)', async () => {
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

  const schema = app.createSchemaForApollo();

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

  const result = await execute({
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
  expect(constructorSpy).toHaveBeenCalledWith(
    expect.objectContaining(contextValue)
  );

  expect(loadSpy).toHaveBeenCalledTimes(2);
  expect(loadSpy).toHaveBeenCalledWith(1);
});

test('fail on circular dependencies', async () => {
  const fooSpy = jest.fn();
  const barSpy = jest.fn();

  @Injectable({
    scope: Scope.Singleton,
  })
  class Foo {
    constructor(@Inject(forwardRef(() => Bar)) bar: any) {
      fooSpy(bar);
    }
  }

  @Injectable({
    scope: Scope.Singleton,
  })
  class Bar {
    constructor(@Inject(forwardRef(() => Foo)) foo: any) {
      barSpy(foo);
    }
  }

  const providers = ReflectiveInjector.resolve([Foo, Bar]);
  const injector = ReflectiveInjector.createFromResolved({
    name: 'main',
    providers,
  });
  expect(() => {
    injector.get(Foo);
  }).toThrowError(
    `Cannot instantiate cyclic dependency! (${stringify(Foo)} -> ${stringify(
      Bar
    )} -> ${stringify(Foo)})`
  );
});

test('Global Token provided by one module should be accessible by other modules (operation)', async () => {
  @Injectable({
    scope: Scope.Operation,
    global: true,
  })
  class Data {
    lorem() {
      return 'ipsum';
    }
  }

  const fooModule = createModule({
    id: 'foo',
    providers: [Data],
    typeDefs: gql`
      type Query {
        foo: String!
      }
    `,
    resolvers: {
      Query: {
        foo(
          _parent: {},
          _args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Data).lorem();
        },
      },
    },
  });

  const barModule = createModule({
    id: 'bar',
    typeDefs: gql`
      extend type Query {
        bar: String!
      }
    `,
    resolvers: {
      Query: {
        bar(
          _parent: {},
          _args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Data).lorem();
        },
      },
    },
  });

  const app = createApplication({
    modules: [fooModule, barModule],
  });

  const schema = makeExecutableSchema({
    typeDefs: app.typeDefs,
    resolvers: app.resolvers,
  });

  const contextValue = { request: {}, response: {} };
  const document = parse(/* GraphQL */ `
    {
      foo
      bar
    }
  `);

  const result = await app.createExecution()({
    schema,
    contextValue,
    document,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    foo: 'ipsum',
    bar: 'ipsum',
  });
});

test('Global Token provided by one module should be accessible by other modules (singleton)', async () => {
  @Injectable({
    scope: Scope.Singleton,
    global: true,
  })
  class Data {
    lorem() {
      return 'ipsum';
    }
  }

  const fooModule = createModule({
    id: 'foo',
    providers: [Data],
    typeDefs: gql`
      type Query {
        foo: String!
      }
    `,
    resolvers: {
      Query: {
        foo(
          _parent: {},
          _args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Data).lorem();
        },
      },
    },
  });

  const barModule = createModule({
    id: 'bar',
    typeDefs: gql`
      extend type Query {
        bar: String!
      }
    `,
    resolvers: {
      Query: {
        bar(
          _parent: {},
          _args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Data).lorem();
        },
      },
    },
  });

  const app = createApplication({
    modules: [fooModule, barModule],
  });

  const schema = makeExecutableSchema({
    typeDefs: app.typeDefs,
    resolvers: app.resolvers,
  });

  const contextValue = { request: {}, response: {} };
  const document = parse(/* GraphQL */ `
    {
      foo
      bar
    }
  `);

  const result = await app.createExecution()({
    schema,
    contextValue,
    document,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    foo: 'ipsum',
    bar: 'ipsum',
  });
});
