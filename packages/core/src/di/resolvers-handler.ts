import { RESOLVERS_TYPE } from '../utils';
import { Injectable } from './injectable';

declare var Reflect: any;

export function ResolversHandler(resolversType: string) {
  return (target: any): any => {
    Reflect.defineMetadata(RESOLVERS_TYPE, resolversType, target);
    return Injectable()(target);
  };
}
