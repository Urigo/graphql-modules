import 'reflect-metadata';
import {
  createModule,
  testModule,
  testInjector,
  gql,
  Injectable,
  Inject,
  InjectionToken,
  CONTEXT,
  Scope,
} from '../src';

describe('testModule', () => {
  test('should replace extensions with definitions on demand', () => {
    const initialModule = createModule({
      id: 'tested',
      typeDefs: gql`
        extend type Query {
          foo: Foo!
        }

        type Foo {
          id: ID
        }
      `,
    });
    expect(() =>
      testModule(initialModule, {
        replaceExtensions: true,
      })
    ).not.toThrow();
  });

  test('should add typeDefs to a module on demand', () => {
    const initialModule = createModule({
      id: 'tested',
      typeDefs: gql`
        type Query {
          foo: Foo!
        }
      `,
    });

    expect(() =>
      testModule(initialModule, {
        typeDefs: gql`
          type Foo {
            id: ID
          }
        `,
      })
    ).not.toThrow();
  });

  test('should add resolvers to a module on demand', async () => {
    const initialModule = createModule({
      id: 'tested',
      typeDefs: gql`
        type Query {
          foo: Foo!
        }

        type Foo {
          id: ID
        }
      `,
      resolvers: {
        Query: {
          foo() {
            return {
              id: 'not-mocked',
            };
          },
        },
      },
    });

    const app = testModule(initialModule, {
      resolvers: {
        Foo: {
          id() {
            return 'mocked';
          },
        },
      },
    });

    const execute = app.createExecution();

    const result = await execute({
      schema: app.schema,
      document: gql`
        {
          foo {
            id
          }
        }
      `,
    });

    expect(result.data).toEqual({
      foo: {
        id: 'mocked',
      },
    });
  });

  test('should overwrite providers in a module on demand', async () => {
    @Injectable({
      scope: Scope.Singleton,
    })
    class Data {
      getById(id: string) {
        return {
          id,
        };
      }
    }

    const initialModule = createModule({
      id: 'tested',
      typeDefs: gql`
        type Query {
          foo(id: ID!): Foo!
        }

        type Foo {
          id: ID
        }
      `,
      resolvers: {
        Query: {
          foo(
            _: {},
            { id }: { id: string },
            { injector }: GraphQLModules.ModuleContext
          ) {
            return injector.get(Data).getById(id);
          },
        },
      },
    });

    const app = testModule(initialModule, {
      providers: [
        {
          provide: Data,
          useValue: {
            getById() {
              return {
                id: 'mocked',
              };
            },
          },
        },
      ],
    });

    const execute = app.createExecution();

    const result = await execute({
      schema: app.schema,
      document: gql`
        {
          foo(id: "not-mocked") {
            id
          }
        }
      `,
    });

    expect(result.errors).not.toBeDefined();
    expect(result.data).toEqual({
      foo: {
        id: 'mocked',
      },
    });
  });
});

describe('testInjector', () => {
  test('should provide an empty context', () => {
    @Injectable({
      scope: Scope.Singleton,
    })
    class Data {
      constructor(@Inject(CONTEXT) private context: any) {}
      getById(id: string) {
        return {
          ...this.context,
          id,
        };
      }
    }

    const injector = testInjector([Data]);
    const data = injector.get(Data).getById('mocked');

    expect(data.id).toEqual('mocked');
    expect(Object.keys(data)).toHaveLength(1);
  });

  test('should instantiate all providers', () => {
    const UNKNOWN = new InjectionToken<unknown>('UNKNOWN-TOKEN');

    @Injectable({
      scope: Scope.Singleton,
    })
    class Data {
      constructor(@Inject(UNKNOWN) private missing: any) {}
      getById(id: string) {
        return {
          ...this.missing,
          id,
        };
      }
    }

    expect(() => testInjector([Data])).toThrowError(/UNKNOWN-TOKEN/);
  });
});
