import { ServiceIdentifier, Provider, Type, ValueProvider, ClassProvider, FactoryProvider, TypeProvider } from './di/types';

export const DESIGN_PARAM_TYPES = 'design:paramtypes';
export const INJECTABLE_OPTIONS = 'injectable:options';

export function getServiceIdentifierName<T>(serviceIdentifier: ServiceIdentifier<T>) {
  if (typeof serviceIdentifier === 'function' && isType<T>(serviceIdentifier)) {
    return serviceIdentifier.name;
  } else {
    return serviceIdentifier.toString();
  }
}

export function isType<T>(v: any): v is Type<T> {
  return typeof v === 'function' && 'prototype' in v;
}

export function isTypeProvider<T>(v: Provider<T>): v is TypeProvider<T> {
  return isType<T>(v);
}

export function isValueProvider<T>(v: Provider<T>): v is ValueProvider<T> {
  return 'useValue' in v;
}

export function isClassProvider<T>(v: Provider<T>): v is ClassProvider<T> {
  return 'useClass' in v && isType(v.useClass);
}

export function isFactoryProvider<T>(v: Provider<T>): v is FactoryProvider<T> {
  return 'useFactory' in v && typeof v.useFactory === 'function';
}
