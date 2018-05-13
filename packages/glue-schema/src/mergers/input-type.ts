import { InputObjectTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { mergeFields } from './fields';
import { mergeDirectives } from './directives';
import { mergeNamedTypeArray } from './merge-named-type-array';
import { InputValueDefinitionNode } from 'graphql/language/ast';

export function mergeInputType(node: InputObjectTypeDefinitionNode, existingNode: InputObjectTypeDefinitionNode): InputObjectTypeDefinitionNode {
  if (existingNode) {
    try {
      return {
        name: node.name,
        description: node.description || existingNode.description,
        kind: node.kind,
        loc: node.loc,
        fields: mergeFields<InputValueDefinitionNode>(node.fields, existingNode.fields),
        directives: mergeDirectives(node.directives, existingNode.directives),
      };
    } catch (e) {
      throw new Error(`Unable to merge GraphQL type "${node.name.value}": ${e.message}`);
    }
  }

  return node;
}
