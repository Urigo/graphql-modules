// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLFieldResolver, GraphQLNamedType } from 'graphql';

export const GRAPHQL_NAMED_TYPE = 'graphql:named-type';
export const GRAPHQL_OBJECT_TYPE_CONFIG = 'graphql:config-type-config';
export const DESIGN_TYPE = 'design:type';

export function FieldResolve<TSource, TContext, TArgs>(resolve: GraphQLFieldResolver<TSource, TContext, TArgs>) {
  return (target, propertyKey) => {
    const existingConfig = getObjectTypeConfigFromClass(target);
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[propertyKey] = {
      ...(existingConfig.fields[propertyKey] || {}),
      resolve,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target);
  };
}

export function FieldType(graphqlNamedType?: GraphQLNamedType): PropertyDecorator {
  return (target, propertyKey) => {
    if (!graphqlNamedType) {
      const designType = Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
      graphqlNamedType = Reflect.getMetadata(GRAPHQL_NAMED_TYPE, designType) || designType;
    }
    const existingConfig = getObjectTypeConfigFromClass(target.constructor);
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[propertyKey] = {
      ...(existingConfig.fields[propertyKey] || {}),
      type: graphqlNamedType,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function ObjectType<TSource, TContext>(config ?: GraphQLObjectTypeConfig<TSource, TContext>): ClassDecorator {
  return target => {
    const existingConfig = getObjectTypeConfigFromClass(target);
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, {
      ...existingConfig,
      ...(config || {}),
    }, target);
  };
}

export function getObjectTypeConfigFromClass<TSource, TContext>(target: any): GraphQLObjectTypeConfig<TSource, TContext> {
  if (!Reflect.hasMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target)) {
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, {
      name: target.name,
    }, target);
  }
  return Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target);
}

export function getNamedTypeFromClass(target: any): GraphQLNamedType {
  if (!Reflect.hasMetadata(GRAPHQL_NAMED_TYPE, target)) {
    Reflect.defineMetadata(GRAPHQL_NAMED_TYPE, new GraphQLObjectType(getObjectTypeConfigFromClass(target)), target);
  }
  return Reflect.getMetadata(GRAPHQL_NAMED_TYPE, target);
}
