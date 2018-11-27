import { InputObjectTypeDefinitionNode } from 'graphql';
import { mergeFields } from './fields';
import { mergeDirectives } from './directives';
import { InputValueDefinitionNode, InputObjectTypeExtensionNode } from 'graphql/language/ast';

export function mergeInputType(
  node: InputObjectTypeDefinitionNode | InputObjectTypeExtensionNode,
  existingNode: InputObjectTypeDefinitionNode | InputObjectTypeExtensionNode): InputObjectTypeDefinitionNode | InputObjectTypeExtensionNode {

  if (existingNode) {
    try {
      return {
        name: node.name,
        description: node['description'] || existingNode['description'],
        kind: (node.kind === 'InputObjectTypeDefinition' || existingNode.kind === 'InputObjectTypeDefinition') ? 'InputObjectTypeDefinition' : 'InputObjectTypeExtension',
        loc: node.loc,
        fields: mergeFields<InputValueDefinitionNode>(node.fields, existingNode.fields),
        directives: mergeDirectives(node.directives, existingNode.directives),
      } as any;
    } catch (e) {
      throw new Error(`Unable to merge GraphQL input type "${node.name.value}": ${e.message}`);
    }
  }

  return node;
}
