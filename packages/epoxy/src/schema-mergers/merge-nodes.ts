import { DefinitionNode, print } from 'graphql';
import {
  isGraphQLEnum,
  isGraphQLInputType, isGraphQLInterface,
  isGraphQLScalar,
  isGraphQLType,
  isGraphQLUnion,
  isGraphQLDirective,
} from './utils';
import { mergeType } from './type';
import { mergeEnum } from './enum';
import { mergeUnion } from './union';
import { mergeInputType } from './input-type';
import { mergeInterface } from './interface';
import { mergeDirective } from './directives';

export type MergedResultMap = {[name: string]: DefinitionNode};

export function mergeGraphQLNodes(nodes: ReadonlyArray<DefinitionNode>): MergedResultMap {
  return nodes.reduce<MergedResultMap>((prev: MergedResultMap, nodeDefinition: DefinitionNode) => {
    const node = (nodeDefinition as any);

    if (node && node.name && node.name.value) {
      const name = node.name.value;

      if (isGraphQLType(nodeDefinition)) {
        prev[name] = mergeType(nodeDefinition, prev[name] as any);
      } else if (isGraphQLEnum(nodeDefinition)) {
        prev[name] = mergeEnum(nodeDefinition, prev[name] as any);
      } else if (isGraphQLUnion(nodeDefinition)) {
        prev[name] = mergeUnion(nodeDefinition, prev[name] as any);
      } else if (isGraphQLScalar(nodeDefinition)) {
        prev[name] = nodeDefinition;
      } else if (isGraphQLInputType(nodeDefinition)) {
        prev[name] = mergeInputType(nodeDefinition as any, prev[name] as any);
      } else if (isGraphQLInterface(nodeDefinition)) {
        prev[name] = mergeInterface(nodeDefinition as any, prev[name] as any);
      } else if (isGraphQLDirective(nodeDefinition)) {
        prev[name] = mergeDirective(nodeDefinition, prev[name] as any);
      }
    }

    return prev;
  }, {});
}
