import 'reflect-metadata';
import { Injectable, Injector, ProviderScope } from '../src';

describe('Dependency Injection', () => {
  it('clear instances if provider is overwritten', () => {
    @Injectable()
    class FooProvider {
      foo() {
        return 'FOO';
      }
    }
    const injector = new Injector({
      initialProviders: [FooProvider]
    });
    expect(injector.get(FooProvider).foo()).toBe('FOO');
    injector.provide({
      provide: FooProvider,
      overwrite: true,
      useValue: {
        foo() {
          return 'BAR';
        }
      }
    });
    expect(injector.get(FooProvider).foo()).toBe('BAR');
  });
  /*
  it.skip('should not have a memory leak over multiple sessions', () => {
    const injector = new Injector();
    iterate(() => {
      const session = {
        hugeLoad: new Array(1000).fill(1000)
      };
      injector.getSessionInjector(session);
    });
  });
  it.skip('should not have a memory leak over multiple sessions with a session-scoped provider', () => {
    @Injectable({
      scope: ProviderScope.Session
    })
    class FooProvider {
      getFoo() {
        return 'FOO';
      }
    }
    const injector = new Injector({
      initialProviders: [FooProvider]
    });
    iterate(() => {
      const session = {
        hugeLoad: new Array(1000).fill(1000)
      };
      const sessionInjector = injector.getSessionInjector(session);
      sessionInjector.get(FooProvider).getFoo();
    });
  });
  */
});
