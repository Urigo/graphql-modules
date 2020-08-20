import { Type, ProviderOptions, InjectionToken } from './providers';

export const INJECTABLE = Symbol('di:injectable');

export interface InjectableParamMetadata {
  type: Type<any> | InjectionToken<any>;
  optional: boolean;
}

export interface InjectableMetadata {
  params: InjectableParamMetadata[];
  options?: ProviderOptions;
}

export function readInjectableMetadata(type: Type<any>): InjectableMetadata {
  return (type as any)[INJECTABLE];
}

export function ensureInjectableMetadata(type: Type<any>) {
  if (!readInjectableMetadata(type)) {
    const meta: InjectableMetadata = {
      params: [],
    };

    (type as any)[INJECTABLE] = meta;
  }
}
