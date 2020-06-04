import { DocumentNode, parse, Kind } from 'graphql';

export function gql(
  literals: ReadonlyArray<string> | Readonly<string>
): DocumentNode {
  const result = typeof literals === 'string' ? literals : literals[0];

  const parsed = parse(result);

  if (!parsed || parsed.kind !== Kind.DOCUMENT) {
    throw new Error('Not a valid GraphQL document.');
  }

  return parsed;
}
