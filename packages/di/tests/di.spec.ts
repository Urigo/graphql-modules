import 'reflect-metadata';
import { Injectable, Injector, ProviderScope } from '../src';
import { iterate } from 'leakage';

describe('Dependency Injection', () => {
  it('clear instances if provider is overwritten', () => {
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
  it('should not have a memory leak over multiple sessions', () => {
    iterate(() => {
      const injector = new Injector();
      for (let i = 0; i < 3; i++) {
        iterate(() => {
          const session = {};
          injector.getSessionInjector(session);
        });
      }
    });
  });
  it('should not have a memory leak over multiple sessions with a session-scoped provider', () => {
    iterate(() => {
      @Injectable({
        scope: ProviderScope.Session,
      })
      class FooProvider {
        getFoo() {
          return 'FOO';
        }
      }
      const injector = new Injector({
        initialProviders: [
          FooProvider,
        ],
      });
      for (let i = 0; i < 3; i++) {
        iterate(() => {
          const session = {};
          const sessionInjector = injector.getSessionInjector(session);
          sessionInjector.get(FooProvider).getFoo();
        });
      }
    });
  });
});
