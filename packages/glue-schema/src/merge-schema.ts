import { DefinitionNode, DocumentNode, parse, Source } from 'graphql';
import { isSourceTypes, isStringTypes } from './utils';
import { mergeGraphQLNodes } from './merge-nodes';

export function mergeGraphQLTypes(types: Array<string | Source | DocumentNode>) {
  const allNodes: ReadonlyArray<DefinitionNode> = types
    .map<DocumentNode>(type => {
      if (isStringTypes(type) || isSourceTypes(type)) {
        return parse(type);
      }

      return type;
    })
    .map(ast => ast.definitions)
    .reduce((defs, newDef) => [...defs, ...newDef], []);

  const mergedNodes = mergeGraphQLNodes(allNodes);

  // TODO: Convert to add, and then add SchemaDefinitionNode to the array
  // TODO: Print all definitions with astPrinter
}
