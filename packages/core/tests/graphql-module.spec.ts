import 'reflect-metadata';
import { GraphQLModule, Injectable } from '../src';
import { stripWhitespaces } from './utils';

describe('GraphQLModule', () => {
  const TEST_TYPES = `type Test { f: String }`;

  it('should create GraphQL Module correctly with basic single file typedef', () => {
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES });

    expect(stripWhitespaces(module.options.typeDefs as string)).toEqual(`type Test { f: String }`);
  });

  it('should set the context builder fn correctly', () => {
    const mockCallback = jest.fn();
    const module = new GraphQLModule({ name: 'test', typeDefs: TEST_TYPES, contextBuilder: mockCallback });

    expect(module.options.contextBuilder).toBe(mockCallback);
  });
});
