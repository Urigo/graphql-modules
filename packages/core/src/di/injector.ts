
import { ProviderNotValidError, ServiceIdentifierNotFoundError, DependencyProviderNotFoundError, ProviderAlreadyDefinedError, ProviderClassNotDecoratedError } from '../errors';
import { ServiceIdentifier, Type, Provider, ProviderScope, ProviderOptions, Factory } from './types';
import { isTypeProvider, PROVIDER_OPTIONS, isValueProvider, isClassProvider, isFactoryProvider, DESIGN_PARAM_TYPES } from './utils';

declare var Reflect: any;

export class Injector {
  public children = new Set<Injector>();
  private _classMap = new Map<ServiceIdentifier<any>, Type<any>>();
  private _factoryMap = new Map<ServiceIdentifier<any>, Factory<any>>();
  private _instanceMap = new Map<ServiceIdentifier<any>, any>();
  private _applicationScopeSet = new Set<ServiceIdentifier<any>>();
  private _requestScopeSet = new Set<ServiceIdentifier<any>>();
  private _sessionScopeSet = new Set<ServiceIdentifier<any>>();
  constructor(public name: string, public providerScope: ProviderScope) {}
  public provide<T>(provider: Provider<T>): void {

    if (isTypeProvider(provider)) {
      const options: ProviderOptions = Reflect.getMetadata(PROVIDER_OPTIONS, provider);
      if (options && !options.overwrite && this.has(provider)) {
        throw new ProviderAlreadyDefinedError(this.name, provider);
      }
      this._classMap.set(provider, provider);
      switch ((options && options.scope) || this.providerScope) {
        case ProviderScope.Application:
          this._applicationScopeSet.add(provider);
        break;
        case ProviderScope.Request:
          this._requestScopeSet.add(provider);
        break;
        case ProviderScope.Session:
          this._sessionScopeSet.add(provider);
        break;
      }
      return;
    }

    if (!provider.overwrite && this.has(provider.provide)) {
      throw new ProviderAlreadyDefinedError(this.name, provider.provide);
    }

    if (isValueProvider(provider)) {
      this._instanceMap.set(provider.provide, provider.useValue);
    } else if (isClassProvider(provider)) {
      this._classMap.set(provider.provide, provider.useClass);
    } else if (isFactoryProvider(provider)) {
      this._factoryMap.set(provider.provide, provider.useFactory);
    } else {
      throw new ProviderNotValidError(this.name, provider['provide'] && provider);
    }

    switch (provider.scope || this.providerScope) {
      case ProviderScope.Application:
        this._applicationScopeSet.add(provider.provide);
      break;
      case ProviderScope.Request:
        this._requestScopeSet.add(provider.provide);
      break;
      case ProviderScope.Session:
        this._sessionScopeSet.add(provider.provide);
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

  public get scopeSet() {
    switch (this.providerScope) {
      case ProviderScope.Application:
      return this._applicationScopeSet;
      case ProviderScope.Request:
      return this._requestScopeSet;
      case ProviderScope.Session:
      return this._sessionScopeSet;
    }
  }

  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
      if (this._instanceMap.has(serviceIdentifier)) {
        return this._instanceMap.get(serviceIdentifier);
      } else if (this._classMap.has(serviceIdentifier)) {
        const RealClazz = this._classMap.get(serviceIdentifier);
        try {
          const dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, RealClazz);
          if (!dependencies) {
            throw new ProviderClassNotDecoratedError<T>(this.name, serviceIdentifier, RealClazz.name);
          }
          const dependencyInstances = dependencies.map((dependency: ServiceIdentifier<any>) => this.get(dependency));
          const instance = new RealClazz(...dependencyInstances);
          if (this.scopeSet.has(serviceIdentifier)) {
            this._instanceMap.set(serviceIdentifier, instance);
          }
          return instance;
        } catch (e) {
          if (e instanceof ServiceIdentifierNotFoundError) {
            throw new DependencyProviderNotFoundError(e.serviceIdentifier, RealClazz, this.name);
          } else {
            throw e;
          }
        }
      } else if (this._factoryMap.has(serviceIdentifier)) {
        const factory = this._factoryMap.get(serviceIdentifier);
        const instance = factory(this);
        if (this.scopeSet.has(serviceIdentifier)) {
          this._instanceMap.set(serviceIdentifier, instance);
        }
        return instance;
      } else {
        for (const child of this.children) {
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
        throw new ServiceIdentifierNotFoundError(serviceIdentifier, this.name);
      }
  }
  static sessionNameSessionInjectorMapMap = new WeakMap<any, Map<string, Injector>>();
  public getSessionInjector<Session>(session: Session): Injector {
    if (!Injector.sessionNameSessionInjectorMapMap.has(session)) {
      Injector.sessionNameSessionInjectorMapMap.set(session, new Map());
    }
    const nameSessionInjectorMap: Map<string, Injector> = Injector.sessionNameSessionInjectorMapMap.get(session);
    if (!nameSessionInjectorMap.has(this.name)) {
      const sessionInjector = new Injector(this.name + '_SESSION', ProviderScope.Session);
      for ( const child of this.children ) {
        sessionInjector.children.add(child.getSessionInjector(session));
      }
      for (const [serviceIdentifier, instance] of this._instanceMap) {
        sessionInjector._instanceMap.set(serviceIdentifier, instance);
      }
      sessionInjector._classMap = this._classMap;
      sessionInjector._factoryMap = this._factoryMap;
      sessionInjector._applicationScopeSet = this._applicationScopeSet;
      sessionInjector._requestScopeSet = this._requestScopeSet;
      sessionInjector._sessionScopeSet = this._sessionScopeSet;
      nameSessionInjectorMap.set(this.name, sessionInjector);
    }
    return nameSessionInjectorMap.get(this.name);
  }
}
