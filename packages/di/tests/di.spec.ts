import 'reflect-metadata';
import { Injectable, Injector, ProviderScope } from '../src';

describe('Dependency Injection', () => {
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

  it('should lazily create providers', async () => {
    const initSpy = jest.fn();

    class Base {
      onRequest() {}
    }

    @Injectable({
      scope: ProviderScope.Session,
    })
    class FooProvider extends Base {
      constructor() {
        super();
        initSpy('foo');
      }

      foo() {
        return 'FOO';
      }
    }

    @Injectable({
      scope: ProviderScope.Session,
    })
    class BarProvider extends Base {
      constructor() {
        super();
        initSpy('bar');
      }

      bar() {
        return 'BAR';
      }
    }

    const injector = new Injector();

    injector.provide(FooProvider);
    injector.provide(BarProvider);

    expect(injector.get(FooProvider).foo()).toBe('FOO');
    expect(initSpy).toHaveBeenCalledTimes(1);
  });
});
