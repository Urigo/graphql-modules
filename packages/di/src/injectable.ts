import { DESIGN_PARAM_TYPES, PROVIDER_OPTIONS, PROPERTY_KEYS } from './utils';
import { ProviderOptions } from './types';

export function Injectable(options: ProviderOptions = {}): ClassDecorator {
  return target => {
    const existingDesignParamTypes = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, existingDesignParamTypes, target);
    Reflect.defineMetadata(PROVIDER_OPTIONS, options, target);
    const propertyKeys = Reflect.getMetadata(PROPERTY_KEYS, target) || [];
    Reflect.defineMetadata(PROPERTY_KEYS, propertyKeys, target);
    return target;
  };
}
