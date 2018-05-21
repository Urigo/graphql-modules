import {loadSchemaFiles, loadResolversFiles} from '@graphql-modules/sonar';
import {mergeResolvers, mergeGraphQLSchemas} from '@graphql-modules/epoxy';
import { resolve } from 'path';

export const types = mergeGraphQLSchemas(loadSchemaFiles(resolve(__dirname, './graphql/schema')));
export const resolvers = mergeResolvers(loadResolversFiles(resolve(__dirname, './graphql/resolvers')));
