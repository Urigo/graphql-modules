import { DirectiveNode } from 'graphql/language/ast';
import { DirectiveDefinitionNode, NameNode, print } from 'graphql';

function directiveAlreadyExists(directivesArr: ReadonlyArray<DirectiveNode>, otherDirective: DirectiveNode): boolean {
  return !!directivesArr.find(directive => directive.name.value === otherDirective.name.value);
}

function nameAlreadyExists(name: NameNode, namesArr: ReadonlyArray<NameNode>): boolean {
  return namesArr.some(({value}) => value === name.value);
}

export function mergeDirectives(d1: ReadonlyArray<DirectiveNode>, d2: ReadonlyArray<DirectiveNode>): DirectiveNode[] {
  return [
    ...d2,
    ...(d1.filter(d => !directiveAlreadyExists(d2, d))),
  ];
}

function validateInputs(node: DirectiveDefinitionNode, existingNode: DirectiveDefinitionNode): void | never {
  const printedNode = print(node);
  const printedExistingNode = print(existingNode);
  const leaveInputs = new RegExp('(directive @\w*\d*)|( on .*$)', 'g');
  const sameArguments = printedNode.replace(leaveInputs, '') === printedExistingNode.replace(leaveInputs, '');

  if (!sameArguments) {
    throw new Error(`Unable to merge GraphQL directive "${node.name.value}". \nExisting directive:  \n\t${printedExistingNode} \nReceived directive: \n\t${printedNode}`);
  }
}

export function mergeDirective(node: DirectiveDefinitionNode, existingNode?: DirectiveDefinitionNode): DirectiveDefinitionNode {
  if (existingNode) {

    validateInputs(node, existingNode);

    return {
      ...node,
      locations: [
        ...existingNode.locations,
        ...(node.locations.filter(name => !nameAlreadyExists(name, existingNode.locations))),
      ],
    };
  }

  return node;
}
