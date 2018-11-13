import { DefinitionNode, DocumentNode, GraphQLSchema, parse, print, printSchema, Source } from 'graphql';
import { isGraphQLSchema, isSourceTypes, isStringTypes } from './utils';
import { MergedResultMap, mergeGraphQLNodes } from './merge-nodes';

export function mergeGraphQLSchemas(types: Array<string | Source | DocumentNode | GraphQLSchema>): string {
  const astDefinitions = mergeGraphQLTypes(types);

  return astDefinitions
    .map<DocumentNode>(definition => ({
      kind: 'Document',
      definitions: [definition],
    }))
    .map(document => print(document))
    .join('\n');
}

export function mergeGraphQLTypes(types: Array<string | Source | DocumentNode | GraphQLSchema>): DefinitionNode[] {
  const allNodes: ReadonlyArray<DefinitionNode> = types
    .map<DocumentNode>(type => {
      if (isGraphQLSchema(type)) {
        const typesMap = type.getTypeMap();
        const allTypesPrinted = Object.keys(typesMap).map(key => typesMap[key]).map(type => type.astNode ? print(type.astNode) : null).filter(e => e);
        const directivesDeclaration = type.getDirectives().map(directive => directive.astNode ? print(directive.astNode) : null).filter(e => e);
        const printedSchema = [...directivesDeclaration, ...allTypesPrinted].join('\n');

        return parse(printedSchema);
      } else if (isStringTypes(type) || isSourceTypes(type)) {
        return parse(type);
      }

      return type;
    })
    .map(ast => ast.definitions)
    .reduce((defs, newDef) => [...defs, ...newDef], []);

  const mergedNodes: MergedResultMap = mergeGraphQLNodes(allNodes);
  const allTypes = Object.keys(mergedNodes);
  const queryType = allTypes.includes('Query') ? 'query: Query' : null;
  const mutationType = allTypes.includes('Mutation') ? 'mutation: Mutation' : null;
  const subscriptionType = allTypes.includes('Subscription') ? 'subscription: Subscription' : null;
  const relevantTypes = [queryType, mutationType, subscriptionType].filter(a => a);

  if (relevantTypes.length === 0) {
    return Object.values(mergedNodes);
  }

  const schemaDefinition = parse(`schema { ${relevantTypes.join('\n')} }`).definitions[0];

  return [
    ...Object.values(mergedNodes),
    schemaDefinition,
  ];
}
