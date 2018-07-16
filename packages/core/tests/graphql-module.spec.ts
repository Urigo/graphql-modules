import 'reflect-metadata';
import { GraphQLModule } from '../src';
import { stripWhitespaces } from './utils';

describe('GraphQLModule', () => {
  const TEST_TYPES = `type Test { f: String }`;

  it('should create GraphQL Module correctly with basic single file typedef', () => {
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES });

    expect(module.typeDefs).toEqual(`type Test { f: String }`);
  });

  it('should create GraphQL Module correctly with basic multiple files typedef', () => {
    const module = new GraphQLModule({
      name: 'test',
      typeDefs: [`type Test { f: String }`, `type Test2 { f: String }`],
    });

    expect(stripWhitespaces(module.typeDefs)).toEqual(stripWhitespaces(`type Test { f: String } type Test2 { f: String }`));
  });

  it('should not use typedefs when typedefs are a function', () => {
    const module = new GraphQLModule({
      name: 'test',
      typeDefs: () => [`type Test { f: String }`, `type Test2 { f: String }`],
    });

    expect(module.typeDefs).toBeNull();
  });

  it('should set a provider that is an object', () => {
    const token = Symbol.for('sampleProvider');
    const sampleProvider = {
      foo: () => 'hi',
    };
    const provider = {
      provide: token,
      useValue: sampleProvider,
    };

    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES, providers: [provider] });

    expect(module.providers[0]).toBe(provider);
  });

  it('should set a provider that is a class', () => {
    class MyClass {
      foo(): string {
        return 'test';
      }
    }

    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES, providers: [MyClass] });

    expect(module.providers[0]).toBe(MyClass);
  });

  it('should set the context builder fn correctly', () => {
    const mockCallback = jest.fn();
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES });
    module.setContextBuilder(mockCallback);

    expect(module.contextBuilder).toBe(mockCallback);
  });
});
