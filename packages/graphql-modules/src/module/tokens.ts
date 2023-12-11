import { InjectionToken } from '../di/index.js';
import { ID } from '../shared/types.js';

/**
 * @api
 * `MODULE_ID` is an InjectionToken representing module's ID
 *
 * @example
 * ```typescript
 * import { MODULE_ID, Inject, Injectable } from 'graphql-modules';
 *
 * (A)Injectable()
 * export class Data {
 *   constructor((A)Inject(MODULE_ID) moduleId: string) {
 *     console.log(`Data used in ${moduleId} module`)
 *   }
 * }
 * ```
 */
export const MODULE_ID = new InjectionToken<ID>('module-id');
