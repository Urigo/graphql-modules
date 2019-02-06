import { DESIGN_PARAM_TYPES, DESIGN_TYPE, PROPERTY_KEYS } from './utils';
import { ServiceIdentifier, Instances } from './types';

export function Inject(dependency?: ServiceIdentifier<any>) {
  return (target: any, propertyKey?: string, index?: number) => {
    const allDependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    const propertyKeys = Reflect.getMetadata(PROPERTY_KEYS, target) || [];
    if (typeof propertyKey === 'undefined') {
      if (typeof index !== 'undefined') {
        allDependencies[index] = dependency;
      }
    } else {
      const designType = dependency || Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
      Reflect.defineMetadata(DESIGN_TYPE, designType, target, propertyKey);
      propertyKeys.push(propertyKey);
    }
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, allDependencies, target);
    Reflect.defineMetadata(PROPERTY_KEYS, propertyKeys, target);
    return target;
  };
}
export function InjectFunction<Dependencies extends Array<ServiceIdentifier<any>>, Fn extends (...args: Instances<Dependencies>) => any>(...dependencies: Dependencies) {
  return (target: Fn): any => {
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
    return target;
  };
}
