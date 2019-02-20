
import { ProviderNotValidError, ServiceIdentifierNotFoundError, DependencyProviderNotFoundError, ProviderAlreadyDefinedError } from './errors';
import { ServiceIdentifier, Type, Provider, ProviderScope, ProviderOptions, Factory } from './types';
import { isTypeProvider, PROVIDER_OPTIONS, isValueProvider, isClassProvider, isFactoryProvider, DESIGN_PARAMTYPES, DESIGN_TYPE, PROPERTY_KEYS } from './utils';

export class Injector {
  private _classMap = new Map<ServiceIdentifier<any>, Type<any>>();
  private _factoryMap = new Map<ServiceIdentifier<any>, Factory<any>>();
  private _instanceMap = new Map<ServiceIdentifier<any>, any>();
  private _applicationScopeServiceIdentifiers = new Array<ServiceIdentifier<any>>();
  private _requestScopeServiceIdentifiers = new Array<ServiceIdentifier<any>>();
  private _sessionScopeServiceIdentifiers = new Array<ServiceIdentifier<any>>();
  constructor(
    private _name = Date.now().toString(),
    private _injectorScope = ProviderScope.Application,
    private _defaultProviderScope = _injectorScope,
    private _children = new Array<Injector>(),
  ) {}
  public addChild(...children: Injector[]) {
    for (const child of children) {
      this._children.push(child);
    }
  }
  public removeChild(...children: Injector[]) {
    for (const child of children) {
      this._children.splice(this._children.indexOf(child), 1);
    }
  }
  public hasChild(child: Injector) {
    return this._children.includes(child);
  }
  public provide<T>(provider: Provider<T>): void {

    if (isTypeProvider(provider)) {
      const options: ProviderOptions = Reflect.getMetadata(PROVIDER_OPTIONS, provider);
      if (this.has(provider)) {
        throw new ProviderAlreadyDefinedError(this._name, provider);
      }
      this._classMap.set(provider, provider);
      switch ((options && options.scope) || this._defaultProviderScope) {
        case ProviderScope.Application:
          this._applicationScopeServiceIdentifiers.push(provider);
        break;
        case ProviderScope.Request:
          this._requestScopeServiceIdentifiers.push(provider);
        break;
        case ProviderScope.Session:
          this._sessionScopeServiceIdentifiers.push(provider);
        break;
      }
      return;
    }

    if (this.has(provider.provide)) {
      if (!provider.overwrite) {
        throw new ProviderAlreadyDefinedError(this._name, provider.provide);
      } else {
        this._classMap.delete(provider.provide);
        this._factoryMap.delete(provider.provide);
        this._instanceMap.delete(provider.provide);
        this._applicationScopeServiceIdentifiers.splice(
          this._applicationScopeServiceIdentifiers.indexOf(provider.provide),
          1,
        );
        this._sessionScopeServiceIdentifiers.splice(
          this._applicationScopeServiceIdentifiers.indexOf(provider.provide),
          1,
        );
        this._requestScopeServiceIdentifiers.splice(
          this._applicationScopeServiceIdentifiers.indexOf(provider.provide),
          1,
        );
      }
    }

    if (isValueProvider(provider)) {
      this._instanceMap.set(provider.provide, provider.useValue);
    } else if (isClassProvider(provider)) {
      this._classMap.set(provider.provide, provider.useClass);
    } else if (isFactoryProvider(provider)) {
      this._factoryMap.set(provider.provide, provider.useFactory);
    } else {
      throw new ProviderNotValidError(this._name, provider['provide'] && provider);
    }

    switch (provider.scope || this._defaultProviderScope) {
      case ProviderScope.Application:
        this._applicationScopeServiceIdentifiers.push(provider.provide);
      break;
      case ProviderScope.Request:
        this._requestScopeServiceIdentifiers.push(provider.provide);
      break;
      case ProviderScope.Session:
        this._sessionScopeServiceIdentifiers.push(provider.provide);
      break;
    }

  }

  public has<T>(serviceIdentifier: ServiceIdentifier<T>): boolean {
    return (
      this._instanceMap.has(serviceIdentifier) ||
      this._classMap.has(serviceIdentifier) ||
      this._factoryMap.has(serviceIdentifier)
    );
  }

  public remove<T>(serviceIdentifier: ServiceIdentifier<T>): void {
    this._instanceMap.delete(serviceIdentifier);
    this._classMap.delete(serviceIdentifier);
    this._factoryMap.delete(serviceIdentifier);
  }

  public get scopeServiceIdentifiers() {
    switch (this._injectorScope) {
      case ProviderScope.Application:
      return this._applicationScopeServiceIdentifiers;
      case ProviderScope.Request:
      return this._requestScopeServiceIdentifiers;
      case ProviderScope.Session:
      return this._sessionScopeServiceIdentifiers;
    }
  }
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
      if (this._instanceMap.has(serviceIdentifier)) {
        return this._instanceMap.get(serviceIdentifier);
      } else if (this._classMap.has(serviceIdentifier)) {
        const RealClazz = this._classMap.get(serviceIdentifier);
        try {
          const dependencies: Array<ServiceIdentifier<any>> = Reflect.getMetadata(DESIGN_PARAMTYPES, RealClazz) || [];
          const dependencyInstances = dependencies.map(dependency => this.get(dependency));
          const instance = new RealClazz(...dependencyInstances);
          const propertyKeys = Reflect.getMetadata(PROPERTY_KEYS, RealClazz) || [];
          for (const propertyKey of propertyKeys) {
            const dependency = Reflect.getMetadata(DESIGN_TYPE, RealClazz.prototype, propertyKey);
            if (dependency) {
              Object.defineProperty(instance, propertyKey, {
                value: this.get(dependency),
              });
            }
          }
          if (this.scopeServiceIdentifiers.includes(serviceIdentifier)) {
            this._instanceMap.set(serviceIdentifier, instance);
          }
          return instance;
        } catch (e) {
          if (e instanceof ServiceIdentifierNotFoundError) {
            throw new DependencyProviderNotFoundError(e.serviceIdentifier, RealClazz, this._name);
          } else {
            throw e;
          }
        }
      } else if (this._factoryMap.has(serviceIdentifier)) {
        const factory = this._factoryMap.get(serviceIdentifier);
        const instance = this.call(factory, this);
        if (this.scopeServiceIdentifiers.includes(serviceIdentifier)) {
          this._instanceMap.set(serviceIdentifier, instance);
        }
        return instance;
      } else {
        for (const child of this._children) {
          try {
            return child.get(serviceIdentifier);
          } catch (e) {
            if (e instanceof ServiceIdentifierNotFoundError) {
              continue;
            } else {
              throw e;
            }
          }
        }
        throw new ServiceIdentifierNotFoundError(serviceIdentifier, this._name);
      }
  }
  private static sessionNameSessionInjectorMapMap = new WeakMap<any, Map<string, Injector>>();
  public getSessionInjector<Session>(session: Session): Injector {
    if (!Injector.sessionNameSessionInjectorMapMap.has(session)) {
      Injector.sessionNameSessionInjectorMapMap.set(session, new Map());
    }
    const nameSessionInjectorMap: Map<string, Injector> = Injector.sessionNameSessionInjectorMapMap.get(session);
    if (!nameSessionInjectorMap.has(this._name)) {
      const sessionInjector = new Injector(this._name + '_SESSION', ProviderScope.Session);
      for ( const child of this._children ) {
        sessionInjector._children.push(child.getSessionInjector(session));
      }
      for (const [serviceIdentifier, instance] of this._instanceMap) {
        sessionInjector._instanceMap.set(serviceIdentifier, instance);
      }
      sessionInjector._classMap = this._classMap;
      sessionInjector._factoryMap = this._factoryMap;
      sessionInjector._applicationScopeServiceIdentifiers = this._applicationScopeServiceIdentifiers;
      sessionInjector._requestScopeServiceIdentifiers = this._requestScopeServiceIdentifiers;
      sessionInjector._sessionScopeServiceIdentifiers = this._sessionScopeServiceIdentifiers;
      nameSessionInjectorMap.set(this._name, sessionInjector);
    }
    return nameSessionInjectorMap.get(this._name);
  }
  public call<Fn extends (this: ThisArg, ...args: any[]) => any, ThisArg>(fn: Fn, thisArg: ThisArg): ReturnType<Fn> {
    if ('hasMetadata' in Reflect && Reflect.hasMetadata(DESIGN_PARAMTYPES, fn)) {
      const dependencies = Reflect.getMetadata(DESIGN_PARAMTYPES, fn);
      const instances = dependencies.map((dependency: any) => this.get(dependency));
      return fn.call(thisArg, ...instances);
    }
    return fn.call(thisArg, thisArg);
  }
  async callHookWithArgs<T, Args extends any[]>(hook: string, serviceIdentifier: ServiceIdentifier<T>, ...args: Args) {
    const instance = this.get<T>(serviceIdentifier);
    if (
      instance &&
      typeof instance !== 'string' &&
      typeof instance !== 'number' &&
      hook in instance
    ) {
      return instance[hook](...args);
    }
  }
}
