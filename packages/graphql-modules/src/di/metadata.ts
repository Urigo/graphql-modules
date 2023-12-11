import { noInjectableError } from './errors.js';
import { Type, ProviderOptions, InjectionToken } from './providers.js';

export const INJECTABLE = Symbol('di:injectable');

export interface InjectableParamMetadata {
  type: Type<any> | InjectionToken<any>;
  optional: boolean;
}

export interface InjectableMetadata {
  params: InjectableParamMetadata[];
  options?: ProviderOptions;
}

export function readInjectableMetadata(
  type: Type<any>,
  throwOnMissing?: boolean
): InjectableMetadata {
  const meta = (type as any)[INJECTABLE];

  if (!meta && throwOnMissing) {
    throw noInjectableError(type);
  }

  return meta;
}

export function ensureInjectableMetadata(type: Type<any>) {
  if (!readInjectableMetadata(type)) {
    const meta: InjectableMetadata = {
      params: [],
    };

    (type as any)[INJECTABLE] = meta;
  }
}
