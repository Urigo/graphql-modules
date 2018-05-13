import {
  TypeNode,
  DefinitionNode,
  EnumTypeDefinitionNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  Source,
  UnionTypeDefinitionNode, SchemaDefinitionNode, ScalarTypeDefinitionNode, InputObjectTypeDefinitionNode
} from 'graphql';

export function isStringTypes(types: any): types is string {
  return typeof types === 'string';
}

export function isSourceTypes(types: any): types is Source {
  return types instanceof Source;
}

export function isGraphQLType(definition: DefinitionNode): definition is ObjectTypeDefinitionNode {
  return definition.kind === 'ObjectTypeDefinition';
}

export function isGraphQLEnum(definition: DefinitionNode): definition is EnumTypeDefinitionNode {
  return definition.kind === 'EnumTypeDefinition';
}

export function isGraphQLUnion(definition: DefinitionNode): definition is UnionTypeDefinitionNode {
  return definition.kind === 'UnionTypeDefinition';
}

export function isGraphQLScalar(definition: DefinitionNode): definition is ScalarTypeDefinitionNode {
  return definition.kind === 'ScalarTypeDefinition';
}

export function isGraphQLInputType(definition: DefinitionNode): definition is InputObjectTypeDefinitionNode {
  return definition.kind === 'InputObjectTypeDefinition';
}

export function isSchemaDefinitionNode(definition: DefinitionNode): definition is SchemaDefinitionNode {
  return definition.kind === 'SchemaDefinition';
}

export function extractType(type: TypeNode): NamedTypeNode {
  if (type.kind === 'ListType' || type.kind === 'NonNullType') {
    return type.type as any;
  }

  return type as any;
}
