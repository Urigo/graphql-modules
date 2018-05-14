import { EnumValueDefinitionNode } from 'graphql/language/ast';

function alreadyExists(arr: ReadonlyArray<EnumValueDefinitionNode>, other: EnumValueDefinitionNode): boolean {
  return !!arr.find(v => v.name.value === other.name.value);
}

export function mergeEnumValues(first: ReadonlyArray<EnumValueDefinitionNode>, second: ReadonlyArray<EnumValueDefinitionNode>): EnumValueDefinitionNode[] {
  return [
    ...second,
    ...(first.filter(d => !alreadyExists(second, d))),
  ];
}
