// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLFieldResolver, GraphQLNamedType, GraphQLFieldConfig, GraphQLResolveInfo, GraphQLString, GraphQLFloat } from 'graphql';

export const GRAPHQL_NAMED_TYPE = 'graphql:named-type';
export const GRAPHQL_OBJECT_TYPE_CONFIG = 'graphql:config-type-config';
export const DESIGN_TYPE = 'design:type';
export const DESIGN_RETURNTYPE = 'design:returntype';

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

export function ArgParam() {

}

export function FieldProperty<TSource, TContext, TArgs extends any[], TResult>(fieldDecoratorConfig: FieldDecoratorConfig<TSource, TArgs, TResult> = {}): PropertyDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = getObjectTypeConfigFromClass(target.constructor);
    const fieldName = fieldDecoratorConfig.name || propertyKey;
    const fieldType = fieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
    const fieldGraphQLType = Reflect.getMetadata(GRAPHQL_NAMED_TYPE, fieldType) || DEFAULT_SCALAR_TYPE_MAP.get(fieldType) || fieldType;
    const fieldResolver = fieldDecoratorConfig.resolve;
    const fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs> = {
      type: fieldGraphQLType,
      resolve: (root, args) => {
        const targetInstance = Reflect.construct(target.constructor, []);
        Object.assign(targetInstance, root);
        return fieldResolver.call(targetInstance, ...args);
      },
    };
    existingConfig.fields = {
      [fieldName]: fieldConfig,
      ...(existingConfig.fields || {}),
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target);
  };
}
export function FieldMethod<TSource, TContext, TArgs extends any[], TResult>(fieldDecoratorConfig: FieldDecoratorConfig<TSource, TArgs, TResult> = {}): MethodDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = getObjectTypeConfigFromClass(target.constructor);
    const fieldName = fieldDecoratorConfig.name || propertyKey;
    const fieldType = fieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_RETURNTYPE, target, propertyKey);
    const fieldGraphQLType = Reflect.getMetadata(GRAPHQL_NAMED_TYPE, fieldType) || DEFAULT_SCALAR_TYPE_MAP.get(fieldType) || fieldType;
    const fieldResolver = fieldDecoratorConfig.resolve || target[propertyKey];
    const fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs> = {
      type: fieldGraphQLType,
      resolve: (root, args) => {
        const targetInstance = Reflect.construct(target.constructor, []);
        Object.assign(targetInstance, root);
        return fieldResolver.call(targetInstance, ...args);
      },
    };
    existingConfig.fields = {
      [fieldName]: fieldConfig,
      ...(existingConfig.fields || {}),
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target);
  };
}

export function ObjectType<TSource, TContext>(config ?: GraphQLObjectTypeConfig<TSource, TContext>): ClassDecorator {
  return target => {
    const existingConfig = getObjectTypeConfigFromClass(target);
    Reflect.defineMetadata(GRAPHQL_NAMED_TYPE, new GraphQLObjectType({
      ...existingConfig,
      ...(config || {}),
    }), target);
  };
}

// tslint:disable-next-line:ban-types
export function getObjectTypeConfigFromClass<TSource, TContext>(target: Function): GraphQLObjectTypeConfig<TSource, TContext> {
  if (!Reflect.hasMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target)) {
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, {
      name: target.name,
    }, target);
  }
  return Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target);
}

// tslint:disable-next-line:ban-types
export function getNamedTypeFromClass(target: Function): GraphQLNamedType {
  return Reflect.getMetadata(GRAPHQL_NAMED_TYPE, target);
}
