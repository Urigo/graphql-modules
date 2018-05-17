import { DirectiveNode } from 'graphql/language/ast';

function directiveAlreadyExists(directivesArr: ReadonlyArray<DirectiveNode>, otherDirective: DirectiveNode): boolean {
  return !!directivesArr.find(directive => directive.name.value === otherDirective.name.value);
}

export function mergeDirectives(d1: ReadonlyArray<DirectiveNode>, d2: ReadonlyArray<DirectiveNode>): DirectiveNode[] {
  return [
    ...d2,
    ...(d1.filter(d => !directiveAlreadyExists(d2, d))),
  ];
}
