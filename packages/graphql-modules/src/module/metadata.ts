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
} from 'graphql';
import { ModuleConfig } from './types';
import { ID } from '../shared/types';

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
    if (node.fields) {
      implemented[node.name.value] = (node.fields as Array<
        InputValueDefinitionNode | FieldDefinitionNode
      >).map((field) => field.name.value);
    }
  }

  function collectObjectExtension(
    node:
      | ObjectTypeExtensionNode
      | InterfaceTypeExtensionNode
      | InputObjectTypeExtensionNode
  ) {
    if (node.fields) {
      extended[node.name.value] = [];

      (node.fields as Array<
        InputValueDefinitionNode | FieldDefinitionNode
      >).forEach((field) => {
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
        if (node.types) {
          implemented[node.name.value] = node.types.map(
            (type) => type.name.value
          );
        }
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
          implemented[node.name.value] = node.values.map(
            (value) => value.name.value
          );
        }
      },
      EnumTypeExtension(node) {
        if (node.values) {
          extended[node.name.value] = node.values.map(
            (value) => value.name.value
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
