import { DefinitionNode } from 'graphql';
import {
  isGraphQLEnum,
  isGraphQLInputType,
  isGraphQLScalar,
  isGraphQLType,
  isGraphQLUnion,
} from './utils';
import { mergeType } from './mergers/type';
import { mergeEnum } from './mergers/enum';
import { mergeUnion } from './mergers/union';
import { mergeInputType } from './mergers/input-type';

export type MergedResultMap = {[name: string]: DefinitionNode};

export function mergeGraphQLNodes(nodes: ReadonlyArray<DefinitionNode>): MergedResultMap {
  return nodes.reduce<MergedResultMap>((prev: MergedResultMap, nodeDefinition: DefinitionNode) => {
    const name = (nodeDefinition as any).name.value;

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
    }

    return prev;
  }, {});
}
