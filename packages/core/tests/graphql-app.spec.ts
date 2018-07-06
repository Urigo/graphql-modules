import { GraphQLApp, GraphQLModule, IGraphQLContext } from '../src';
import { execute, GraphQLSchema, printSchema } from 'graphql';
import { stripWhitespaces } from './utils';
import gql from 'graphql-tag';

describe('GraphQLApp', () => {
  // A
  interface ModuleAImpl {
    doSomething: () => string;
  }
  const moduleAImpl = { doSomething: () => 'Test' };
  const typesA = [`type A { f: String}`, `type Query { a: A }`];
  const moduleA = new GraphQLModule<ModuleAImpl>({
    name: 'moduleA',
    typeDefs: typesA,
    resolvers: {
      Query: { a: () => ({}) },
      A: { f: (root, args, context) => context.moduleA.doSomething() },
    },
    implementation: moduleAImpl,
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
  const mockOnInit = jest.fn().mockReturnValue({
    test: 1,
  });
  const moduleE = new GraphQLModule({
    name: 'moduleE',
    typeDefs: typesC,
    onInit: mockOnInit,
  });

  // F
  const typeDefsFnMock = jest.fn().mockReturnValue(typesC);
  const resolversFnMock = jest.fn().mockReturnValue({ C: {}});
  const moduleF = new GraphQLModule({
    name: 'moduleF',
    typeDefs: typeDefsFnMock,
    resolvers: resolversFnMock,
    onInit: mockOnInit,
  });

  afterEach(() => {
    mockOnInit.mockClear();
    typeDefsFnMock.mockClear();
    resolversFnMock.mockClear();
  });

  // Queries
  const testQuery = gql`query { b { f }}`;

  it('should return the correct GraphQLSchema', async () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB] });
    await app.init();
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
    const app = new GraphQLApp({ modules: [moduleA, moduleB, moduleC] });
    await app.init();
    const schema = app.schema;
    const context = await app.buildContext();

    const result = await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });

    expect(result.data.b.f).toBe('1');
  });

  it('should work without a GraphQL schema and inject implementation', async () => {
    const impl = {};
    const module = new GraphQLModule<any>({
      name: 'module',
      implementation: impl,
    });
    const app = new GraphQLApp({ modules: [module] });
    await app.init();
    const context = await app.buildContext();
    expect(context.module).toBe(impl);
  });

  it('should inject implementation object into the context using the module name', async () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB, moduleC] });
    await app.init();
    const schema = app.schema;
    const context = await app.buildContext();

    const result = await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });

    expect(result.data.b.f).toBe('1');
  });

  it ('should throw an exception when a contextFn throws an exception', async () => {
    const app = new GraphQLApp({ modules: [moduleD] });
    await app.init();
    const spy = jest.fn();

    await app.buildContext().catch(spy).then(() => expect(spy).toHaveBeenCalled());
  });

  it('should append the correct implementation instances to the context', async () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB, moduleC] });
    await app.init();
    const context = await app.buildContext();

    expect(context['moduleA']).toBe(moduleAImpl);
    expect(context['moduleB']).not.toBeDefined();
    expect(context['moduleC']).not.toBeDefined();
  });

  it('should call the onInit function correctly', async () => {
    const params = { test: true };
    const app = new GraphQLApp({ modules: [moduleE] });
    await app.init(params);

    expect(mockOnInit.mock.calls.length).toBe(1);
    expect(mockOnInit.mock.calls[0][0]).toBe(params);

    const context = await app.buildContext();
    expect(context.initParams).toBe(params);
    expect(context.moduleE).toEqual({
      test: 1
    });
  });

  it('should trigger typedefs functions after onInit function', async () => {
    const params = { test: true };
    const app = new GraphQLApp({ modules: [moduleF] });
    await app.init(params);

    expect(mockOnInit.mock.calls.length).toBe(1);
    expect(mockOnInit.mock.calls[0][0]).toBe(params);
    expect(typeDefsFnMock.mock.calls.length).toBe(1);
    expect(typeDefsFnMock.mock.calls[0][0]).toBe(params);
    expect(typeDefsFnMock.mock.calls[0][1]).toEqual({
      test: 1,
    });
  });

  it('should trigger resolvers functions after onInit function', async () => {
    const params = { test: true };
    const app = new GraphQLApp({ modules: [moduleF] });
    await app.init(params);

    expect(mockOnInit.mock.calls.length).toBe(1);
    expect(mockOnInit.mock.calls[0][0]).toBe(params);
    expect(resolversFnMock.mock.calls.length).toBe(1);
    expect(resolversFnMock.mock.calls[0][0]).toBe(params);
    expect(resolversFnMock.mock.calls[0][1]).toEqual({
      test: 1,
    });
  });

  it('should allow to get resolvers', async () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB, moduleC] });
    await app.init();

    expect(app.resolvers).toBeDefined();
  });

  it('should accept non modules schema and resovlers', async () => {
    const app = new GraphQLApp({ modules: [moduleA], nonModules: { typeDefs: typesB, resolvers: resolversB } });
    await app.init();
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

  it('should expose the current context correctly to the implementation fns', async () => {
    const spy1 = jest.fn();
    const spy2 = jest.fn();
    const impl1 = { doSomething: () => null };
    const impl2 = { doSomething: () => null };
    const types = [`type Query { a: String }`];
    const moduleConfig = { a: 1 };
    const m = new GraphQLModule({
      name: 'module1',
      typeDefs: types,
      resolvers: {
        Query: { a: (root, args, { module }) => module.doSomething() },
      },
      implementation: spy1.mockReturnValue(impl1)
    });
    const m2 = new GraphQLModule({
      name: 'module2',
      typeDefs: types,
      resolvers: {
        Query: { a: (root, args, { module }) => module.doSomething() },
      },
      implementation: spy2.mockReturnValue(impl2)
    });
    const app = new GraphQLApp({ modules: [m, m2.withConfig(moduleConfig)] });
    await app.init();
    const schema = app.schema;
    const context = await app.buildContext();

    await execute({
      schema,
      document: gql`query { a { f }}`,
      contextValue: context,
    });

    expect(spy1.mock.calls[0][1]).toBe(null);
    expect(typeof spy1.mock.calls[0][2].getCurrentContext).toBe('function');
    expect(spy1.mock.calls[0][2].getCurrentContext()).toBe(context);
    expect(spy1.mock.calls[0][0]).toBeDefined();
    expect(spy1.mock.calls[0][0].module1).toBeDefined();
    expect(spy1.mock.calls[0][0].module2).toBeDefined();

    expect(spy2.mock.calls[0][1]).toBe(moduleConfig);
    expect(typeof spy2.mock.calls[0][2].getCurrentContext).toBe('function');
    expect(spy2.mock.calls[0][2].getCurrentContext()).toBe(context);
    expect(spy2.mock.calls[0][0]).toBeDefined();
    expect(spy2.mock.calls[0][0].module1).toBeDefined();
    expect(spy2.mock.calls[0][0].module2).toBeDefined();
  });
});
