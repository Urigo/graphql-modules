import { InterfaceTypeDefinitionNode } from 'graphql';
import { mergeFields } from './fields';
import { mergeDirectives } from './directives';

export function mergeInterface(node: InterfaceTypeDefinitionNode, existingNode: InterfaceTypeDefinitionNode): InterfaceTypeDefinitionNode {
  if (existingNode) {
    try {
      return {
        name: node.name,
        description: node.description || existingNode.description,
        kind: node.kind,
        loc: node.loc,
        fields: mergeFields(node.fields, existingNode.fields),
        directives: mergeDirectives(node.directives, existingNode.directives),
      };
    } catch (e) {
      throw new Error(`Unable to merge GraphQL interface "${node.name.value}": ${e.message}`);
    }
  }

  return node;
}
