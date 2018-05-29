import { GraphQLApp, GraphQLModule } from '../src';
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
  const moduleB = new GraphQLModule({
    name: 'moduleB',
    typeDefs: typesB,
    resolvers: {
      Query: { b: () => ({}) },
      B: { f: (root, args, context) => context.user.id },
    },
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

  // Queries
  const testQuery = gql`query { b { f }}`;

  it('should return the correct GraphQLSchema', () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB] });
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
    const schema = app.schema;
    const context = await app.buildContext();

    const result = await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });

    expect(result.data.b.f).toBe('1');
  });

  it('should inject implementation object into the context using the module name', async () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB, moduleC] });
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
    const spy = jest.fn();

    await app.buildContext().catch(spy).then(() => expect(spy).toHaveBeenCalled());
  });

  it('should append the correct implementation instances to the context', async () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB, moduleC] });
    const context = await app.buildContext();

    expect(context['moduleA']).toBe(moduleAImpl);
    expect(context['moduleB']).not.toBeDefined();
    expect(context['moduleC']).not.toBeDefined();
  });
});
