import { DESIGN_PARAM_TYPES } from './utils';
import { ServiceIdentifier, Instances } from './types';

export function Inject<Dependencies extends Array<ServiceIdentifier<any>>, Fn extends (...args: Instances<Dependencies>) => any>(...dependencies: Dependencies) {
  return (target: Fn, _targetKey?: string, index?: number): any => {
    let allDependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    if (typeof index !== 'undefined') {
      allDependencies[index] = dependencies[0];
    } else {
      allDependencies = dependencies;
    }
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, allDependencies, target);
    return target;
  };
}
