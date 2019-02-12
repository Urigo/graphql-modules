import { DESIGN_PARAMTYPES, PROVIDER_OPTIONS, PROPERTY_KEYS } from './utils';
import { ProviderOptions } from './types';

export function Injectable(options: ProviderOptions = {}): ClassDecorator {
  return target => {
    const existingDesignParamTypes = Reflect.getMetadata(DESIGN_PARAMTYPES, target) || [];
    Reflect.defineMetadata(DESIGN_PARAMTYPES, existingDesignParamTypes, target);
    Reflect.defineMetadata(PROVIDER_OPTIONS, options, target);
    const propertyKeys = Reflect.getMetadata(PROPERTY_KEYS, target.constructor) || [];
    Reflect.defineMetadata(PROPERTY_KEYS, propertyKeys, target.constructor);
    return target;
  };
}
