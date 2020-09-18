import { ResolvedModule } from '../module/factory';
import { ReflectiveInjector } from '../di';

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
        singletonGlobalProvidersMap[provider.key.id] = mod.id;
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
