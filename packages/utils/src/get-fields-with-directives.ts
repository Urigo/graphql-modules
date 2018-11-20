import { DocumentNode, ObjectTypeDefinitionNode, ValueNode, Kind } from 'graphql';

export type DirectiveArgs = { [name: string]: any };
export type DirectiveUsage = { name: string; args: DirectiveArgs };
export type TypeAndFieldToDirectives = {
  [typeAndField: string]: DirectiveUsage[];
};

function isObjectTypeDefinition(obj: any): obj is ObjectTypeDefinitionNode {
  return obj && obj.kind === 'ObjectTypeDefinition';
}

function parseDirectiveValue(value: ValueNode): any {
  switch (value.kind) {
    case Kind.INT:
      return parseInt(value.value);
    case Kind.FLOAT:
      return parseFloat(value.value);
    case Kind.BOOLEAN:
      return Boolean(value.value);
    case Kind.STRING:
    case Kind.ENUM:
      return value.value;
    case Kind.LIST:
      return value.values.map(v => parseDirectiveValue(v));
    case Kind.OBJECT:
      return value.fields.reduce((prev, v) => ({ ...prev, [v.name.value]: parseDirectiveValue(v.value) }), {});
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

export function getFieldsWithDirectives(documentNode: DocumentNode): TypeAndFieldToDirectives {
  const result: TypeAndFieldToDirectives = {};
  const allTypes: ObjectTypeDefinitionNode[] = documentNode.definitions.filter<ObjectTypeDefinitionNode>(isObjectTypeDefinition);

  for (const type of allTypes) {
    const typeName = type.name.value;

    for (const field of type.fields) {
      if (field.directives && field.directives.length > 0) {
        const fieldName = field.name.value;
        const key = `${typeName}.${fieldName}`;
        const directives: DirectiveUsage[] = field.directives.map(d => ({
          name: d.name.value,
          args: (d.arguments || []).reduce((prev, arg) => ({ ...prev, [arg.name.value]: parseDirectiveValue(arg.value) }), {}),
        }));

        result[key] = directives;
      }
    }
  }

  return result;
}
