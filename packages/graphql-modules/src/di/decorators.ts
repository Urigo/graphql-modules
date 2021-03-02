import { Type, ProviderOptions, isType, InjectionToken } from './providers';
import {
  INJECTABLE,
  InjectableMetadata,
  readInjectableMetadata,
  ensureInjectableMetadata,
} from './metadata';
import { Injector } from './injector';
import { enableExecutionContext } from '../application/execution-context';

function ensureReflect() {
  if (!(Reflect && Reflect.getOwnMetadata)) {
    throw 'reflect-metadata shim is required when using class decorators';
  }
}

export function Injectable(options?: ProviderOptions): ClassDecorator {
  return (target) => {
    ensureReflect();
    enableExecutionContext();

    const params: Type<any>[] = (
      Reflect.getMetadata('design:paramtypes', target) || []
    ).map((param: any) => (isType(param) ? param : null));

    const existingMeta = readInjectableMetadata(target as any);

    const meta: InjectableMetadata = {
      params:
        existingMeta?.params?.length > 0 && params.length === 0
          ? existingMeta?.params
          : params.map((param, i) => {
              const existingParam = existingMeta?.params?.[i];
              return {
                type: existingParam?.type || param,
                optional:
                  typeof existingParam?.optional === 'boolean'
                    ? existingParam.optional
                    : false,
              };
            }),
      options: {
        ...(existingMeta?.options || {}),
        ...(options || {}),
      },
    };

    (target as any)[INJECTABLE] = meta;

    return target;
  };
}

export function Optional(): ParameterDecorator {
  return (target, _, index) => {
    ensureReflect();
    ensureInjectableMetadata(target as any);
    const meta = readInjectableMetadata(target as any);

    meta.params[index] = {
      ...meta.params[index],
      optional: true,
    };
  };
}

export function Inject(
  type: Type<any> | InjectionToken<any>
): ParameterDecorator {
  return (target, _, index) => {
    ensureReflect();
    ensureInjectableMetadata(target as any);
    const meta = readInjectableMetadata(target as any);

    meta.params[index] = {
      type,
      optional: false,
    };
  };
}

export type ExecutionContext = {
  injector: Injector;
} & GraphQLModules.ModuleContext;

export function ExecutionContext(): PropertyDecorator {
  return (obj, propertyKey) => {
    ensureReflect();
    const target = obj.constructor;

    ensureInjectableMetadata(target as any);

    const meta = readInjectableMetadata(target as any);

    if (!meta.options) {
      meta.options = {};
    }

    if (!meta.options.executionContextIn) {
      meta.options!.executionContextIn = [];
    }

    meta.options!.executionContextIn.push(propertyKey);
  };
}
