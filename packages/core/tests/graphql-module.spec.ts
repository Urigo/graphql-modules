import 'reflect-metadata';
import { GraphQLModule, ModuleConfig, Inject, CommunicationBridge, EventEmitterCommunicationBridge, OnRequest, ModuleContext } from '../src';
import { execute, GraphQLSchema, printSchema } from 'graphql';
import { stripWhitespaces } from './utils';
import gql from 'graphql-tag';

describe('GraphQLModule', () => {
  // A
  class ProviderA {
    doSomething() {
      return 'Test';
    }
  }
  const typesA = [`type A { f: String}`, `type Query { a: A }`];
  const moduleA = new GraphQLModule({
    typeDefs: typesA,
    resolvers: {
      Query: { a: () => ({}) },
      A: { f: (_root, _args, {injector}: ModuleContext) => injector.get(ProviderA).doSomething() },
    },
    providers: [ProviderA],
  });

  // B
  const typesB = [`type B { f: String}`, `type Query { b: B }`];
  const resolversB = {
    Query: { b: () => ({}) },
    B: { f: (root, args, context) => context.user.id },
  };
  let resolverCompositionCalled = false;
  const moduleB = new GraphQLModule({
    typeDefs: typesB,
    resolvers: resolversB,
    resolversComposition: {
      'B.f': next => async (root, args, context: ModuleContext, info) => {
        if (context.injector && context.injector.get(ModuleConfig(moduleB))) {
          resolverCompositionCalled = true;
        }
        return next(root, args, context, info);
      },
    },
  });

  // C (with context building fn)
  const cContextBuilder = jest.fn(() => ({ user: { id: 1 } }));
  const typesC = [`type C { f: String}`, `type Query { c: C }`];
  const moduleC = new GraphQLModule({
    typeDefs: typesC,
    contextBuilder: cContextBuilder,
  });

  // D
  const moduleD = new GraphQLModule({
    typeDefs: typesC,
    contextBuilder: () => {
      throw new Error('oops');
    },
  });

  // E
  const moduleE = new GraphQLModule({
    typeDefs: typesC,
  });

  // F
  const typeDefsFnMock = jest.fn().mockReturnValue(typesC);
  const resolversFnMock = jest.fn().mockReturnValue({ C: {} });
  const moduleF = new GraphQLModule({
    typeDefs: typeDefsFnMock,
    resolvers: resolversFnMock,
  });

  afterEach(() => {
    typeDefsFnMock.mockClear();
    resolversFnMock.mockClear();
  });

  // Queries
  const testQuery = gql`query { b { f }}`;
  const app = new GraphQLModule({ imports:  [moduleA, moduleB, moduleC] });

  it('should return the correct GraphQLSchema', async () => {
    const schema = app.schema;

    expect(schema).toBeDefined();
    expect((schema as any) instanceof GraphQLSchema).toBeTruthy();
    expect(stripWhitespaces(printSchema(schema))).toBe(stripWhitespaces(`
      type A {
        f: String
      }

      type B {
        f: String
      }

      type C {
        f: String
      }

      type Query {
        a: A
        b: B
        c: C
      }`));
  });

  it('should trigger the correct GraphQL context builders and build the correct context', async () => {
    const schema = app.schema;
    const context = await app.context({ req: {} });
    const result = await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });
    expect(result.data.b.f).toBe('1');
  });

  it('should work without a GraphQL schema and set providers', async () => {
    const provider = {};
    const token = Symbol.for('provider');
    const module = new GraphQLModule({
      providers: [{
        provide: token,
        useValue: provider,
      }],
    });
    const {injector} = new GraphQLModule({ imports:  [module] });

    expect(injector.get(token)).toBe(provider);
  });

  it('should inject implementation object into the context using the module name', async () => {
    const schema = app.schema;
    const context = await app.context({ req: {} });

    const result = await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });

    expect(result.data.b.f).toBe('1');
  });

  it('should throw an exception when a contextFn throws an exception', async () => {
    const app = new GraphQLModule({  imports:  [moduleD] });
    const spy = jest.fn();

    await app.context({ req: {} }).catch(spy).then(() => expect(spy).toHaveBeenCalled());
  });

  it('should put the correct providers to the injector', async () => {

    expect(app.injector.get(ProviderA) instanceof ProviderA).toBe(true);
  });

  it('should allow to get schema', async () => {

    expect(app.schema).toBeDefined();
  });

  describe('Schema merging', () => {
    it('should merge types and directives correctly', async () => {
      const m1 = new GraphQLModule({
        typeDefs: [
          `directive @entity on OBJECT`,
          `directive @field on FIELD_DEFINITION`,
          `type A @entity { f: String }`,
          `type Query { a: A }`,
        ],
      });
      const m2 = new GraphQLModule({
        typeDefs: [
          `directive @entity on OBJECT`,
          `directive @field on FIELD_DEFINITION`,
          `type A @entity { f: String @field }`,
          `type Query { a: A }`,
        ],
      });

      const app = new GraphQLModule({
        imports:  [m1, m2],
      });

      const aFields = app.schema.getTypeMap()['A']['getFields']();
      const node = aFields['f'].astNode;
      expect(node.directives.length).toBe(1);
    });
  });

  describe('Module Dependencies', () => {
    it('should init modules in the right order', async () => {
      let counter = 0;
      class Provider1 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      class Provider2 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      const module1 = new GraphQLModule({ imports:  () => [module2], providers: [Provider1] });
      const module2 = new GraphQLModule({ providers: [Provider2] });
      const { injector } = new GraphQLModule({ imports:  [module2, module1] });
      expect(injector.get(Provider1).count).toEqual(1);
      expect(injector.get(Provider2).count).toEqual(0);
      expect(counter).toEqual(2);
    });

    // it('should init modules in the right order with multiple circular dependencies', async () => {
    //   let counter = 0;
    //
    //   class Provider1 {
    //     count: number;
    //     constructor() {
    //       this.count = counter++;
    //     }
    //   }
    //
    //   class Provider2 {
    //     count: number;
    //     constructor() {
    //       this.count = counter++;
    //     }
    //   }
    //
    //   class Provider3 {
    //     count: number;
    //     constructor() {
    //       this.count = counter++;
    //     }
    //   }
    //   const module1 = new GraphQLModule({ imports: () => [module2], providers: [Provider1] });
    //   const module2 = new GraphQLModule({  imports: () => [module1], providers: [Provider2] });
    //   const module3 = new GraphQLModule({ imports:  () => [module1], providers: [Provider3] });
    //   const {injector} = new GraphQLModule({ imports:  [module2, module1, module3] });
    //   expect(injector.get(Provider1).count).toEqual(1);
    //   expect(injector.get(Provider2).count).toEqual(0);
    //   expect(counter).toEqual(3);
    // });

    // it('should init modules in the right order with 2 circular dependencies', async () => {
    //   let counter = 0;
    //   @Injectable()
    //   class Provider1 {
    //     count: number;
    //     constructor() {
    //       this.count = counter++;
    //     }
    //   }
    //   @Injectable()
    //   class Provider2 {
    //     count: number;
    //     constructor() {
    //       this.count = counter++;
    //     }
    //   }
    //   const module1 = new GraphQLModule({ imports: () => [module2], providers: [Provider1] });
    //   const module2 = new GraphQLModule({ () => [module1], providers: [Provider2] });
    //   const {injector} = new GraphQLModule({ imports:  [module2, module1] });

    //   expect(injector.get(Provider1).count).toEqual(1);
    //   expect(injector.get(Provider2).count).toEqual(0);
    //   expect(counter).toEqual(2);
    // });

    it('should set config per each module', async () => {

      interface IModuleConfig {
        test: number;
      }

      const module1 = new GraphQLModule({ imports: () => [module2], providers: () => [Provider1] }).forRoot({test: 1});
      const module2 = new GraphQLModule({ providers: () => [Provider2] }).forRoot({test: 2});

      class Provider1 {
        test: number;
        constructor(@Inject(ModuleConfig(module1)) config: IModuleConfig) {
          this.test = config.test;
        }
      }
      class Provider2 {
        test: number;
        constructor(@Inject(ModuleConfig(module2)) config: IModuleConfig) {
          this.test = config.test;
        }
      }
      const {injector} = new GraphQLModule({ imports:  [module2, module1] });

      expect(injector.get(Provider1).test).toEqual(1);
      expect(injector.get(Provider2).test).toEqual(2);
    });
    it('should set CommunicationBridge correctly', async () => {
      const communicationBridge = new EventEmitterCommunicationBridge();
      const {injector} = new GraphQLModule({
        providers: [
          {
            provide: CommunicationBridge,
            useValue: communicationBridge,
          },
        ],
      });
      expect(injector.get(CommunicationBridge) === communicationBridge).toBeTruthy();
    });
    it('should call onRequest hook on each request', async () => {
      let counter = 0;
      class FooProvider implements OnRequest {
        onRequest() {
          counter++;
        }
      }
      const { context } = new GraphQLModule({
        providers: [
          FooProvider,
        ],
      });
      await context({});
      expect(counter).toEqual(1);
      await context({});
      expect(counter).toEqual(2);
    });

    it('should pass network request to onRequest hook', async () => {
      const fooRequest = {};
      class FooProvider implements OnRequest {
        onRequest(request) {
          expect(request).toBe(fooRequest);
        }
      }
      const { context } = new GraphQLModule({
        providers: [
          FooProvider,
        ],
      });
      await context(fooRequest);
    });

    it('should call resolvers composition with module context', async () => {
      const schema = app.schema;
      const context = await app.context({ req: {} });
      const result = await execute({
        schema,
        document: testQuery,
        contextValue: context,
      });
      expect(resolverCompositionCalled).toBe(true);
    });
  });
});
