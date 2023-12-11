import { InjectableParamMetadata } from './metadata.js';
import { Type, InjectionToken } from './providers.js';
import {
  stringify,
  wrappedError,
  ERROR_ORIGINAL_ERROR,
  getOriginalError,
} from './utils.js';
import { ReflectiveInjector } from './injector.js';
import { Key } from './registry.js';

export function invalidProviderError(provider: any) {
  return Error(
    `Invalid provider - only instances of Provider and Type are allowed, got: ${provider}`
  );
}

export function noInjectableError(type: Type<any>): Error {
  return Error(`Missing @Injectable decorator for '${stringify(type)}'`);
}

export function noAnnotationError(
  typeOrFunc: Type<any> | InjectionToken<any> | Function,
  params: InjectableParamMetadata[]
): Error {
  const signature: string[] = [];

  for (let i = 0, len = params.length; i < len; i++) {
    const parameter = params[i];
    if (!parameter.type) {
      signature.push('?');
    } else {
      signature.push(stringify(parameter.type));
    }
  }

  return Error(
    "Cannot resolve all parameters for '" +
      stringify(typeOrFunc) +
      "'(" +
      signature.join(', ') +
      '). ' +
      "Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" +
      stringify(typeOrFunc) +
      "' is decorated with Injectable."
  );
}

export function cyclicDependencyError(
  injector: ReflectiveInjector,
  key: Key
): InjectionError {
  return injectionError(injector, key, function (this: InjectionError) {
    return `Cannot instantiate cyclic dependency!${constructResolvingPath(
      this.keys
    )}`;
  });
}

export function noProviderError(
  injector: ReflectiveInjector,
  key: Key
): InjectionError {
  return injectionError(injector, key, function (this: InjectionError) {
    const first = stringify(this.keys[0].token);
    return `No provider for ${first}!${constructResolvingPath(this.keys)}`;
  });
}

export function instantiationError(
  injector: ReflectiveInjector,
  originalException: any,
  key: Key
): InjectionError {
  return injectionError(
    injector,
    key,
    function (this: InjectionError) {
      const first = stringify(this.keys[0].token);
      return `Error during instantiation of ${first}: ${
        getOriginalError(this).message
      }${constructResolvingPath(this.keys)}`;
    },
    originalException
  );
}

export interface InjectionError extends Error {
  keys: Key[];
  injectors: ReflectiveInjector[];
  constructResolvingMessage: (this: InjectionError) => string;
  addKey(key: Key): void;
}

function injectionError(
  injector: ReflectiveInjector,
  key: Key,
  constructResolvingMessage: (this: InjectionError) => string,
  originalError?: Error
): InjectionError {
  const error = (
    originalError ? wrappedError('', originalError) : Error()
  ) as InjectionError;
  error.addKey = addKey;
  error.keys = [key];
  error.constructResolvingMessage =
    function wrappedConstructResolvingMessage() {
      return (
        constructResolvingMessage.call(this) + ` - in ${injector.displayName}`
      );
    };
  error.message = error.constructResolvingMessage();
  (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}

function constructResolvingPath(keys: any[]): string {
  if (keys.length > 1) {
    const reversed = findFirstClosedCycle(keys.slice().reverse());
    const tokenStrs = reversed.map((k) => stringify(k.token));
    return ' (' + tokenStrs.join(' -> ') + ')';
  }

  return '';
}

function findFirstClosedCycle(keys: any[]): any[] {
  const res: any[] = [];
  for (let i = 0; i < keys.length; ++i) {
    if (res.indexOf(keys[i]) > -1) {
      res.push(keys[i]);
      return res;
    }
    res.push(keys[i]);
  }
  return res;
}

function addKey(this: InjectionError, key: Key): void {
  this.keys.push(key);
  this.message = this.constructResolvingMessage();
}
