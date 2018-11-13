import { DESIGN_PARAM_TYPES } from './utils';

export function Injectable() {
  return (target: any) => {
    if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
      Reflect.defineMetadata(DESIGN_PARAM_TYPES, [], target);
    }
    return target;
  };
}
