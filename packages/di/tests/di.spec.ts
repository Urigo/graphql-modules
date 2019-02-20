import 'reflect-metadata';
import { Injectable, Injector } from '../src';

describe('Dependency Injection', async () => {
  it('clear instances if provider is overwritten', async () => {
    @Injectable()
    class FooProvider {
      foo() {
        return 'FOO';
      }
    }
    const injector = new Injector();
    injector.provide(FooProvider);
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
