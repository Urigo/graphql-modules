import { InjectionToken } from '../di/index.js';

/**
 * @api
 * `CONTEXT` is an InjectionToken representing the provided `GraphQLModules.GlobalContext`
 *
 * @example
 *
 * ```typescript
 * import { CONTEXT, Inject, Injectable } from 'graphql-modules';
 *
 * (A)Injectable()
 * export class Data {
 *   constructor((A)Inject(CONTEXT) private context: GraphQLModules.GlobalContext) {}
 * }
 * ```
 */
export const CONTEXT = new InjectionToken<any>('context');
