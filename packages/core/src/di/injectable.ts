import { DESIGN_PARAM_TYPES, INJECTABLE_OPTIONS } from '../utils';
import { GraphQLModule } from '../graphql-module';

declare var Reflect: any;

export interface InjectableOptions {
  providedIn?: string | GraphQLModule;
}

export function Injectable(options ?: InjectableOptions) {
  return (target: any) => {
    if (options) {
      Reflect.defineMetadata(INJECTABLE_OPTIONS, options, target);
    }
    if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
      Reflect.defineMetadata(DESIGN_PARAM_TYPES, [], target);
    }
    return target;
  };
}
