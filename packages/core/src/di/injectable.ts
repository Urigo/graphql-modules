import { DESIGN_PARAM_TYPES, PROVIDER_OPTIONS } from './utils';
import { ProviderOptions } from './types';

declare var Reflect: any;

export function Injectable(options?: ProviderOptions): ClassDecorator {
  return (target: any) => {
    if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
      Reflect.defineMetadata(DESIGN_PARAM_TYPES, [], target);
    }
    if (options) {
      Reflect.defineMetadata(PROVIDER_OPTIONS, options, target);
    }
    return target;
  };
}
