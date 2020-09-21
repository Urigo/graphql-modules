import { ResolvedModule } from '../module/factory';
import { ReflectiveInjector } from '../di';
import { ResolvedProvider } from '../di/resolution';

export function createGlobalProvidersMap({
  modules,
}: {
  modules: ResolvedModule[];
}) {
  const singletonGlobalProvidersMap: {
    /**
     * Provider key -> Module ID
     */
    [key: string]: string;
  } = {};

  modules.forEach((mod) => {
    mod.singletonProviders.forEach((provider) => {
      if (provider.factory.isGlobal) {
        const key = provider.key.id;

        if (singletonGlobalProvidersMap[key]) {
          throw duplicatedGlobalTokenError(provider, [
            mod.id,
            singletonGlobalProvidersMap[key],
          ]);
        }

        singletonGlobalProvidersMap[key] = mod.id;
      }
    });
  });

  return singletonGlobalProvidersMap;
}

export function attachGlobalProvidersMap({
  injector,
  globalProvidersMap,
  moduleInjectorGetter,
}: {
  injector: ReflectiveInjector;
  globalProvidersMap: {
    [key: string]: string;
  };
  moduleInjectorGetter: (moduleId: string) => ReflectiveInjector;
}) {
  injector._globalProvidersMap = {
    has(key) {
      return typeof globalProvidersMap[key] === 'string';
    },
    get(key) {
      return moduleInjectorGetter(globalProvidersMap[key]);
    },
  };
}

export function duplicatedGlobalTokenError(
  provider: ResolvedProvider,
  modules: [string, string]
): Error {
  return Error(
    [
      `Failed to define '${provider.key.displayName}' token as global.`,
      `Token provided by two modules: '${modules.join("', '")}'`,
    ].join(' ')
  );
}
