import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';
import {mergeResolvers, mergeGraphQLSchemas} from '@graphql-modules/epoxy';
//
// export class GraphQLApp {
//   private readonly _modules: Constructor[];
//   private readonly _modulesOptions: GraphQLModuleOptions[];
//   private readonly _schema: GraphQLSchema;
//   private readonly _instances: any[];
//
//   constructor(modules: Constructor[]) {
//     this._modulesOptions = modules.map(module => (module.prototype[METADATA_KEY] as GraphQLModuleOptions));
//     const allTypes = this._modulesOptions.map<string>(m => m.types).filter(t => t);
//     this._modules = modules;
//
//     this._schema = makeExecutableSchema({
//       typeDefs: mergeGraphQLSchemas(allTypes),
//       resolvers: mergeResolvers(this._modulesOptions.map(m => m.resolvers || {})),
//     });
//
//     this._instances = this._modules.map(ModuleClass => new ModuleClass());
//   }
//
//   getSchema(): GraphQLSchema {
//     return this._schema;
//   }
//
//   async buildContext(httpRequest: any): Promise<any> {
//     const results = await Promise.all(
//       this._instances.map(async instance => {
//         if (instance.buildContext) {
//           return await instance.buildContext(httpRequest);
//         }
//
//         return {};
//       }),
//     );
//
//     return results.reduce((prev, result) => {
//       return {
//         ...prev,
//         ...result,
//       };
//     }, {});
//   }
// }
//
// export function bootstrapModules(modules: Constructor[]): GraphQLApp {
//   return new GraphQLApp(modules);
// }
