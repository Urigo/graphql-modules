import { NamedTypeNode } from 'graphql/language/ast';

function alreadyExists(arr: ReadonlyArray<NamedTypeNode>, other: NamedTypeNode): boolean {
  return !!arr.find(i => i.name.value === other.name.value);
}

export function mergeNamedTypeArray(first: ReadonlyArray<NamedTypeNode>, second: ReadonlyArray<NamedTypeNode>): NamedTypeNode[] {
  return [
    ...second,
    ...(first.filter(d => !alreadyExists(second, d))),
  ];
}
