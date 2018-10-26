import 'reflect-metadata';
import { GraphQLModule, ModuleConfig, Injectable, Inject, AppInfo, CommunicationBridge, EventEmitterCommunicationBridge } from '../src';
import { execute, GraphQLSchema, printSchema } from 'graphql';
import { stripWhitespaces } from './utils';
import gql from 'graphql-tag';

describe('GraphQLAppModule', () => {
  // A
  @Injectable()
  class ProviderA {
    doSomething() {
      return 'Test';
    }
  }
  const typesA = [`type A { f: String}`, `type Query { a: A }`];
  const moduleA = new GraphQLModule({
    name: 'moduleA',
    typeDefs: typesA,
    resolvers: {
      Query: { a: () => ({}) },
      A: { f: (root, args, context) => context.injector.get(ProviderA).doSomething() },
    },
    providers: [ProviderA],
  });

  // B
  const typesB = [`type B { f: String}`, `type Query { b: B }`];
  const resolversB = {
    Query: { b: () => ({}) },
    B: { f: (root, args, context) => context.user.id },
  };
  const moduleB = new GraphQLModule({
    name: 'moduleB',
    typeDefs: typesB,
    resolvers: resolversB,
  });

  // C (with context building fn)
  const cContextBuilder = jest.fn(() => ({ user: { id: 1 } }));
  const typesC = [`type C { f: String}`, `type Query { c: C }`];
  const moduleC = new GraphQLModule({
    name: 'moduleC',
    typeDefs: typesC,
    contextBuilder: cContextBuilder,
  });

  // D
  const moduleD = new GraphQLModule({
    name: 'moduleD',
    typeDefs: typesC,
    contextBuilder: () => {
      throw new Error('oops');
    },
  });

  // E
  const moduleE = new GraphQLModule({
    name: 'moduleE',
    typeDefs: typesC,
  });

  // F
  const typeDefsFnMock = jest.fn().mockReturnValue(typesC);
  const resolversFnMock = jest.fn().mockReturnValue({ C: {} });
  const moduleF = new GraphQLModule({
    name: 'moduleF',
    typeDefs: typeDefsFnMock,
    resolvers: resolversFnMock,
  });

  afterEach(() => {
    typeDefsFnMock.mockClear();
    resolversFnMock.mockClear();
  });

  // Queries
  const testQuery = gql`query { b { f }}`;

  it('should return the correct GraphQLSchema', async () => {
    const app = new GraphQLModule({ name: 'app', imports:  [moduleA, moduleB] });
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

      type Query {
        a: A
        b: B
      }`));
  });

  it('should trigger the correct GraphQL context builders and build the correct context', async () => {
    const app = new GraphQLModule({ name: 'app', imports:  [moduleA, moduleB, moduleC] });
    const schema = app.schema;
    const context = await app.context({ req: {} });

    const result = await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });

    expect(result.data.b.f).toBe('1');
  });

  it('should provide network request to AppInfo', async () => {
    const app = new GraphQLModule({ name: 'app', imports:  [moduleA, moduleB, moduleC] });
    const request = {};
    const context = await app.context(request);

    expect(context.injector.get(AppInfo).getRequest()).toBe(request);
  });

  it('should work without a GraphQL schema and set providers', async () => {
    const provider = {};
    const token = Symbol.for('provider');
    const module = new GraphQLModule({
      name: 'module',
      providers: [{
        provide: token,
        useValue: provider,
      }],
    });
    const app = new GraphQLModule({ name: 'app', imports:  [module] });
    const context = await app.context({ req: {} });

    expect(context.injector.get(token)).toBe(provider);
  });

  it('should inject implementation object into the context using the module name', async () => {
    const app = new GraphQLModule({ name: 'app', imports:  [moduleA, moduleB, moduleC] });
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
    const app = new GraphQLModule({ name: 'app', imports:  [moduleD] });
    const spy = jest.fn();

    await app.context({ req: {} }).catch(spy).then(() => expect(spy).toHaveBeenCalled());
  });

  it('should put the correct providers to the injector', async () => {
    const app = new GraphQLModule({ name: 'app', imports:  [moduleA, moduleB, moduleC] });
    const { injector } = await app.context({ req: {} });

    expect(injector.get(ProviderA) instanceof ProviderA).toBe(true);
  });

  it('should allow to get resolvers', async () => {
    const app = new GraphQLModule({ name: 'app', imports:  [moduleA, moduleB, moduleC] });

    expect(app.resolvers).toBeDefined();
  });

  describe('Schema merging', () => {
    it('should merge types and directives correctly', async () => {
      const m1 = new GraphQLModule({
        name: 'm1',
        typeDefs: [
          `directive @entity on OBJECT`,
          `directive @field on FIELD_DEFINITION`,
          `type A @entity { f: String }`,
          `type Query { a: A }`,
        ],
      });
      const m2 = new GraphQLModule({
        name: 'm2',
        typeDefs: [
          `directive @entity on OBJECT`,
          `directive @field on FIELD_DEFINITION`,
          `type A @entity { f: String @field }`,
          `type Query { a: A }`,
        ],
      });

      const app = new GraphQLModule({
        name: 'app',
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
      @Injectable()
      class Provider1 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      @Injectable()
      class Provider2 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      const module1 = new GraphQLModule({ name: '1', imports:  ['2'], providers: [Provider1] });
      const module2 = new GraphQLModule({ name: '2', providers: [Provider2] });
      const { injector } = new GraphQLModule({ name: 'app', imports:  [module2, module1] });
      expect(injector.get(Provider1).count).toEqual(1);
      expect(injector.get(Provider2).count).toEqual(0);
      expect(counter).toEqual(2);
    });

    it('should init modules in the right order with multiple circular dependencies', async () => {
      let counter = 0;
      @Injectable()
      class Provider1 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      @Injectable()
      class Provider2 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      @Injectable()
      class Provider3 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      const module1 = new GraphQLModule({ name: '1', imports:  ['2'], providers: [Provider1] });
      const module2 = new GraphQLModule({ name: '2', imports:  ['1'], providers: [Provider2] });
      const module3 = new GraphQLModule({ name: '3', imports:  ['1'], providers: [Provider3] });
      const {injector} = new GraphQLModule({ name: 'app', imports:  [module2, module1, module3] });
      expect(injector.get(Provider1).count).toEqual(1);
      expect(injector.get(Provider2).count).toEqual(0);
      expect(counter).toEqual(3);
    });

    it('should init modules in the right order with 2 circular dependencies', async () => {
      let counter = 0;
      @Injectable()
      class Provider1 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      @Injectable()
      class Provider2 {
        count: number;
        constructor() {
          this.count = counter++;
        }
      }
      const module1 = new GraphQLModule({ name: '1', imports:  ['2'], providers: [Provider1] });
      const module2 = new GraphQLModule({ name: '2', imports:  ['1'], providers: [Provider2] });
      const {injector} = new GraphQLModule({ name: 'app', imports:  [module2, module1] });

      expect(injector.get(Provider1).count).toEqual(1);
      expect(injector.get(Provider2).count).toEqual(0);
      expect(counter).toEqual(2);
    });

    it('should set config per each module', async () => {

      interface IModuleConfig {
        test: number;
      }

      @Injectable()
      class Provider1 {
        test: number;
        constructor(@Inject(ModuleConfig('1')) config: IModuleConfig) {
          this.test = config.test;
        }
      }
      @Injectable()
      class Provider2 {
        test: number;
        constructor(@Inject(ModuleConfig('2')) config: IModuleConfig) {
          this.test = config.test;
        }
      }
      const module1 = new GraphQLModule({ name: '1', imports:  ['2'], providers: [Provider1] }).withConfig({test: 1});
      const module2 = new GraphQLModule({ name: '2', providers: [Provider2] }).withConfig({test: 2});
      const {injector} = new GraphQLModule({ name: 'app', imports:  [module2, module1] });

      expect(injector.get(Provider1).test).toEqual(1);
      expect(injector.get(Provider2).test).toEqual(2);
    });
    it('should set CommunicationBridge correctly', async () => {
      const communicationBridge = new EventEmitterCommunicationBridge();
      const {injector} = new GraphQLModule({
        name: 'app',
        providers: [
          {
            provide: CommunicationBridge,
            useValue: communicationBridge,
          },
        ],
      });
      expect(injector.get(CommunicationBridge) === communicationBridge).toBeTruthy();
    });
  });
});
