import { buildASTSchema, printSchema, DefinitionNode, DocumentNode, GraphQLSchema, parse, print, Source, GraphQLObjectType, isSpecifiedScalarType, isIntrospectionType, GraphQLScalarType, printType } from 'graphql';
import { isGraphQLSchema, isSourceTypes, isStringTypes, isSchemaDefinition } from './utils';
import { MergedResultMap, mergeGraphQLNodes } from './merge-nodes';

interface Config {
  useSchemaDefinition?: boolean;
}

export function mergeGraphQLSchemas(
  types: Array<string | Source | DocumentNode | GraphQLSchema>,
  config?: Partial<Config>,
): DocumentNode {
  return {
    kind: 'Document',
    definitions: mergeGraphQLTypes(types, {
      useSchemaDefinition: true,
      ...config,
    }),
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
  const schemaRoot: {
    query?: string,
    mutation?: string,
    subscription?: string,
  } = {};

  if (def.query) {
    schemaRoot.query = def.query.toString();
  }
  if (def.mutation) {
    schemaRoot.mutation = def.mutation.toString();
  }
  if (def.subscription) {
    schemaRoot.subscription = def.subscription.toString();
  }

  const fields = Object.keys(schemaRoot)
    .map(rootType => (schemaRoot[rootType] ? `${rootType}: ${schemaRoot[rootType]}` : null))
    .filter(a => a);

  if (fields.length) {
    return `schema { ${fields.join('\n')} }`;
  }

  return undefined;
}

export function mergeGraphQLTypes(
  types: Array<string | Source | DocumentNode | GraphQLSchema>,
  config: Config,
): DefinitionNode[] {
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
          .filter(type => {
            const isPredefinedScalar = type instanceof GraphQLScalarType && isSpecifiedScalarType(type);
            const isIntrospection = isIntrospectionType(type);

            return !isPredefinedScalar && !isIntrospection;
          })
          .map(type => (type.astNode ? print(type.astNode) : printType(type)))
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
  let schemaDef: {
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

  if (config && config.useSchemaDefinition) {
    const queryType = schemaDef.query ? schemaDef.query : allTypes.find(t => t === 'Query');
    const mutationType = schemaDef.mutation ? schemaDef.mutation : allTypes.find(t => t === 'Mutation');
    const subscriptionType = schemaDef.subscription ? schemaDef.subscription : allTypes.find(t => t === 'Subscription');
    schemaDef = {
      query: queryType,
      mutation: mutationType,
      subscription: subscriptionType,
    };
  }

  const schemaDefinition = createSchemaDefinition(schemaDef);

  if (!schemaDefinition) {
    return Object.values(mergedNodes);
  }

  return [...Object.values(mergedNodes), parse(schemaDefinition).definitions[0]];
}
