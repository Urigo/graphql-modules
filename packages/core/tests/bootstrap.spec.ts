import {bootstrapModules, createGraphQLModule} from '../src';

describe('bootstrapModules', () => {
  const moduleA = createGraphQLModule({name: 'testA', types: `type A { f: String } type Query { a: String }`});
  const moduleB = createGraphQLModule({name: 'testB', types: `type B { f: String } type Query { b: String }`});

  it('should create the correct schema object', () => {
    const app = bootstrapModules([moduleA, moduleB]);
    const schema = app.getSchema();

    expect(schema).toBeDefined();
    expect(schema.getTypeMap()['A']).toBeDefined();
    expect(schema.getTypeMap()['B']).toBeDefined();
  });
});
