import { ServiceIdentifier, Provider, Type, ValueProvider, ClassProvider, FactoryProvider } from './di/types';

export const DESIGN_PARAM_TYPES = 'design:paramtypes';

export function getServiceIdentifierName<T>(serviceIdentifier: ServiceIdentifier<T>) {
  return serviceIdentifier['name'] || serviceIdentifier.toString();
}

export function isType<T>(v: Provider<T>): v is Type<T> {
  return typeof v === 'function';
}

export function isValue<T>(v: Provider<T>): v is ValueProvider<T> {
  return 'useValue' in v;
}

export function isClass<T>(v: Provider<T>): v is ClassProvider<T> {
  return 'useClass' in v;
}

export function isFactory<T>(v: Provider<T>): v is FactoryProvider<T> {
  return 'useFactory' in v;
}
