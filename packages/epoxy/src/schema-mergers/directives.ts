import { DirectiveNode } from 'graphql/language/ast';
import { DirectiveDefinitionNode, print } from 'graphql';

function directiveAlreadyExists(directivesArr: ReadonlyArray<DirectiveNode>, otherDirective: DirectiveNode): boolean {
  return !!directivesArr.find(directive => directive.name.value === otherDirective.name.value);
}

export function mergeDirectives(d1: ReadonlyArray<DirectiveNode>, d2: ReadonlyArray<DirectiveNode>): DirectiveNode[] {
  return [
    ...d2,
    ...(d1.filter(d => !directiveAlreadyExists(d2, d))),
  ];
}

export function mergeDirective(node: DirectiveDefinitionNode, existingNode?: DirectiveDefinitionNode): DirectiveDefinitionNode {
  if (existingNode) {
    const printedNode = print(node);
    const printedExistingNode = print(existingNode);

    if (printedNode !== printedExistingNode) {
      throw new Error(`Unable to merge GraphQL directive "${node.name.value}". \nExisting directive:  \n\t${printedExistingNode} \nReceived directive: \n\t${printedNode}`);
    }
  }

  return node;
}
