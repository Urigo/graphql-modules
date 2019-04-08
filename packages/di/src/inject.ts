import { DESIGN_PARAMTYPES, DESIGN_TYPE, PROPERTY_KEYS } from './utils';
import { ServiceIdentifier, Instances } from './types';

export function Inject(dependency?: ServiceIdentifier<any>) {
  return (target: any, propertyKey?: string, index?: number) => {
    const allDependencies = Reflect.getMetadata(DESIGN_PARAMTYPES, target) || [];
    const propertyKeys = Reflect.getMetadata(PROPERTY_KEYS, target.constructor || target) || [];
    if (typeof propertyKey === 'undefined') {
      if (typeof index !== 'undefined') {
        allDependencies[index] = dependency;
      }
    } else {
      const designType = dependency || Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
      Reflect.defineMetadata(DESIGN_TYPE, designType, target, propertyKey);
      propertyKeys.push(propertyKey);
    }
    Reflect.defineMetadata(DESIGN_PARAMTYPES, allDependencies, target);
    Reflect.defineMetadata(PROPERTY_KEYS, propertyKeys, target.constructor || target);
    return target;
  };
}
export function InjectFunction<
  Dependencies extends Array<ServiceIdentifier<any>>,
  Fn extends (...args: Instances<Dependencies>) => any
>(...dependencies: Dependencies) {
  return (target: Fn): any => {
    Reflect.defineMetadata(DESIGN_PARAMTYPES, dependencies, target);
    return target;
  };
}
