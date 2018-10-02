import { FieldDefinitionNode } from 'graphql/language/ast';
import { extractType } from './utils';
import { mergeDirectives } from './directives';

function fieldAlreadyExists(fieldsArr: ReadonlyArray<any>, otherField: any): boolean {
  const result: FieldDefinitionNode | null = fieldsArr.find(field => field.name.value === otherField.name.value);

  if (result) {
    const t1 = extractType(result.type);
    const t2 = extractType(otherField.type);

    if (t1.name.value !== t2.name.value) {
      throw new Error(`Field "${otherField.name.value}" already defined with a different type. Declared as "${t1.name.value}", but you tried to override with "${t2.name.value}"`);
    }
  }

  return !!result;
}

export function mergeFields<T>(f1: ReadonlyArray<T>, f2: ReadonlyArray<T>): T[] {
  const result: T[] = [...f2];

  for (const field of f1) {
    if (fieldAlreadyExists(result, field)) {
      const existing = result.find((f: any) => f.name.value === (field as any).name.value);
      existing['directives'] = mergeDirectives(field['directives'], existing['directives']);
    } else {
      result.push(field);
    }
  }

  return result;
}
