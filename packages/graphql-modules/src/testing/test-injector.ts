import { Injector, ReflectiveInjector } from '../di/injector.js';
import { Provider, TypeProvider } from '../di/providers.js';
import { CONTEXT } from '../application/tokens.js';
import { readInjectableMetadata } from '../di/metadata.js';

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
