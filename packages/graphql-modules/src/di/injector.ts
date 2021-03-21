import { Type, InjectionToken, Provider } from './providers';
import {
  ResolvedProvider,
  resolveProviders,
  Dependency,
  GlobalProviderMap,
} from './resolution';
import { Key } from './registry';
import {
  noProviderError,
  cyclicDependencyError,
  instantiationError,
} from './errors';
import { ExecutionContext } from './decorators';

const _THROW_IF_NOT_FOUND = new Object();
const UNDEFINED = new Object();
const NOT_FOUND = new Object();

function notInExecutionContext(): never {
  throw new Error('Not in execution context');
}

type ExecutionContextGetter = () => ExecutionContext | never;

// Publicly available Injector.
// We use ReflectiveInjector everywhere
// but we don't want to leak its API to everyone
export abstract class Injector {
  abstract get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: any): T;
}

export class ReflectiveInjector implements Injector {
  displayName: string;
  _constructionCounter: number = 0;
  _providers: ResolvedProvider[];
  _globalProvidersMap: GlobalProviderMap;

  private _executionContextGetter: ExecutionContextGetter = notInExecutionContext;
  private _fallbackParent: Injector | null;
  private _parent: Injector | null;
  private _size: number;
  // private _keyIds: number[];
  // private _objs: any[];
  private _registry: {
    [key: number]: any;
  } = {};
  private _providersRegistry: {
    [key: number]: ResolvedProvider;
  } = {};

  constructor({
    name,
    providers,
    parent,
    fallbackParent,
    globalProvidersMap = new Map(),
  }: {
    name: string;
    proxy?: boolean;
    providers: ResolvedProvider[];
    parent?: Injector | null;
    fallbackParent?: Injector | null;
    globalProvidersMap?: GlobalProviderMap;
  }) {
    this.displayName = name;
    this._parent = parent || null;
    this._fallbackParent = fallbackParent || null;
    this._providers = providers;
    this._globalProvidersMap = globalProvidersMap;

    this._size = this._providers.length;

    for (let i = 0; i < this._size; i++) {
      this._registry[this._providers[i].key.id] = UNDEFINED;
      this._providersRegistry[this._providers[i].key.id] = this._providers[i];
    }
  }

  static createFromResolved({
    name,
    providers,
    parent,
    fallbackParent,
    globalProvidersMap,
  }: {
    name: string;
    providers: ResolvedProvider[];
    parent?: Injector;
    fallbackParent?: Injector;
    globalProvidersMap?: GlobalProviderMap;
  }) {
    return new ReflectiveInjector({
      name,
      providers,
      parent,
      fallbackParent,
      globalProvidersMap,
    });
  }

  static resolve(providers: Provider[]) {
    return resolveProviders(providers);
  }

  get parent(): Injector | null {
    return this._parent;
  }

  get fallbackParent(): Injector | null {
    return this._fallbackParent;
  }

  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    return this._getByKey(Key.get(token), notFoundValue);
  }

  setExecutionContextGetter(getter: ExecutionContextGetter) {
    this._executionContextGetter = getter;
  }

  private _getByKey(key: Key, notFoundValue: any): any {
    let inj: Injector | null = this;

    function getObj() {
      while (inj instanceof ReflectiveInjector) {
        const inj_ = inj as ReflectiveInjector;
        const obj = inj_._getObjByKeyId(key.id);

        if (obj !== UNDEFINED) {
          return obj;
        }

        inj = inj_._parent;
      }

      return NOT_FOUND;
    }

    const resolvedValue = getObj();

    if (resolvedValue !== NOT_FOUND) {
      return resolvedValue;
    }

    // search in fallback Injector
    if (this._fallbackParent) {
      inj = this._fallbackParent;

      const resolvedFallbackValue = getObj();

      if (resolvedFallbackValue !== NOT_FOUND) {
        return resolvedFallbackValue;
      }
    }

    if (inj !== null) {
      return inj.get(key.token, notFoundValue);
    }

    return this._throwOrNull(key, notFoundValue);
  }

  _isObjectDefinedByKeyId(keyId: number): boolean {
    if (this._registry.hasOwnProperty(keyId)) {
      return this._registry[keyId] !== UNDEFINED;
    }

    return false;
  }

  _getObjByKeyId(keyId: number): any {
    if (this._globalProvidersMap?.has(keyId)) {
      return this._globalProvidersMap.get(keyId)?._getObjByKeyId(keyId);
    }

    if (this._registry.hasOwnProperty(keyId)) {
      const obj = this._registry[keyId];

      if (obj === UNDEFINED) {
        this._registry[keyId] = this._new(this._providersRegistry[keyId]);

        return this._registry[keyId];
      }
    }

    return UNDEFINED;
  }

  _throwOrNull(key: Key, notFoundValue: any): any {
    if (notFoundValue !== _THROW_IF_NOT_FOUND) {
      return notFoundValue;
    } else {
      throw noProviderError(this, key);
    }
  }

  instantiateAll() {
    this._providers.forEach((provider) => {
      this._getByKey(provider.key, _THROW_IF_NOT_FOUND);
    });
  }

  private _instantiateProvider(provider: ResolvedProvider): any {
    const factory = provider.factory.factory;

    let deps: any[];
    try {
      deps = provider.factory.dependencies.map((dep) =>
        this._getByDependency(dep)
      );
    } catch (e) {
      if (e.addKey) {
        e.addKey(provider.key);
      }
      throw e;
    }

    let obj: any;
    try {
      obj = factory(...deps);

      // attach execution context getter
      if (provider.factory.executionContextIn.length > 0) {
        for (const prop of provider.factory.executionContextIn) {
          Object.defineProperty(obj, prop, {
            get: () => {
              return this._executionContextGetter();
            },
          });
        }
      }
    } catch (e) {
      throw instantiationError(this, e, provider.key);
    }

    return obj;
  }

  private _getByDependency(dep: Dependency): any {
    return this._getByKey(dep.key, dep.optional ? null : _THROW_IF_NOT_FOUND);
  }

  private _new(provider: ResolvedProvider): any {
    if (this._constructionCounter++ > this._getMaxNumberOfObjects()) {
      throw cyclicDependencyError(this, provider.key);
    }
    return this._instantiateProvider(provider);
  }

  private _getMaxNumberOfObjects(): number {
    return this._size;
  }

  toString(): string {
    return this.displayName;
  }
}
