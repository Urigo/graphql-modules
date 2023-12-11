import { ModulesMap } from './application.js';
import { ResolvedModule } from '../module/factory.js';
import { ReflectiveInjector, Scope } from '../di/index.js';
import { ResolvedProvider } from '../di/resolution.js';

export function instantiateSingletonProviders({
  appInjector,
  modulesMap,
}: {
  appInjector: ReflectiveInjector;
  modulesMap: ModulesMap;
}) {
  appInjector.instantiateAll();
  modulesMap.forEach((mod) => {
    mod.injector.instantiateAll();
  });
}

export function createGlobalProvidersMap({
  modules,
  scope,
}: {
  modules: ResolvedModule[];
  scope: Scope;
}) {
  const globalProvidersMap: {
    /**
     * Provider key -> Module ID
     */
    [key: string]: string;
  } = {};

  const propType: keyof ResolvedModule =
    scope === Scope.Singleton ? 'singletonProviders' : 'operationProviders';

  modules.forEach((mod) => {
    mod[propType].forEach((provider) => {
      if (provider.factory.isGlobal) {
        const key = provider.key.id;

        if (globalProvidersMap[key]) {
          throw duplicatedGlobalTokenError(provider, [
            mod.id,
            globalProvidersMap[key],
          ]);
        }

        globalProvidersMap[key] = mod.id;
      }
    });
  });

  return globalProvidersMap;
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
