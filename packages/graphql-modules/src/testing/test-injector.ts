import { Injector, ReflectiveInjector } from '../di/injector';
import { Provider, TypeProvider } from '../di/providers';
import { CONTEXT } from '../application/tokens';
import { readInjectableMetadata } from '../di/metadata';

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

export function readProviderOptions<T>(provider: TypeProvider<T>) {
  return readInjectableMetadata(provider, true).options;
}
