import 'reflect-metadata';
import { GraphQLModule, Injectable } from '../src';
import { stripWhitespaces } from './utils';

describe('GraphQLModule', () => {
  const TEST_TYPES = `type Test { f: String }`;

  it('should create GraphQL Module correctly with basic single file typedef', () => {
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES });

    expect(stripWhitespaces(module._options.typeDefs as string)).toEqual(`type Test { f: String }`);
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

    expect(module.providers.includes(provider)).toBeTruthy();
  });

  it('should set a provider that is a class', () => {
    @Injectable()
    class MyClass {
      foo(): string {
        return 'test';
      }
    }

    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES, providers: [MyClass] });

    expect(module.providers.includes(MyClass)).toBeTruthy();
  });

  it('should set the context builder fn correctly', () => {
    const mockCallback = jest.fn();
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES, contextBuilder: mockCallback });

    expect(module._options.contextBuilder).toBe(mockCallback);
  });
});
