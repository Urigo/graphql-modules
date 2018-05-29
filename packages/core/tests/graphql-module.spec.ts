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
      typeDefs: [`type Test { f: String }`, `type Test2 { f: String }`]
    });

    expect(stripWhitespaces(module.typeDefs)).toEqual(stripWhitespaces(`type Test { f: String } type Test2 { f: String }`));
  });

  it('should set the correct implementation module when using simple object', () => {
    interface Impl {
      foo: () => string;
    }

    const impl: Impl = {
      foo: () => 'hi',
    };

    const module = new GraphQLModule<Impl>({ name: 'test', typeDefs: TEST_TYPES, implementation: impl });

    expect(module.implementation).toBe(impl);
  });

  it('should set the correct implementation module when using simple object', () => {
    interface Impl {
      foo: () => string;
    }

    const impl: Impl = {
      foo: () => 'hi',
    };

    const module = new GraphQLModule<Impl>({ name: 'test', typeDefs: TEST_TYPES, implementation: impl });

    expect(module.implementation).toBe(impl);
  });

  it('should set the correct implementation module when using class impl', () => {
    interface Impl {
      foo: () => string;
    }

    class MyClass implements Impl {
      foo(): string {
        return 'test';
      }
    }

    const instance = new MyClass();
    const module = new GraphQLModule<MyClass>({ name: 'test', typeDefs: TEST_TYPES });
    module.setImplementation(instance);

    expect(module.implementation instanceof MyClass).toBeTruthy();
    expect(module.implementation).toBe(instance);
  });

  it('should set the context builder fn correctly', () => {
    const mockCallback = jest.fn();
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES });
    module.setContextBuilder(mockCallback);

    expect(module.contextBuilder).toBe(mockCallback);
  });
});
