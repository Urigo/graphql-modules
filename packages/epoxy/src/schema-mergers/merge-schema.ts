import { buildASTSchema, printSchema, DefinitionNode, DocumentNode, GraphQLSchema, parse, print, Source, GraphQLObjectType } from 'graphql';
import { isGraphQLSchema, isSourceTypes, isStringTypes, isSchemaDefinition } from './utils';
import { MergedResultMap, mergeGraphQLNodes } from './merge-nodes';

export function mergeGraphQLSchemas(types: Array<string | Source | DocumentNode | GraphQLSchema>): DocumentNode {
  return {
    kind: 'Document',
    definitions: mergeGraphQLTypes(types),
  };
}

function fixSchemaAst(schema: GraphQLSchema): GraphQLSchema {
  return buildASTSchema(parse(printSchema(schema)));
}

function createSchemaDefinition(def: {
  query: string | GraphQLObjectType | null;
  mutation: string | GraphQLObjectType | null;
  subscription: string | GraphQLObjectType | null;
}): string {
  const schemaRoot = {
    query: def.query && def.query.toString(),
    mutation: def.mutation && def.mutation.toString(),
    subscription: def.subscription && def.subscription.toString(),
  };

  const fields = Object.keys(schemaRoot)
    .map(rootType => (schemaRoot[rootType] ? `${rootType}: ${schemaRoot[rootType]}` : null))
    .filter(a => a);

  if (fields.length) {
    return `schema { ${fields.join('\n')} }`;
  }

  return undefined;
}

export function mergeGraphQLTypes(types: Array<string | Source | DocumentNode | GraphQLSchema>): DefinitionNode[] {
  const allNodes: ReadonlyArray<DefinitionNode> = types
    .map<DocumentNode>(type => {
      if (isGraphQLSchema(type)) {
        let schema: GraphQLSchema = type;
        let typesMap = type.getTypeMap();
        const validAstNodes = Object.keys(typesMap).filter(key => typesMap[key].astNode);

        if (validAstNodes.length === 0 && Object.keys(typesMap).length > 0) {
          schema = fixSchemaAst(schema);
          typesMap = schema.getTypeMap();
        }

        const schemaDefinition = createSchemaDefinition({
          query: schema.getQueryType(),
          mutation: schema.getMutationType(),
          subscription: schema.getSubscriptionType(),
        });
        const allTypesPrinted = Object.keys(typesMap)
          .map(key => typesMap[key])
          .map(type => (type.astNode ? print(type.astNode) : null))
          .filter(e => e);
        const directivesDeclaration = schema
          .getDirectives()
          .map(directive => (directive.astNode ? print(directive.astNode) : null))
          .filter(e => e);
        const printedSchema = [...directivesDeclaration, ...allTypesPrinted, schemaDefinition].join('\n');

        return parse(printedSchema);
      } else if (isStringTypes(type) || isSourceTypes(type)) {
        return parse(type);
      }

      return type;
    })
    .map(ast => ast.definitions)
    .reduce((defs, newDef) => [...defs, ...newDef], []);

  // XXX: right now we don't handle multiple schema definitions
  const schemaDef: {
    query: string | null;
    mutation: string | null;
    subscription: string | null;
  } = allNodes.filter(isSchemaDefinition).reduce(
    (def, node) => {
      node.operationTypes
        .filter(op => op.type.name.value)
        .forEach(op => {
          def[op.operation] = op.type.name.value;
        });

      return def;
    },
    {
      query: null,
      mutation: null,
      subscription: null,
    },
  );
  const mergedNodes: MergedResultMap = mergeGraphQLNodes(allNodes);
  const allTypes = Object.keys(mergedNodes);
  const queryType = schemaDef.query ? schemaDef.query : allTypes.find(t => t === 'Query');
  const mutationType = schemaDef.mutation ? schemaDef.mutation : allTypes.find(t => t === 'Mutation');
  const subscriptionType = schemaDef.subscription ? schemaDef.subscription : allTypes.find(t => t === 'Subscription');

  const schemaDefinition = createSchemaDefinition({
    query: queryType,
    mutation: mutationType,
    subscription: subscriptionType,
  });

  if (!schemaDefinition) {
    return Object.values(mergedNodes);
  }

  const def = parse(schemaDefinition).definitions[0];

  return [...Object.values(mergedNodes), def];
}
