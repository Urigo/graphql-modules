import { visit, ObjectTypeDefinitionNode, Kind, DocumentNode } from 'graphql';
import { moduleFactory } from '../module/factory';
import { createApplication } from '../application/application';
import { ApplicationConfig } from '../application/types';
import { Module, ModuleConfig } from '../module/types';
type TestModuleConfig = {
  replaceExtensions?: boolean;
} & Partial<Pick<ApplicationConfig, 'providers' | 'modules' | 'middlewares'>> &
  Partial<Pick<ModuleConfig, 'typeDefs' | 'resolvers'>>;

export function testModule(testedModule: Module, config?: TestModuleConfig) {
  const mod = transformModule(testedModule, config);
  const modules = [mod].concat(config?.modules ?? []);

  return createApplication({
    ...(config || {}),
    modules,
    providers: config?.providers,
    middlewares: config?.middlewares,
  });
}

function transformModule(mod: Module, config?: TestModuleConfig) {
  const transforms: ((m: Module) => Module)[] = [];

  if (config?.replaceExtensions) {
    transforms.push((m) =>
      moduleFactory({
        ...m.config,
        typeDefs: replaceExtensions(m.typeDefs),
      })
    );
  }

  if (config?.providers) {
    transforms.push((m) => {
      const providers = m.providers ?? [];
      const extraProviders = config.providers!;

      return moduleFactory({
        ...m.config,
        providers: providers.concat(
          Array.isArray(extraProviders) ? extraProviders : extraProviders()
        ),
      });
    });
  }

  if (config?.typeDefs) {
    transforms.push((m) =>
      moduleFactory({
        ...m.config,
        typeDefs: m.typeDefs.concat(config.typeDefs!),
      })
    );
  }

  if (config?.resolvers) {
    transforms.push((m) => {
      const resolvers = m.config.resolvers
        ? Array.isArray(m.config.resolvers)
          ? m.config.resolvers
          : [m.config.resolvers]
        : [];
      return moduleFactory({
        ...m.config,
        resolvers: resolvers.concat(config.resolvers!),
      });
    });
  }

  if (transforms) {
    return transforms.reduce((m, transform) => transform(m), mod);
  }

  return mod;
}

function replaceExtensions(typeDefs: DocumentNode[]) {
  const types: string[] = [];
  const extensions: string[] = [];

  // List all object types
  typeDefs.forEach((doc) => {
    visit(doc, {
      ObjectTypeDefinition(node) {
        types.push(node.name.value);
      },
    });
  });

  // turn object type extensions into object types
  return typeDefs.map((doc) => {
    return visit(doc, {
      ObjectTypeExtension(node) {
        // only if object type doesn't exist
        if (
          extensions.includes(node.name.value) ||
          types.includes(node.name.value)
        ) {
          return node;
        }

        return {
          ...node,
          kind: Kind.OBJECT_TYPE_DEFINITION,
        } as ObjectTypeDefinitionNode;
      },
    });
  });
}
