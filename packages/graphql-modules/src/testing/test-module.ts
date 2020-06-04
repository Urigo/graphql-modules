import { visit, ObjectTypeDefinitionNode, Kind } from 'graphql';
import { createApplication } from '../application/application';
import { ApplicationConfig } from '../application/types';
import { Module } from '../module/types';

export function testModule(
  module: Module,
  config?: Pick<ApplicationConfig, 'providers'>
) {
  const types: string[] = [];
  const extensions: string[] = [];

  // List all object types
  module.typeDefs.forEach((doc) => {
    visit(doc, {
      ObjectTypeDefinition(node) {
        types.push(node.name.value);
      },
    });
  });

  // turn object type extensions into object types
  module.typeDefs = module.typeDefs.map((doc) => {
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

  return createApplication({
    ...(config || {}),
    modules: [module], // TODO: we should use a factory here
  });
}
