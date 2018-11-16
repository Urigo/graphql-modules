import { DESIGN_PARAM_TYPES } from './utils';
import { ServiceIdentifier, Newable } from './types';

declare var Reflect: any;

type Instances<Dependencies extends Array<ServiceIdentifier<any>>> = {
  [Key in keyof Dependencies]: Dependencies[Key] extends Newable<any> ? InstanceType<Dependencies[Key]> : any;
};

export function Inject<Dependencies extends Array<ServiceIdentifier<any>>, Fn extends (...args: Instances<Dependencies>) => any>(...dependencies: Dependencies) {
  return (target: Fn, _targetKey?: any, index?: number): any => {
    const allDependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    if (typeof index !== 'undefined') {
      allDependencies[index] = dependencies;
    }
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
    return target;
  };
}
