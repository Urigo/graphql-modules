import 'reflect-metadata';
import { Injectable, Injector } from '../src';
import { iterate } from 'leakage';

describe('Dependency Injection', () => {
  it('clear instances if provider is overwritten', () => {
    iterate(() => {
      @Injectable()
      class FooProvider {
        foo() {
          return 'FOO';
        }
      }
      const injector = new Injector({
        initialProviders: [
          FooProvider,
        ],
      });
      expect(injector.get(FooProvider).foo()).toBe('FOO');
      injector.provide({
        provide: FooProvider,
        overwrite: true,
        useValue: {
          foo() {
            return 'BAR';
          },
        },
      });
      expect(injector.get(FooProvider).foo()).toBe('BAR');
    });
  });
});
