import { Type, InjectionToken, Provider } from './providers';
import {
  ResolvedProvider,
  ResolvedFactory,
  resolveProviders,
  Dependency,
} from './resolution';
import { Key } from './registry';
import {
  noProviderError,
  cyclicDependencyError,
  instantiationError,
} from './errors';

const _THROW_IF_NOT_FOUND = new Object();
const UNDEFINED = new Object();
const NOT_FOUND = new Object();

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
  _executionContextGetter?: () => any;

  private _fallbackParent: Injector | null;
  private _parent: Injector | null;
  private _instantiated = false;
  private _keyIds: number[];
  private _objs: any[];

  constructor(
    name: string,
    providers: ResolvedProvider[],
    parent?: Injector | null,
    fallbackParent?: Injector | null
  ) {
    this.displayName = name;
    this._parent = parent || null;
    this._fallbackParent = fallbackParent || null;
    this._providers = providers;

    const len = this._providers.length;

    this._keyIds = new Array(len);
    this._objs = new Array(len);

    for (let i = 0; i < len; i++) {
      this._keyIds[i] = this._providers[i].key.id;
      this._objs[i] = UNDEFINED;
    }
  }

  static create(
    name: string,
    providers: Provider[],
    parent?: Injector,
    fallbackParent?: Injector
  ) {
    return new ReflectiveInjector(
      name,
      resolveProviders(providers),
      parent,
      fallbackParent
    );
  }

  static createWithExecutionContext(
    injector: ReflectiveInjector,
    executionContextGetter: () => any
  ) {
    if (!injector._instantiated) {
      throw new Error(
        'Internal: Received Injector is not instantiated. Should call instantiateAll() method.'
      );
    }

    const proxied: number[] = [];
    const providers = injector._providers.map((provider, i) => {
      if (provider.factory.executionContextIn.length) {
        proxied.push(i);

        function proxyFactory() {
          return new Proxy(injector.get(provider.key.token), {
            get(target, propertyKey) {
              if (
                typeof propertyKey !== 'number' &&
                provider.factory.executionContextIn.includes(propertyKey)
              ) {
                return executionContextGetter();
              }

              return target[propertyKey];
            },
          });
        }

        return new ResolvedProvider(
          provider.key,
          new ResolvedFactory(proxyFactory, [], [], false)
        );
      }

      return provider;
    });

    const newInjector = new ReflectiveInjector(
      injector.displayName + ' (Proxy)',
      providers,
      injector.parent,
      injector.fallbackParent
    );

    newInjector._objs = [...injector._objs];

    proxied.forEach((i) => {
      newInjector._objs[i] = UNDEFINED;
    });
    newInjector.instantiateAll();

    return newInjector;
  }

  get parent(): Injector | null {
    return this._parent;
  }

  get fallbackParent(): Injector | null {
    return this._fallbackParent;
  }

  get instantiated() {
    return this._instantiated;
  }

  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    return this._getByKey(Key.get(token), notFoundValue);
  }

  instantiateAll() {
    this._providers.forEach((provider) => {
      this.get(provider.key);
    });
    this._instantiated = true;
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
    for (let i = 0; i < this._keyIds.length; i++) {
      if (this._keyIds[i] === keyId) {
        return this._objs[i] !== UNDEFINED;
      }
    }

    return false;
  }

  _getObjByKeyId(keyId: number): any {
    for (let i = 0; i < this._keyIds.length; i++) {
      if (this._keyIds[i] === keyId) {
        if (this._objs[i] === UNDEFINED) {
          this._objs[i] = this._new(this._providers[i]);
        }

        return this._objs[i];
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

  private _instantiateProvider(provider: ResolvedProvider): any {
    const factory = provider.factory.factory;

    let deps: any[];
    try {
      deps = provider.factory.dependencies.map((dep) =>
        this._getByDependency(dep)
      );
    } catch (e) {
      if (e.addKey) {
        e.addKey(this, provider.key);
      }
      throw e;
    }

    let obj: any;
    try {
      obj = factory(...deps);
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
    return this._objs.length;
  }
}
