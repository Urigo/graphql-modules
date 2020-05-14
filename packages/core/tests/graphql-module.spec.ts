import 'reflect-metadata';
import {
  GraphQLModule,
  ModuleConfig,
  ModuleContext,
  OnRequest,
  ModuleConfigRequiredError,
  OnResponse,
  OnInit
} from '../src';
import {
  execute,
  GraphQLSchema,
  GraphQLString,
  defaultFieldResolver,
  print,
  GraphQLScalarType,
  Kind,
  parse
} from 'graphql';
import { stripWhitespaces } from './utils';
import gql from 'graphql-tag';
import { SchemaDirectiveVisitor, makeExecutableSchema } from 'graphql-tools';
import { ModuleSessionInfo } from '../src/module-session-info';
import {
  Injectable,
  Inject,
  InjectFunction,
  Injector,
  ProviderScope,
  DependencyProviderNotFoundError
} from '@graphql-modules/di';
import { SchemaLink } from 'apollo-link-schema';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { KeyValueCache } from 'apollo-server-caching';
import { EventEmitter } from 'events';
import { printSchemaWithDirectives } from '@graphql-toolkit/common';

jest.setTimeout(60000 * 10);
describe('GraphQLModule', () => {
  // A
  @Injectable()
  class ProviderA {
    doSomething() {
      return 'Test1';
    }
  }

  // B
  @Injectable()
  class ProviderB {
    doSomethingElse() {
      return 'Test2';
    }
  }

  const typesA = [`type A { f: String}`, `type Query { a: A }`];
  const moduleA = new GraphQLModule({
    name: 'A',
    typeDefs: typesA,
    resolvers: ({ injector }) => ({
      Query: { a: () => ({}) },
      A: { f: () => injector.get(ProviderA).doSomething() }
    }),
    providers: [ProviderA]
  });

  // B
  const typesB = [`type B { f: String}`, `type Query { b: B }`];
  const resolversB = {
    Query: { b: () => ({}) },
    B: { f: (root, args, context) => context.user.id }
  };
  let resolverCompositionCalled = false;
  const moduleB = new GraphQLModule({
    name: 'B',
    typeDefs: typesB,
    resolvers: resolversB,
    resolversComposition: {
      'B.f': next => async (root, args, context: ModuleContext, info) => {
        if (context.injector && context.injector.get(ModuleConfig(moduleB))) {
          resolverCompositionCalled = true;
        }
        return next(root, args, context, info);
      }
    },
    imports: () => [moduleC]
  });

  // C (with context building fn)
  const cContextBuilder = () => ({ user: { id: 1 } });
  const typesC = [`type C { f: String}`, `type Query { c: C }`];
  const moduleC = new GraphQLModule({
    name: 'C',
    typeDefs: typesC,
    context: cContextBuilder
  });

  // D
  const moduleD = new GraphQLModule({
    name: 'D',
    typeDefs: typesC,
    context: () => {
      throw new Error('oops');
    }
  });

  // E
  const moduleE = new GraphQLModule({
    name: 'E',
    typeDefs: typesC
  });

  // F
  const typeDefsFnMock = jest.fn().mockReturnValue(typesC);
  const resolversFnMock = jest.fn().mockReturnValue({ C: {} });
  const moduleF = new GraphQLModule({
    name: 'F',
    typeDefs: typeDefsFnMock,
    resolvers: resolversFnMock
  });

  afterEach(() => {
    typeDefsFnMock.mockClear();
    resolversFnMock.mockClear();
  });

  // Queries
  const testQuery = gql`
    query {
      b {
        f
      }
    }
  `;
  const app = new GraphQLModule({ imports: [moduleA, moduleB.forRoot({}), moduleC] });

  type MockSession<T> = { res: EventEmitter } & T;
  const createMockSession = <T>(customProps?: T): MockSession<T> => {
    return {
      res: new EventEmitter(),
      ...customProps
    };
  };

  it('should return the correct GraphQLSchema', async () => {
    const schema = app.schema;

    expect(schema).toBeDefined();
    expect(schema instanceof GraphQLSchema).toBeTruthy();
    expect(stripWhitespaces(printSchemaWithDirectives(schema))).toBe(
      stripWhitespaces(/* GraphQL */`
      schema {
        query: Query
      }

      type A {
        f: String
      }

      type Query {
        a: A
        c: C
        b: B
      }

      type C {
        f: String
      }

      type B {
        f: String
      }`)
    );
  });

  it('should trigger the correct GraphQL context builders and build the correct context', async () => {
    const schema = app.schema;
    const result = await execute({
      schema,
      document: testQuery
    });
    expect(result.errors).toBeFalsy();
    expect(result.data.b.f).toBe('1');
  });

  it('should work without a GraphQL schema and set providers', async () => {
    const provider = {};
    const token = Symbol.for('provider');
    const module = new GraphQLModule({
      providers: [
        {
          provide: token,
          useValue: provider
        }
      ]
    });
    const { injector } = new GraphQLModule({ imports: [module] });

    expect(injector.get(token)).toBe(provider);
  });

  it('should work importing modules that don\'t specify GraphQL schema and set providers', async () => {
    const provider1 = {};
    const token1 = Symbol.for('provider');

    const moduleA = new GraphQLModule({
      providers: [
        {
          provide: token1,
          useValue: provider1
        }
      ]
    });

    const provider2 = {};
    const token2 = Symbol.for('provider2');

    const moduleB = new GraphQLModule({
      imports: [moduleA],
      providers: [
        {
          provide: token2,
          useValue: provider2
        }
      ]
    });

    const moduleApp = new GraphQLModule({
      imports: [moduleA, moduleB],
      typeDefs: gql`
        type Query {
          ping: String
        }
      `
    });

    const schema = moduleApp.schema;
    const schemaAsync = await moduleApp.schemaAsync;

    expect(schema).toBeDefined();
    expect(schemaAsync).toBeDefined();
  });

  it('should put the correct providers to the injector', async () => {
    expect(app.injector.get(ProviderA) instanceof ProviderA).toBe(true);
  });

  it('should allow to get schema', async () => {
    expect(app.schema).toBeDefined();
  });

  it('should inject dependencies to factory functions using Inject', async () => {
    const { schema } = new GraphQLModule({
      typeDefs: gql`
        type Query {
          something: String
          somethingElse: String
        }
      `,
      providers: [ProviderA, ProviderB],
      resolvers: InjectFunction(ProviderA, ProviderB)((providerA, providerB) => ({
        Query: {
          something: () => providerA.doSomething(),
          somethingElse: () => providerB.doSomethingElse()
        }
      }))
    });
    const result = await execute({
      schema,
      document: gql`
        query {
          something
          somethingElse
        }
      `
    });
    expect(result.errors).toBeFalsy();
    expect(result.data.something).toBe('Test1');
    expect(result.data.somethingElse).toBe('Test2');
  });

  it('should inject properties of classes', async () => {
    @Injectable()
    class FooProvider {
      message = 'FOO';
    }
    @Injectable()
    class BarProvider {
      @Inject()
      fooProvider: FooProvider;
    }
    const { injector } = new GraphQLModule({
      providers: [FooProvider, BarProvider]
    });
    expect(injector.get(BarProvider).fooProvider).toBeInstanceOf(FooProvider);
  });

  describe('Schema merging', () => {
    it('should merge types and directives correctly', async () => {
      const m1 = new GraphQLModule({
        typeDefs: [
          `directive @entity on OBJECT`,
          `directive @field on FIELD_DEFINITION`,
          `type A @entity { f: String }`,
          `type Query { a: [A!] }`
        ]
      });
      const m2 = new GraphQLModule({
        typeDefs: [
          `directive @entity on OBJECT`,
          `directive @field on FIELD_DEFINITION`,
          `type A @entity { f: String @field }`,
          `type Query { a: [A!] }`
        ]
      });

      const app = new GraphQLModule({
        imports: [m1, m2]
      });

      const aFields = app.schema.getTypeMap()['A']['getFields']();
      const node = aFields['f'].astNode;
      expect(node.directives.length).toBe(1);
    });

    it('should merge scalars', () => {
      expect(() => {
        const m1 = new GraphQLModule({
          typeDefs: [`scalar Date`, `type Query { foo: Date }`],
          resolvers: {
            Date: new GraphQLScalarType({
              name: 'Date',
              serialize() { },
              parseValue() { },
              parseLiteral(ast) {
                if (ast.kind !== Kind.STRING) {
                  throw new TypeError(`Date cannot represent non string type`);
                }
                const { value } = ast;

                return new Date(value);
              }
            })
          }
        });

        const m2 = new GraphQLModule({
          typeDefs: [`type Query { bar: Date }`],
          imports: [m1]
        });

        expect(m2.schema.getType('Date').name).toEqual('Date');
      }).not.toThrow();
    });
  });

  describe('Module Dependencies', () => {
    it('should init modules in the right order with onInit hook', async () => {
      let counter = 0;

      @Injectable()
      class Provider1 implements OnInit {
        count: number;

        onInit() {
          this.count = counter++;
        }
      }

      @Injectable()
      class Provider2 implements OnInit {
        count: number;

        onInit() {
          this.count = counter++;
        }
      }

      const module1 = new GraphQLModule({ imports: () => [module2], providers: [Provider1] });
      const module2 = new GraphQLModule({ providers: [Provider2] });
      const { injector } = new GraphQLModule({ imports: [module2, module1] });
      expect(injector.get(Provider1).count).toEqual(1);
      expect(injector.get(Provider2).count).toEqual(0);
      expect(counter).toEqual(2);
    });

    it('should set config per each module', async () => {
      interface IModuleConfig {
        test: number;
      }

      const module1 = new GraphQLModule({
        imports: () => [module2],
        providers: () => [Provider1]
      }).forRoot({ test: 1 });
      const module2 = new GraphQLModule({ providers: () => [Provider2] }).forRoot({ test: 2 });

      @Injectable()
      class Provider1 {
        test: number;

        constructor(@Inject(ModuleConfig) config: IModuleConfig) {
          this.test = config.test;
        }
      }

      @Injectable()
      class Provider2 {
        test: number;

        constructor(@Inject(ModuleConfig) config: IModuleConfig) {
          this.test = config.test;
        }
      }

      const { injector } = new GraphQLModule({ imports: [module2, module1] });

      expect(injector.get(Provider1).test).toEqual(1);
      expect(injector.get(Provider2).test).toEqual(2);
    });
    it('should not allow to use modules without configuration if required', async () => {
      let error;
      try {
        const { context } = new GraphQLModule({
          configRequired: true
        });
        await context({});
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ModuleConfigRequiredError);
    });
    it('should encapsulate between providers from different non-dependent modules', async () => {
      class ProviderA {
        test = 0;
      }

      const moduleB = new GraphQLModule({ providers: [ProviderA] });

      @Injectable()
      class ProviderB {
        constructor(public providerA: ProviderA) { }
      }

      const moduleA = new GraphQLModule({ providers: [ProviderB] });

      try {
        const { injector } = new GraphQLModule({ imports: [moduleA, moduleB] });
        injector.get(ProviderB);
      } catch (e) {
        expect(e instanceof DependencyProviderNotFoundError).toBeTruthy();
        expect(e.dependent === ProviderB).toBeTruthy();
        expect(e.dependency === ProviderA).toBeTruthy();
        expect(e.dependencyIndex).toBe(0);
      }
    });
    it('should encapsulate resolvers', async () => {
      @Injectable()
      class ProviderB {
        test = 1;
      }

      try {
        const moduleA = new GraphQLModule({
          typeDefs: gql`
            type Query {
              test: String
            }
          `,
          resolvers: InjectFunction(ProviderB)(providerB => ({
            Query: {
              test: () => providerB.test
            }
          }))
        });

        const moduleB = new GraphQLModule({ providers: [ProviderB] });
        const { schema } = new GraphQLModule({ imports: [moduleA, moduleB] });
        await execute({
          schema,
          document: gql`
            query {
              test
            }
          `
        });
      } catch (e) {
        expect(e.message).toContain('ProviderB not provided in');
      }
    });
  });
  describe('onRequest Hook', () => {
    it('should call onRequest hook on each session', async () => {
      let counter = 0;
      @Injectable()
      class FooProvider implements OnRequest {
        onRequest() {
          counter++;
        }
      }

      const { schema } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: () => ''
          }
        },
        providers: [FooProvider]
      });
      await execute({
        schema,

        document: gql`
          query {
            foo
          }
        `
      });
      expect(counter).toBe(1);
      await execute({
        schema,

        document: gql`
          query {
            foo
          }
        `
      });
      expect(counter).toBe(2);
      await execute({
        schema,

        document: gql`
          query {
            foo
          }
        `
      });
      expect(counter).toBe(3);
    });

    it('should call onRequest hook on each session when using injection tokens', async () => {
      const providerToken = 'FooProvider';

      let counter = 0;
      @Injectable()
      class FooProvider implements OnRequest {
        onRequest() {
          counter++;
        }
      }

      const { schema } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: () => ''
          }
        },
        providers: [{ provide: providerToken, useClass: FooProvider }]
      });
      await execute({
        schema,

        document: gql`
          query {
            foo
          }
        `
      });
      expect(counter).toBe(1);
    });

    it('should pass network session to onRequest hook', async () => {
      const fooSession = {
        foo: 'bar'
      };
      let receivedSession;

      @Injectable()
      class FooProvider implements OnRequest {
        onRequest(moduleInfo: ModuleSessionInfo) {
          receivedSession = moduleInfo.session;
        }
      }

      const { schema } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: (root, args, { injector }: ModuleContext) => injector.get(ModuleSessionInfo).session.foo
          }
        },
        providers: [FooProvider]
      });
      const result = await execute({
        schema,
        document: gql`
          query {
            foo
          }
        `,
        contextValue: fooSession
      });
      expect(result.errors).toBeFalsy();
      expect(receivedSession).toBe(fooSession);
      expect(result.data.foo).toBe(fooSession.foo);
    });
  });
  describe('onResponse Hook', () => {
    it('should call onResponse hook on each session', async () => {
      let counter = 0;
      @Injectable()
      class FooProvider implements OnResponse {
        onResponse() {
          counter++;
        }
      }

      const { schema } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: () => ''
          }
        },
        providers: [FooProvider]
      });
      const session1 = createMockSession({});
      await execute({
        schema,
        contextValue: session1,
        document: gql`
          query {
            foo
          }
        `
      });
      session1.res.emit('finish');
      expect(counter).toBe(1);
      const session2 = createMockSession({});
      await execute({
        schema,
        contextValue: session2,
        document: gql`
          query {
            foo
          }
        `
      });
      session2.res.emit('finish');
      expect(counter).toBe(2);
      const session3 = createMockSession({});
      await execute({
        schema,
        contextValue: session3,
        document: gql`
          query {
            foo
          }
        `
      });
      session3.res.emit('finish');
      expect(counter).toBe(3);
    });

    it('should pass network session to onResponse hook', async () => {
      const fooSession = createMockSession({
        foo: 'FOO'
      });
      let receivedSession;

      @Injectable()
      class FooProvider implements OnResponse {
        onResponse(moduleInfo: ModuleSessionInfo) {
          receivedSession = moduleInfo.session;
        }
      }

      const { schema } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: (root, args, { injector }: ModuleContext) => injector.get(ModuleSessionInfo).session.foo
          }
        },
        providers: [FooProvider]
      });
      const result = await execute({
        schema,
        document: gql`
          query {
            foo
          }
        `,
        contextValue: fooSession
      });
      await fooSession.res.emit('finish');
      expect(result.errors).toBeFalsy();
      expect(receivedSession).toBe(fooSession);
      expect(result.data.foo).toBe(fooSession.foo);
    });
    it('should destroy session context after response', async () => {
      const fooSession = createMockSession({
        foo: 'bar'
      });

      const myModule = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: (root, args, { injector }: ModuleContext) => injector.get(ModuleSessionInfo).session.foo
          }
        }
      });
      const result = await execute({
        schema: myModule.schema,
        document: gql`
          query {
            foo
          }
        `,
        contextValue: fooSession
      });
      await fooSession.res.emit('finish');
      expect(result.errors).toBeFalsy();
      expect(myModule['_sessionContext$Map'].has(fooSession)).toBeFalsy();
      expect(myModule.injector['_sessionSessionInjectorMap'].has(fooSession)).toBeFalsy();
    });
  });
  describe('Resolvers Composition', () => {
    it('should call resolvers composition with module context', async () => {
      const schema = app.schema;
      await execute({
        schema,

        document: testQuery
      });
      expect(resolverCompositionCalled).toBe(true);
    });

    /* it('should call resolvers composition in correct order with correct context', async () => {
      const { schema, context } = new GraphQLModule({
        typeDefs: `
          type Query {
            foo: String
          }
        `,
        context: async () => {
          return {
            counter: 0,
            foo: null,
            bar: null,
          };
        },
        resolvers: {
          Query: {
            foo: (root, args, context, info) => {
              context.counter++;
              expect(context.foo).toBe('bar');
              expect(context.bar).toBe('foo');
              expect(context.counter).toBe(3);
              return 'Hello';
            },
          },
        },
        resolversComposition: {
          'Query.foo': [
            next => (root, args, context, info) => {
              context.counter++;
              context.foo = 'bar';
              expect(context.counter).toBe(1);
              return next(root, args, context, info);
            },
            next => (root, args, context, info) => {
              context.counter++;
              expect(context.foo).toBe('bar');
              expect(context.counter).toBe(2);
              context.bar = 'foo';
              return next(root, args, context, info);
            },
          ],
        },
      });
      const result = await execute({
        schema,

        document: gql`query { foo }`,
        contextValue: await context({ req: {} }),
      });
      expect(result.errors).toBeFalsy();
      expect(result.data.foo).toBe('Hello');
    });
*/
    it('should compose child resolvers with correct result and parameters', async () => {
      const getFoo = () => 'FOO';
      const FooModule = new GraphQLModule({
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: async () => getFoo()
          }
        }
      });
      const { schema } = new GraphQLModule({
        imports: [FooModule],
        resolversComposition: {
          'Query.foo': next => async (root, args, context, info) => {
            const prevResult = await next(root, args, context, info);
            return getFoo() + prevResult;
          }
        }
      });
      const result = await execute({
        schema,

        document: gql`
          query {
            foo
          }
        `
      });
      expect(result.errors).toBeFalsy();
      expect(result.data.foo).toBe('FOOFOO');
    });

    it('a resolver can be composed by two different modules', async () => {
      const FooModule = new GraphQLModule({
        name: 'foo',
        typeDefs: gql`
          type Query {
            foo: String
          }
        `,
        resolvers: {
          Query: {
            foo: async () => 'FOO'
          }
        }
      });
      const BarModule = new GraphQLModule({
        imports: [FooModule],
        resolversComposition: {
          'Query.foo': next => async (root, args, context, info) => {
            const prevResult = await next(root, args, context, info);
            return 'BAR' + prevResult;
          }
        }
      });
      const QuxModule = new GraphQLModule({
        imports: [BarModule],
        resolversComposition: {
          'Query.foo': next => async (root, args, context, info) => {
            const prevResult = await next(root, args, context, info);
            return 'QUX' + prevResult;
          }
        }
      });
      const { schema } = new GraphQLModule({
        imports: [QuxModule]
      });
      const result = await execute({
        schema,

        document: gql`
          query {
            foo
          }
        `
      });
      expect(result.errors).toBeFalsy();
      expect(result.data.foo).toBe('QUXBARFOO');
    });

    it('should inject context correctly into `__resolveType`', async () => {
      let hasInjector = false;

      const { schema } = new GraphQLModule({
        typeDefs: `
          type Query {
            something: MyBase
          }

          interface MyBase {
            id: String
          }

          type MyType implements MyBase {
            id: String
          }
        `,
        resolvers: {
          Query: {
            something: () => {
              return { someValue: 1 };
            }
          },
          MyBase: {
            __resolveType: (obj, context) => {
              hasInjector = !!context.injector;

              return 'MyType';
            }
          },
          MyType: {
            id: o => o.someValue
          }
        }
      });

      await execute({
        schema,

        document: gql`
          query {
            something {
              id
            }
          }
        `
      });

      expect(hasInjector).toBeTruthy();
    });
  });
  describe('Schema Directives', () => {
    it('should handle schema directives', async () => {
      const typeDefs = gql`
        directive @date on FIELD_DEFINITION

        scalar Date

        type Query {
          today: Date @date
        }
      `;

      class FormattableDateDirective extends SchemaDirectiveVisitor {
        public visitFieldDefinition(field) {
          const { resolve = defaultFieldResolver } = field;

          field.args.push({
            name: 'format',
            type: GraphQLString
          });

          field.resolve = async function (source, args, context, info) {
            const date = await resolve.call(this, source, args, context, info);
            return date.toLocaleDateString();
          };

          field.type = GraphQLString;
        }
      }

      const { schema, schemaDirectives } = new GraphQLModule({
        typeDefs,
        resolvers: {
          Query: {
            today: () => new Date()
          }
        },
        schemaDirectives: {
          date: FormattableDateDirective
        }
      });

      SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);

      const result = await execute({
        schema,

        document: gql`
          query {
            today
          }
        `
      });

      expect(result.data['today']).toEqual(new Date().toLocaleDateString());
    });
    it('should handle child schema directives', async () => {
      class FormattableDateDirective extends SchemaDirectiveVisitor {
        public visitFieldDefinition(field) {
          const { resolve = defaultFieldResolver } = field;

          field.args.push({
            name: 'format',
            type: GraphQLString
          });

          field.resolve = async function (source, args, context, info) {
            const date = await resolve.call(this, source, args, context, info);
            return date.toLocaleDateString();
          };

          field.type = GraphQLString;
        }
      }

      const DateDirectiveModule = new GraphQLModule({
        typeDefs: gql`
          directive @date on FIELD_DEFINITION
        `,
        schemaDirectives: {
          date: FormattableDateDirective
        }
      });

      const VisitedDateModule = new GraphQLModule({
        typeDefs: gql`
          scalar Date

          type Query {
            today: Date @date
          }
        `,
        resolvers: {
          Query: {
            today: () => new Date()
          }
        },
        imports: [DateDirectiveModule]
      });

      const { schema, schemaDirectives } = new GraphQLModule({
        imports: [DateDirectiveModule, VisitedDateModule]
      });

      SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);

      const result = await execute({
        schema,
        document: gql`
          query {
            today
          }
        `
      });

      expect(result.data['today']).toEqual(new Date().toLocaleDateString());
    });

    it('should visit directives if visitSchemaDirectives option is set to true', async () => {
      const typeDefs = gql`
        directive @date on FIELD_DEFINITION

        scalar Date

        type Query {
          today: Date @date
        }
      `;

      class FormattableDateDirective extends SchemaDirectiveVisitor {
        public visitFieldDefinition(field) {
          const { resolve = defaultFieldResolver } = field;

          field.args.push({
            name: 'format',
            type: GraphQLString
          });

          field.resolve = async function (source, args, context, info) {
            const date = await resolve.call(this, source, args, context, info);
            return date.toLocaleDateString();
          };

          field.type = GraphQLString;
        }
      }

      const { schema, schemaDirectives } = new GraphQLModule({
        typeDefs,
        resolvers: {
          Query: {
            today: () => new Date()
          }
        },
        schemaDirectives: {
          date: FormattableDateDirective
        },
        visitSchemaDirectives: true,
      });

      const result = await execute({
        schema,

        document: gql`
          query {
            today
          }
        `
      });

      expect(result.data['today']).toEqual(new Date().toLocaleDateString());
    })
  });
  describe('Providers Scope', () => {
    it('should construct session scope on each network session', async () => {
      let counter = 0;

      @Injectable({
        scope: ProviderScope.Session
      })
      class ProviderA {
        constructor() {
          counter++;
        }
        test(injector: Injector) {
          return this === injector.get(ProviderA);
        }
      }

      const { schema } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            test: Boolean
          }
        `,
        resolvers: {
          Query: {
            test: (root: never, args: never, { injector }: ModuleContext) => injector.get(ProviderA).test(injector)
          }
        },
        providers: [ProviderA]
      });
      expect(counter).toBe(0);
      const result1 = await execute({
        schema,

        document: gql`
          query {
            test
          }
        `
      });
      expect(result1.data['test']).toBe(true);
      expect(counter).toBe(1);
      const result2 = await execute({
        schema,

        document: gql`
          query {
            test
          }
        `
      });
      expect(result2.data['test']).toBe(true);
      expect(counter).toBe(2);
    });
    it('should construct request scope on each injector request independently from network session', async () => {
      let counter = 0;
      @Injectable({
        scope: ProviderScope.Request
      })
      class ProviderA {
        constructor() {
          counter++;
        }
      }
      const { context, injector } = new GraphQLModule({ providers: [ProviderA] });
      expect(counter).toBe(0);
      await context({ mustBe: 0 });
      expect(counter).toBe(0);
      injector.get(ProviderA);
      expect(counter).toBe(1);
      injector.get(ProviderA);
      expect(counter).toBe(2);
    });
    it('should inject network session with moduleSessionInfo in session and request scope providers', async () => {
      const testSession = {
        foo: 'BAR'
      };
      @Injectable({
        scope: ProviderScope.Session
      })
      class ProviderA {
        constructor(private moduleInfo: ModuleSessionInfo) { }
        test() {
          return this.moduleInfo.session.foo;
        }
      }
      @Injectable({
        scope: ProviderScope.Request
      })
      class ProviderB {
        constructor(private moduleInfo: ModuleSessionInfo) { }
        test() {
          return this.moduleInfo.session.foo;
        }
      }
      const { schema, context } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            testA: String
            testB: String
          }
        `,
        resolvers: {
          Query: {
            testA: (root: never, args: never, { injector }: ModuleContext) => injector.get(ProviderA).test(),
            testB: (root: never, args: never, { injector }: ModuleContext) => injector.get(ProviderB).test()
          }
        },
        providers: [ProviderA, ProviderB]
      });
      const result = await execute({
        schema,
        document: gql`
          query {
            testA
            testB
          }
        `,
        contextValue: testSession
      });
      expect(result.errors).toBeFalsy();
      expect(result.data['testA']).toBe('BAR');
      expect(result.data['testB']).toBe('BAR');
    });
  });
  describe('Extra Schemas', () => {
    it('should handle extraSchemas together with local ones', async () => {
      const extraSchema = makeExecutableSchema({
        typeDefs: gql`
          directive @myDirective on FIELD_DEFINITION
          type Query {
            foo: Foo
          }
          type Foo {
            id: ID
            content: String
          }
        `,
        resolvers: {
          Query: {
            foo: () => ({
              content: 'FOO'
            })
          }
        }
      });
      const { schema, context } = new GraphQLModule({
        typeDefs: gql`
          type Query {
            bar: Bar
          }
          type Bar {
            id: ID @myDirective
            content: String
          }
        `,
        resolvers: {
          Query: {
            bar: () => ({})
          },
          Bar: {
            content: () => 'BAR'
          }
        },
        extraSchemas: [extraSchema]
      });
      const contextValue = await context({ req: {} });
      const result = await execute({
        schema,

        document: gql`
          query {
            foo {
              content
            }
            bar {
              content
            }
          }
        `
      });
      expect(result.errors).toBeFalsy();
      expect(result.data['foo'].content).toBe('FOO');
      expect(result.data['bar'].content).toBe('BAR');
    });
  });
  it('should mutate schema using middleware', async () => {
    const { schema, context } = new GraphQLModule({
      typeDefs: gql`
        type Query {
          isDirty: Boolean
        }
      `,
      resolvers: {
        Query: {
          isDirty: (root, args, context, info) => !!info.schema['__DIRTY__']
        }
      },
      middleware: ({ schema }) => {
        schema['__DIRTY__'] = true;
        return { schema };
      }
    });
    const result = await execute({
      schema,
      document: gql`
        query {
          isDirty
        }
      `,
      contextValue: await context({ req: {} })
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['isDirty']).toBeTruthy();
  });
  it('should encapsulate the schema mutations using middleware', async () => {
    const FooModule = new GraphQLModule({
      typeDefs: gql`
        type Query {
          isDirty: Boolean
        }
      `,
      resolvers: {
        Query: {
          isDirty: (root, args, context, info) => !!info.schema['__DIRTY__']
        }
      },
      middleware: ({ schema }) => {
        schema['__DIRTY__'] = true;
        return { schema };
      }
    });
    const { schema, context } = new GraphQLModule({
      imports: [FooModule]
    });
    const result = await execute({
      schema,
      document: gql`
        query {
          isDirty
        }
      `,
      contextValue: await context({ req: {} })
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['isDirty']).toBeTruthy();
  });
  it('should avoid getting non-configured module', async () => {
    const FOO = Symbol('FOO');
    const moduleA = new GraphQLModule<{ foo: string }>({
      providers: ({ config }) => [
        {
          provide: FOO,
          useValue: config.foo
        }
      ],
      configRequired: true
    });
    const moduleB = new GraphQLModule({
      typeDefs: gql`
        type Query {
          foo: String
        }
      `,
      resolvers: {
        Query: {
          foo: (_, __, { injector }) => injector.get(FOO)
        }
      },
      imports: [moduleA]
    });
    const { schema, context } = new GraphQLModule({
      imports: [
        moduleB,
        moduleA.forRoot({
          foo: 'FOO'
        })
      ]
    });
    const result = await execute({
      schema,
      document: gql`
        query {
          foo
        }
      `,
      contextValue: await context({ req: {} })
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['foo']).toBe('FOO');
  });
  it('should export correct typeDefs and resolvers', async () => {
    const gqlModule = new GraphQLModule({
      imports: [
        new GraphQLModule({
          name: 'test',
          typeDefs: 'type Query { test: Int }',
          resolvers: {
            Query: {
              test: () => 1
            }
          }
        })
      ]
    });

    const typeDefs = gqlModule.typeDefs;
    expect(stripWhitespaces(print(typeDefs))).toBe(stripWhitespaces('type Query { test: Int }'));
    const context = await gqlModule.context({});
    const resolvers = gqlModule.resolvers;
    expect(await resolvers['Query']['test'](null, {}, context, {})).toBe(1);
  });
  it('should resolve scalars correctly', async () => {
    const today = new Date();
    const { schema, context } = new GraphQLModule({
      typeDefs: gql`
        scalar Date
        type Query {
          today: Date
        }
      `,
      resolvers: {
        Date: new GraphQLScalarType({
          name: 'Date',
          description: 'Date custom scalar type',
          parseValue(value) {
            return new Date(value); // value from the client
          },
          serialize(value) {
            return value.getTime(); // value sent to the client
          },
          parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
              return new Date(ast.value); // ast value is always in string format
            }
            return null;
          }
        }),
        Query: {
          today: () => today
        }
      }
    });
    const result = await execute({
      schema,
      document: gql`
        query {
          today
        }
      `,
      contextValue: await context({ req: {} })
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['today']).toBe(today.getTime());
  });
  describe('Apollo DataSources Integration', () => {
    it('Should pass cache correctly to initialize method of application scoped provider', async () => {
      @Injectable()
      class TestDataSourceAPI {
        cache: KeyValueCache;
        initialize({ cache }: { cache: KeyValueCache }) {
          this.cache = cache;
        }
      }
      const testQuery = gql`
        query {
          a {
            f
          }
        }
      `;
      const typesA = [`type A { f: String}`, `type Query { a: A }`];
      const moduleA = new GraphQLModule({
        name: 'A',
        typeDefs: typesA,
        resolvers: {
          Query: { a: () => ({ f: 's' }) }
        },
        context: () => {
          return {
            myField: 'some-value'
          };
        },
        providers: [TestDataSourceAPI]
      });
      const { injector } = new GraphQLModule({ imports: [moduleA] });
      expect(injector.get(TestDataSourceAPI).cache).toBe(moduleA.selfCache);
    });
    it('Should pass context correctly to initialize method of session scoped provider', async () => {
      @Injectable({
        scope: ProviderScope.Session
      })
      class TestDataSourceAPI {
        context: any;
        cache: KeyValueCache;
        public initialize({ context, cache }: { context: any; cache: KeyValueCache }) {
          this.context = context;
          this.cache = cache;
        }
      }
      const testQuery = gql`
        query {
          a {
            f
          }
        }
      `;
      const typesA = [`type Query { myField: String }`];
      const moduleA = new GraphQLModule({
        name: 'A',
        typeDefs: typesA,
        resolvers: {
          Query: { myField: (_, __, { injector }) => injector.get(TestDataSourceAPI).context.myField }
        },
        context: () => {
          return {
            myField: 'some-value'
          };
        },
        providers: [TestDataSourceAPI]
      });
      const { schema } = new GraphQLModule({ imports: [moduleA] });
      const result = await execute({
        schema,
        contextValue: createMockSession(),
        document: gql`
          {
            myField
          }
        `
      });
      expect(await result.data['myField']).toBe('some-value');
    });
  });
  it('should exclude network session', async () => {
    const { schema, context } = new GraphQLModule({
      context: () => ({
        session: { foo: 'BAR' }
        // this session is not request that is internally passed by GraphQLModules
        // this session must be passed instead of Network Session
      }),
      typeDefs: gql`
        type Query {
          foo: String
        }
      `,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context.session.foo;
          }
        }
      }
    });
    // tslint:disable-next-line:no-console
    const result = await execute({
      schema,
      document: gql`
        query {
          foo
        }
      `,
      contextValue: createMockSession({ req: {} })
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['foo']).toBe('BAR');
  });
  it('should import types from submodules', async () => {
    const foo = {
      name: 'FOO',
      get bar() {
        return bar;
      }
    };
    const bar = {
      name: 'BAR',
      foo
    };
    const FooModule = new GraphQLModule({
      typeDefs: gql`
        type Foo {
          name: String
        }
      `
    });
    const BarModule = new GraphQLModule({
      typeDefs: gql`
        extend type Foo {
          bar: Bar
        }
        type Bar {
          name: String
          foo: Foo
        }
        type Query {
          foo: Foo
          bar: Bar
        }
      `,
      imports: [FooModule],
      resolvers: {
        Query: {
          foo: () => foo,
          bar: () => bar
        }
      }
    });
    const { schema, context } = new GraphQLModule({
      imports: [FooModule, BarModule]
    });
    const result = await execute({
      schema,
      document: gql`
        query {
          foo {
            name
          }
          bar {
            name
          }
        }
      `,
      contextValue: await context({ req: {} })
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['foo'].name).toBe('FOO');
    expect(result.data['bar'].name).toBe('BAR');
  });
  it('should work with SchemaLink', async () => {
    const { schema, context } = new GraphQLModule({
      typeDefs: gql`
        type Query {
          foo: String
        }
      `,
      resolvers: {
        Query: {
          foo: () => 'FOO'
        }
      }
    });
    const schemaLink = new SchemaLink({
      schema,
      context
    });
    const apolloClient = new ApolloClient({
      link: schemaLink,
      cache: new InMemoryCache()
    });
    const { data } = await apolloClient.query({
      query: gql`
        {
          foo
        }
      `
    });
    expect(data.foo).toBe('FOO');
  });
  it('should generate schemaless module if an empty array typeDefs specified', async () => {
    const { schema } = new GraphQLModule({
      typeDefs: [],
      resolvers: {}
    });
    expect(schema).toBeNull();
  });
  it('should generate schemaless module if empty string typeDefs specified', async () => {
    const { schema } = new GraphQLModule({
      typeDefs: '',
      resolvers: {}
    });
    expect(schema).toBeNull();
  });
  it('should generate schemaless module if an array with an empty string typeDefs specified', async () => {
    const { schema } = new GraphQLModule({
      typeDefs: [''],
      resolvers: {}
    });
    expect(schema).toBeNull();
  });
  it('should throw an error if promises are used without schemaAsync', async () => {
    const MyAsyncModule = new GraphQLModule({
      typeDefs: async () => `type Query { test: Boolean }`,
      resolvers: async () => ({ Query: { test: () => true } })
    });
    expect(() => MyAsyncModule.schema).toThrow();
  });
  it('should support promises with schemaAsync', async () => {
    const { schemaAsync } = new GraphQLModule({
      typeDefs: async () => `type Query { test: Boolean }`,
      resolvers: async () => ({ Query: { test: () => true } })
    });
    const result = await execute({
      schema: await schemaAsync,
      document: gql`
        query {
          test
        }
      `
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['test']).toBe(true);
  });
  it('should inject ModuleSession in session-scope using properties in case of inheritance', async () => {
    @Injectable()
    class QuxProvider {
      getQux() {
        return 'QUX';
      }
    }

    @Injectable()
    class FooProvider {
      @Inject() moduleSessionInfo: ModuleSessionInfo;
      get request() {
        return this.moduleSessionInfo.session.req;
      }
    }

    @Injectable()
    class BarProvider extends FooProvider {
      @Inject() quxProvider: QuxProvider;
      get authorizationHeader() {
        return this.request.headers.authorization;
      }
      getQux() {
        return this.quxProvider.getQux();
      }
    }

    const { schema } = new GraphQLModule({
      providers: [BarProvider, QuxProvider],
      typeDefs: gql`
        type Query {
          authorization: String
          qux: String
        }
      `,
      resolvers: {
        Query: {
          authorization: (_, __, { injector }) => injector.get(BarProvider).authorizationHeader,
          qux: (_, __, { injector }) => injector.get(BarProvider).getQux()
        }
      }
    });

    const result = await execute({
      schema,
      contextValue: { req: { headers: { authorization: 'Bearer TOKEN' } } },
      document: gql`
        query {
          authorization
          qux
        }
      `
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['authorization']).toBe('Bearer TOKEN');
    expect(result.data['qux']).toBe('QUX');
  });
  it('should not have _onceFinishListeners on response object', async done => {
    let counter = 0;
    @Injectable({
      scope: ProviderScope.Session
    })
    class FooProvider implements OnResponse {
      onResponse() {
        counter++;
      }
      getCounter() {
        return counter;
      }
    }

    const module = new GraphQLModule({
      typeDefs: gql`
        type Query {
          foo: Int
        }
      `,
      resolvers: {
        Query: {
          foo: (_, __, { injector }) => injector.get(FooProvider).getCounter()
        }
      },
      providers: [FooProvider]
    });
    const session = createMockSession({});
    const { data } = await execute({
      schema: module.schema,
      contextValue: session,
      document: gql`
        query {
          foo
        }
      `
    });
    // Result
    expect(data.foo).toBe(0);
    // Before onResponse
    expect(counter).toBe(0);
    await session.res.emit('finish');
    // After onResponse
    expect(counter).toBe(1);
    // Check if the listener is triggered again
    session.res.once('finish', () => {
      setTimeout(() => {
        expect(counter).toBe(1);
        // Response object must be cleared
        expect(session.res['_onceFinishListeners']).toBeUndefined();
        expect(module.injector.hasSessionInjector(session)).toBeFalsy();
        expect(module['_sessionContext$Map'].has(session)).toBeFalsy();
        done();
      }, 1000);
    });
    session.res.emit('finish');
  });
  /*
  it.skip('should not have memory leak over multiple sessions with session-scoped providers', done => {
    @Injectable({
      scope: ProviderScope.Session
    })
    class AProvider {
      constructor(private moduleSessionInfo: ModuleSessionInfo) {}
      getLoadLength() {
        return this.moduleSessionInfo.session.hugeLoad.length;
      }
    }
    const moduleA = new GraphQLModule({
      typeDefs: gql`
        type Query {
          aLoadLength: Int
        }
      `,
      resolvers: {
        Query: {
          aLoadLength: (_, __, { injector }) => injector.get(AProvider).getLoadLength()
        }
      },
      providers: [AProvider]
    });
    @Injectable({
      scope: ProviderScope.Session
    })
    class BProvider {
      constructor(private moduleSessionInfo: ModuleSessionInfo) {}
      getLoadLength() {
        return this.moduleSessionInfo.session.hugeLoad.length;
      }
      getB() {
        return 'B';
      }
    }
    const moduleB = new GraphQLModule({
      typeDefs: gql`
        type Query {
          aLoadLength: Int
        }
      `,
      resolvers: {
        Query: {
          bLoadLength: (_, __, { injector }) => injector.get(BProvider).getLoadLength()
        }
      },
      providers: [BProvider]
    });
    const { schema } = new GraphQLModule({
      imports: [moduleA, moduleB]
    });

    let counter = 0;
    iterate
      .async(async () => {
        // tslint:disable-next-line: no-console
        console.log(`Iteration: ${counter} start`);
        await execute({
          schema,
          contextValue: {
            hugeLoad: new Array(1000).fill(1000)
          },
          document: gql`
            {
              aLoadLength
              bLoadLength
            }
          `
        });
        // tslint:disable-next-line: no-console
        console.log(`Iteration: ${counter} end`);
        counter++;
      })
      .then(done)
      .catch(done.fail);
  });
  it.skip('should not memory leak over multiple sessions (not collected by GC but emitting finish event) with session-scoped providers', done => {
    let counter = 0;
    @Injectable({
      scope: ProviderScope.Session
    })
    class AProvider {
      aHugeLoad = new Array(1000).fill(1000);

      constructor(private moduleSessionInfo: ModuleSessionInfo) {
        counter++;
      }
      getLoadLength() {
        return this.moduleSessionInfo.session.hugeLoad.length;
      }
      getALoadLength() {
        return this.aHugeLoad.length;
      }
    }
    const moduleA = new GraphQLModule({
      typeDefs: gql`
        type Query {
          aLoadLength: Int
          abLoadLength: Int
        }
      `,
      resolvers: {
        Query: {
          aLoadLength: (_, __, { injector }) => injector.get(AProvider).getALoadLength(),
          abLoadLength: (_, __, { injector }) => injector.get(AProvider).getLoadLength()
        }
      },
      providers: [AProvider]
    });
    @Injectable({
      scope: ProviderScope.Session
    })
    class BProvider {
      bHugeLoad = new Array(1000).fill(1000);
      constructor(private moduleSessionInfo: ModuleSessionInfo) {}
      getLoadLength() {
        return this.moduleSessionInfo.session.hugeLoad.length;
      }
      getBLoadLength() {
        return this.bHugeLoad.length;
      }
    }
    const moduleB = new GraphQLModule({
      typeDefs: gql`
        type Query {
          bLoadLength: Int
          baLoadLength: Int
        }
      `,
      resolvers: {
        Query: {
          bLoadLength: (_, __, { injector }) => injector.get(BProvider).getBLoadLength(),
          baLoadLength: (_, __, { injector }) => injector.get(BProvider).getLoadLength()
        }
      },
      providers: [BProvider]
    });
    const { schema } = new GraphQLModule({
      imports: [moduleA, moduleB]
    });
    const mockRequests: Array<MockSession<{ hugeLoad: number[] }>> = [];
    for (let i = 0; i < 1000; i++) {
      mockRequests.push(createMockSession({ hugeLoad: new Array(1000).fill(1000) }));
    }
    iterate
      .async(
        () =>
          new Promise(async resolve => {
            // tslint:disable-next-line: no-console
            console.log(`Iteration started`);
            const mockRequest = mockRequests[Math.floor(Math.random() * mockRequests.length)];
            const { data } = await execute({
              schema,
              contextValue: mockRequest,
              document: gql`
                {
                  aLoadLength
                  bLoadLength
                  abLoadLength
                  baLoadLength
                }
              `
            });
            mockRequest.res.emit('finish');
            expect(data.aLoadLength).toBe(1000);
            expect(data.bLoadLength).toBe(1000);
            expect(data.abLoadLength).toBe(1000);
            expect(data.baLoadLength).toBe(1000);
            // tslint:disable-next-line: no-console
            console.log(counter);
            resolve();
          })
      )
      .then(() => {
        done();
      })
      .catch(done.fail);
  });
*/
  it(`make sure it won't crash on deeply nested structure`, () => {
    const num = 30;

    const AuthModule = new GraphQLModule({
      name: 'AuthModule',
      typeDefs: gql`
        directive @access(roles: [String]) on FIELD_DEFINITION
      `
    });

    const BaseModule = new GraphQLModule({
      name: 'BaseModule',
      typeDefs: gql`
        type Query {
          test: Boolean @access(roles: ["Admin"])
        }
      `,
      imports: [AuthModule]
    });

    const AppModule = new Array(num).fill(0).reduce<GraphQLModule>((Module, _value, index) => {
      const name = `Module${index}`;

      return new GraphQLModule({
        name,
        imports: [BaseModule, Module]
      });
    }, BaseModule);

    print(AppModule.typeDefs);
  });
  it('should support resolveType resolver for union types', async () => {
    const ArtistModule = new GraphQLModule({
      typeDefs: /* GraphQL */ `
        type Artist {
          name: String
          genre: String
        }
      `
    });
    const VenueModule = new GraphQLModule({
      typeDefs: /* GraphQL */ `
        type Venue {
          name: String
          address: String
        }
      `
    });
    const ConcertModule = new GraphQLModule({
      imports: [ArtistModule, VenueModule],
      typeDefs: /* GraphQL */ `
        type Concert {
          id: ID!
          date: String
          organiser: Organiser
        }

        union Organiser = Artist | Venue

        type Query {
          featuredConcert: Concert!
        }
      `,
      resolvers: {
        Organiser: {
          __resolveType: root => (root.type === 'artist' ? 'Artist' : 'Venue')
        },
        Query: {
          featuredConcert: () => ({
            id: 1,
            datetime: '2019-08-10T19:42:43Z',
            organiser: {
              id: 1,
              name: 'Birdland Jazz Club',
              address: '533 Peachtree Place',
              type: 'venue'
            }
          })
        }
      }
    });

    const { schema } = new GraphQLModule({
      imports: [ArtistModule, VenueModule, ConcertModule]
    });

    const result = await execute({
      schema,
      document: parse(/* GraphQL */ `
        {
          featuredConcert {
            organiser {
              ... on Venue {
                name
                address
              }
              ... on Artist {
                name
                genre
              }
            }
          }
        }
      `)
    });

    expect(result.errors).toBeFalsy();
    expect(result.data['featuredConcert']).toBeTruthy();
    expect(result.data['featuredConcert']['organiser']).toBeTruthy();
    expect(result.data['featuredConcert']['organiser']['address']).toBe('533 Peachtree Place');
  });
  it('should support isTypeOf resolver for union types', async () => {
    const ArtistModule = new GraphQLModule({
      typeDefs: /* GraphQL */ `
        type Artist {
          name: String
          genre: String
        }
      `,
      resolvers: {
        Artist: {
          __isTypeOf: root => root.type === 'artist'
        }
      }
    });
    const VenueModule = new GraphQLModule({
      typeDefs: /* GraphQL */ `
        type Venue {
          name: String
          address: String
        }
      `,
      resolvers: {
        Venue: {
          __isTypeOf: root => root.type === 'venue'
        }
      }
    });
    const ConcertModule = new GraphQLModule({
      imports: [ArtistModule, VenueModule],
      typeDefs: /* GraphQL */ `
        type Concert {
          id: ID!
          date: String
          organiser: Organiser
        }

        union Organiser = Artist | Venue

        type Query {
          featuredConcert: Concert!
        }
      `,
      resolvers: {
        Query: {
          featuredConcert: () => ({
            id: 1,
            datetime: '2019-08-10T19:42:43Z',
            organiser: {
              id: 1,
              name: 'Birdland Jazz Club',
              address: '533 Peachtree Place',
              type: 'venue'
            }
          })
        }
      }
    });

    const { schema } = new GraphQLModule({
      imports: [ArtistModule, VenueModule, ConcertModule]
    });

    const result = await execute({
      schema,
      document: parse(/* GraphQL */ `
        {
          featuredConcert {
            organiser {
              ... on Venue {
                name
                address
              }
              ... on Artist {
                name
                genre
              }
            }
          }
        }
      `)
    });

    expect(result.errors).toBeFalsy();
    expect(result.data['featuredConcert']).toBeTruthy();
    expect(result.data['featuredConcert']['organiser']).toBeTruthy();
    expect(result.data['featuredConcert']['organiser']['address']).toBe('533 Peachtree Place');
  });

  it('should assign resolver to the type definition of child module', async () => {
    const FooModule = new GraphQLModule({
      typeDefs: /* GraphQL */ `
        type Foo {
          foo: String!
        }
      `
    });
    const BarModule = new GraphQLModule({
      imports: [FooModule],
      resolvers: {
        Foo: {
          foo: () => 'bar'
        }
      }
    });
    const { schema } = new GraphQLModule({
      imports: [BarModule],
      typeDefs: /* GraphQL */ `
        type Query {
          foo: Foo
        }
      `,
      resolvers: {
        Query: {
          foo: () => ({})
        }
      }
    });

    const result = await execute({
      schema,
      document: parse(/* GraphQL */ `
        query {
          foo {
            foo
          }
        }
      `)
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['foo']).toBeTruthy();
    expect(result.data['foo']['foo']).toBe('bar');
  });
  it('should mock context properly', async () => {
    const AuthModule = new GraphQLModule({
      typeDefs: gql`
    type User {
      id: String
    }
  `,
      resolvers: {
        User: {
          id: user => user.id
        }
      },
      context: req => {
        // This is the "real" implementation
        return {
          user: {
            id: req.headers["User-Id"]
          }
        };
      }
    });

    const AdminModule = new GraphQLModule({
      typeDefs: gql`
    type Query {
      me: User!
    }
  `,
      imports: [AuthModule],
      resolvers: {
        Query: {
          me: (root, args, context) => context.user
        }
      }
    });

    AuthModule.mock({
      contextBuilder: ({ mockId }) => {
        return {
          user: {
            id: mockId
          }
        } as any;
      }
    });

    const result = await execute({
      schema: AdminModule.schema,
      contextValue: {
        mockId: "1"
      },
      document: parse(/* GraphQL */ `
        {
          me {
            id
          }
        }
      `)
    });

    expect(result.data.me.id).toBe("1");
    AuthModule.resetMock();
  })
});
