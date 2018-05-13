import { UnionTypeDefinitionNode } from 'graphql';
import { mergeDirectives } from './directives';
import { mergeNamedTypeArray } from './merge-named-type-array';

export function mergeUnion(first: UnionTypeDefinitionNode, second: UnionTypeDefinitionNode): UnionTypeDefinitionNode {
  if (second) {
    return {
      name: first.name,
      description: first.description || second.description,
      directives: mergeDirectives(first.directives, second.directives),
      kind: first.kind,
      loc: first.loc,
      types: mergeNamedTypeArray(first.types, second.types),
    };
  }

  return first;
}
