import { Injector, ReflectiveInjector } from '../di/injector';
import { Provider } from '../di/providers';
import { CONTEXT } from '../application/tokens';

export function testInjector(providers: Provider[]): Injector {
  const resolvedProviders = ReflectiveInjector.resolve([
    { provide: CONTEXT, useValue: {} },
    ...providers,
  ]);

  const injector = ReflectiveInjector.createFromResolved({
    name: 'test',
    providers: resolvedProviders,
  });

  injector.instantiateAll();

  return injector;
}
