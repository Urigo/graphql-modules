import { ServiceIdentifier } from './types';

import { DESIGN_PARAM_TYPES } from './utils';

export function Inject<Dependency>(serviceIdentifier: ServiceIdentifier<Dependency>) {
  return (target: any, _targetKey: any, index: number) => {
    const dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    if (!dependencies) {
      throw new Error('You must decorate the provider class with @Injectable() to use DI in this class!');
    }
    dependencies[index] = serviceIdentifier;
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
    return target;
  };
}
