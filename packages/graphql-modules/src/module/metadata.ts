import {
  DocumentNode,
  visit,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  InterfaceTypeDefinitionNode,
  InterfaceTypeExtensionNode,
  InputObjectTypeDefinitionNode,
  InputObjectTypeExtensionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  Kind,
} from 'graphql';
import { ModuleConfig } from './types.js';
import { ID } from '../shared/types.js';

export type Registry = Record<string, string[]>;

export interface ModuleMetadata {
  id: ID;
  typeDefs: DocumentNode[];
  implements?: Registry;
  extends?: Registry;
  dirname?: string;
}

export function metadataFactory(
  typeDefs: DocumentNode[],
  config: ModuleConfig
): ModuleMetadata {
  const implemented: Registry = {};
  const extended: Registry = {};

  function collectObjectDefinition(
    node:
      | ObjectTypeDefinitionNode
      | InterfaceTypeDefinitionNode
      | InputObjectTypeDefinitionNode
  ) {
    if (!implemented[node.name.value]) {
      implemented[node.name.value] = [];
    }

    if (node.fields && node.fields.length > 0) {
      implemented[node.name.value].push(
        ...(
          node.fields as Array<InputValueDefinitionNode | FieldDefinitionNode>
        ).map((field) => field.name.value)
      );
    }

    if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
      implemented[node.name.value].push('__isTypeOf');
    }

    if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
      implemented[node.name.value].push('__resolveReference');
      implemented[node.name.value].push('__resolveObject');
    }

    if (node.kind === Kind.INTERFACE_TYPE_DEFINITION) {
      implemented[node.name.value].push('__resolveType');
    }
  }

  function collectObjectExtension(
    node:
      | ObjectTypeExtensionNode
      | InterfaceTypeExtensionNode
      | InputObjectTypeExtensionNode
  ) {
    if (node.fields) {
      if (!extended[node.name.value]) {
        extended[node.name.value] = [];
      }

      (
        node.fields as Array<InputValueDefinitionNode | FieldDefinitionNode>
      ).forEach((field) => {
        extended[node.name.value].push(field.name.value);
      });
    }
  }

  for (const doc of typeDefs) {
    visit(doc, {
      // Object
      ObjectTypeDefinition(node) {
        collectObjectDefinition(node);
      },
      ObjectTypeExtension(node) {
        collectObjectExtension(node);
      },
      // Interface
      InterfaceTypeDefinition(node) {
        collectObjectDefinition(node);
      },
      InterfaceTypeExtension(node) {
        collectObjectExtension(node);
      },
      // Union
      UnionTypeDefinition(node) {
        if (!implemented[node.name.value]) {
          implemented[node.name.value] = [];
        }

        if (node.types) {
          implemented[node.name.value].push(
            ...node.types.map((type) => type.name.value)
          );
        }

        implemented[node.name.value].push('__resolveType');
      },
      UnionTypeExtension(node) {
        if (node.types) {
          if (!extended[node.name.value]) {
            extended[node.name.value] = [];
          }

          extended[node.name.value].push(
            ...node.types.map((type) => type.name.value)
          );
        }
      },
      // Input
      InputObjectTypeDefinition(node) {
        collectObjectDefinition(node);
      },
      InputObjectTypeExtension(node) {
        collectObjectExtension(node);
      },
      // Enum
      EnumTypeDefinition(node) {
        if (node.values) {
          if (!implemented[node.name.value]) {
            implemented[node.name.value] = [];
          }

          implemented[node.name.value].push(
            ...node.values.map((value) => value.name.value)
          );
        }
      },
      EnumTypeExtension(node) {
        if (node.values) {
          if (!extended[node.name.value]) {
            extended[node.name.value] = [];
          }

          extended[node.name.value].push(
            ...node.values.map((value) => value.name.value)
          );
        }
      },
      // Scalar
      ScalarTypeDefinition(node) {
        if (!implemented.__scalars) {
          implemented.__scalars = [];
        }

        implemented.__scalars.push(node.name.value);
      },
    });
  }

  return {
    id: config.id,
    typeDefs,
    implements: implemented,
    extends: extended,
    dirname: config.dirname,
  };
}
