import { ServiceIdentifier } from './types';

import { DESIGN_PARAM_TYPES } from './utils';

declare var Reflect: any;

export function Inject<Dependency>(serviceIdentifier: ServiceIdentifier<Dependency> | Array<ServiceIdentifier<Dependency>>) {
  if (Array.isArray(serviceIdentifier)) {
    return <T>(target: T): T => {
      let dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
      dependencies = serviceIdentifier;
      Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
      return target;
    };
  } else {
    return (target: any, _targetKey?: any, index?: number): any => {
      if (typeof index === 'undefined') {
        index = typeof _targetKey === 'undefined' ? 0 : _targetKey;
      }
      const dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
      dependencies[index] = serviceIdentifier;
      Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
      return target;
    };
  }
}
