import { ObjectTypeDefinitionNode } from 'graphql';
import { mergeFields } from './fields';
import { mergeDirectives } from './directives';
import { mergeNamedTypeArray } from './merge-named-type-array';

export function mergeType(node: ObjectTypeDefinitionNode, existingNode: ObjectTypeDefinitionNode): ObjectTypeDefinitionNode {
  if (existingNode) {
    try {
      return {
        name: node.name,
        description: node.description || existingNode.description,
        kind: node.kind,
        loc: node.loc,
        fields: mergeFields(node.fields, existingNode.fields),
        directives: mergeDirectives(node.directives, existingNode.directives),
        interfaces: mergeNamedTypeArray(node.interfaces, existingNode.interfaces),
      };
    } catch (e) {
      throw new Error(`Unable to merge GraphQL type "${node.name.value}": ${e.message}`);
    }
  }

  return node;
}
