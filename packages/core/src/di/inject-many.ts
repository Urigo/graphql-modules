import { ServiceIdentifier } from './types';

import { DESIGN_PARAM_TYPES } from './utils';

declare var Reflect: any;

export function InjectMany<Dependency>(serviceIdentifiers: Array<ServiceIdentifier<Dependency>>) {
  return (target: any, _targetKey: any, index: number) => {
    let dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    if (!dependencies) {
      throw new Error('You must decorate the provider class with @Injectable()');
    }
    if (typeof index === 'number') {
      dependencies[index] = serviceIdentifiers;
    } else {
      dependencies = serviceIdentifiers;
    }
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
    return target;
  };
}
