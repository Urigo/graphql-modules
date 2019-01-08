// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLFieldResolver, GraphQLNamedType, GraphQLFieldConfig, GraphQLResolveInfo, GraphQLString, GraphQLFloat, GraphQLInputType, GraphQLArgumentConfig } from 'graphql';

export const GRAPHQL_NAMED_TYPE = 'graphql:named-type';
export const GRAPHQL_INPUT_TYPE = 'graphql:input-type';
export const GRAPHQL_OBJECT_TYPE_CONFIG = 'graphql:object-type-config';
export const DESIGN_TYPE = 'design:type';
export const DESIGN_RETURNTYPE = 'design:returntype';
export const DESIGN_PARAMTYPES = 'design:paramtypes';

export type Type<T> = new (...args: any[]) => T;

export const DEFAULT_SCALAR_TYPE_MAP = new Map<Type<any>, GraphQLNamedType>([
  [String, GraphQLString],
  [Number, GraphQLFloat],
]);

export type FieldResolver<TSource, TArgs extends any[], TResult> = (
  this: TSource,
  ...args: TArgs
) => Promise<TResult> | TResult;

export interface FieldDecoratorConfig<TSource, TArgs extends any[], TResult> {
  name?: string;
  type?: Type<TResult> | GraphQLNamedType;
  resolve?: FieldResolver<TSource, TArgs, TResult>;
}

export interface ArgumentParameterDecoratorConfig {
  name: string;
  type?: Type<any> | GraphQLInputType;
  fieldName?: string;
}

export function ArgumentParameter<TSource, TContext, TArgs extends any[]>(argumentParameterConfig: ArgumentParameterDecoratorConfig): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const fieldName = argumentParameterConfig.fieldName || propertyKey;
    const argumentName = argumentParameterConfig.name;
    const argumentType = argumentParameterConfig.type || Reflect.getMetadata(DESIGN_PARAMTYPES, target, propertyKey)[parameterIndex];
    const argumentGraphQLInputType = Reflect.getMetadata(GRAPHQL_INPUT_TYPE, argumentType) || DEFAULT_SCALAR_TYPE_MAP.get(argumentType) || argumentType;
    const argumentConfig: GraphQLArgumentConfig = {
      type: argumentGraphQLInputType,
    };
    const fieldConfig: Partial<GraphQLFieldConfig<TSource, TContext, TArgs>> = {
      args: {
        [argumentName]: argumentConfig,
      },
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[fieldName] = existingConfig.fields[fieldName] || {};
    existingConfig.fields[fieldName] = {
      ...(existingConfig.fields[fieldName] || {}),
      ...fieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function FieldProperty<TSource, TContext, TArgs extends any[], TResult>(fieldDecoratorConfig: FieldDecoratorConfig<TSource, TArgs, TResult> = {}): PropertyDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const fieldName = fieldDecoratorConfig.name || propertyKey;
    const fieldType = fieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
    const fieldGraphQLType = Reflect.getMetadata(GRAPHQL_NAMED_TYPE, fieldType) || DEFAULT_SCALAR_TYPE_MAP.get(fieldType) || fieldType;
    const fieldResolver = fieldDecoratorConfig.resolve;
    const fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs> = {
      type: fieldGraphQLType,
      resolve: (root, args) => fieldResolver.call(root, ...Object.values(args)), // TODO: NOT SAFE
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[fieldName] = {
      ...(existingConfig.fields[fieldName] || {}),
      ...fieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}
export function FieldMethod<TSource, TContext, TArgs extends any[], TResult>(fieldDecoratorConfig: FieldDecoratorConfig<TSource, TArgs, TResult> = {}): MethodDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const fieldName = fieldDecoratorConfig.name || propertyKey;
    const fieldType = fieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_RETURNTYPE, target, propertyKey);
    const fieldGraphQLType = Reflect.getMetadata(GRAPHQL_NAMED_TYPE, fieldType) || DEFAULT_SCALAR_TYPE_MAP.get(fieldType) || fieldType;
    const fieldResolver = fieldDecoratorConfig.resolve || target[propertyKey];
    const fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs> = {
      type: fieldGraphQLType,
      resolve: (root, args) => fieldResolver.call(root, ...Object.values(args)), // TODO: NOT SAFE
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[fieldName] = {
      ...(existingConfig.fields[fieldName] || {}),
      ...fieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function ObjectType<TSource, TContext>(config ?: GraphQLObjectTypeConfig<TSource, TContext>): ClassDecorator {
  return target => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target) || {};
    Reflect.defineMetadata(GRAPHQL_NAMED_TYPE, new GraphQLObjectType({
      name: target.name,
      ...existingConfig,
      ...(config || {}),
    }), target);
  };
}

// tslint:disable-next-line:ban-types
export function getNamedTypeFromClass(target: Function): GraphQLNamedType {
  return Reflect.getMetadata(GRAPHQL_NAMED_TYPE, target);
}
