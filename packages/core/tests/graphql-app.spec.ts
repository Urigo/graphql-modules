import { GraphQLApp, GraphQLModule } from '../src';
import { GraphQLSchema, printSchema } from 'graphql';
import { stripWhitespaces } from './utils';

describe('GraphQLApp', () => {
  const typesA = [`type A { f: String}`, `type Query { a: A }`];
  const moduleA = new GraphQLModule('moduleA', typesA);
  const typesB = [`type B { f: String}`, `type Query { b: B }`];
  const moduleB = new GraphQLModule('moduleA', typesB);

  it('should return the correct GraphQLSchema', () => {
    const app = new GraphQLApp({ modules: [moduleA, moduleB] });
    const schema = app.schema;

    expect(schema).toBeDefined();
    expect(schema instanceof GraphQLSchema).toBeTruthy();
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
});
