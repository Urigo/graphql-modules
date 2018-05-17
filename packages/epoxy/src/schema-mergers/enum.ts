import { EnumTypeDefinitionNode } from 'graphql';
import { mergeDirectives } from './directives';
import { mergeEnumValues } from './enum-values';

export function mergeEnum(e1: EnumTypeDefinitionNode, e2: EnumTypeDefinitionNode): EnumTypeDefinitionNode {
  if (e2) {
    return {
      name: e1.name,
      description: e1.description || e2.description,
      kind: e1.kind,
      loc: e1.loc,
      directives: mergeDirectives(e1.directives, e2.directives),
      values: mergeEnumValues(e1.values, e2.values),
    };
  }

  return e1;
}
