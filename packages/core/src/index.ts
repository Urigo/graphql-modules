import { interfaces } from 'inversify';

export interface Bind extends interfaces.Bind {}

export * from './graphql-module';
export * from './graphql-app';
export * from './communication';
export * from './resolvers-composition';
export {injectable, inject} from 'inversify';
