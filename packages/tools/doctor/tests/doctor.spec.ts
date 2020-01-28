import { validateCircularDeps, buildGraph, extractFromFiles } from '../src';

describe('Doctor', () => {
  it('Should throw an error in case of circular dependency between Providers', () => {
    const file1 = `
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class A {
  constructor(b: B) {

  }
}`;
    const file2 = `
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class B {
  constructor(b: A) {

  }
}`;

    const found = extractFromFiles([
      {
        path: '1.ts',
        content: file1
      },
      {
        path: '2.ts',
        content: file2
      }
    ]);

    expect(found.modules.length).toBe(0);
    expect(found.providers.length).toBe(2);
    expect(found.providers).toEqual(expect.arrayContaining([{ name: 'A', path: '1.ts', injectables: ['B'] }]));
    expect(found.providers).toEqual(expect.arrayContaining([{ name: 'B', path: '2.ts', injectables: ['A'] }]));

    try {
      const graph = buildGraph(found.modules, found.providers);
      validateCircularDeps(graph);
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.cyclePath).toEqual([
        { name: 'A', filePath: '1.ts' },
        { name: 'B', filePath: '2.ts' },
        { name: 'A', filePath: '1.ts' }
      ]);
      expect(e.message).toBe('Found a circular dependency between Providers!');
    }
  });

  it('Should throw an error in case of circular dependency between (3) Providers', () => {
    const file1 = `
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class A {
  constructor(b: B) {

  }
}`;
    const file2 = `
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class B {
  constructor(c: C) {

  }
}`;
    const file3 = `
import { Injectable } from '@graphql-modules/di';

@Injectable()
export class C {
  constructor(a: A) {

  }
}`;

    const found = extractFromFiles([
      {
        path: '1.ts',
        content: file1
      },
      {
        path: '2.ts',
        content: file2
      },
      {
        path: '3.ts',
        content: file3
      }
    ]);

    expect(found.modules.length).toBe(0);
    expect(found.providers.length).toBe(3);
    expect(found.providers).toEqual(expect.arrayContaining([{ name: 'A', path: '1.ts', injectables: ['B'] }]));
    expect(found.providers).toEqual(expect.arrayContaining([{ name: 'B', path: '2.ts', injectables: ['C'] }]));
    expect(found.providers).toEqual(expect.arrayContaining([{ name: 'C', path: '3.ts', injectables: ['A'] }]));

    try {
      const graph = buildGraph(found.modules, found.providers);
      validateCircularDeps(graph);
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.cyclePath).toEqual([
        { name: 'A', filePath: '1.ts' },
        { name: 'B', filePath: '2.ts' },
        { name: 'C', filePath: '3.ts' },
        { name: 'A', filePath: '1.ts' }
      ]);
      expect(e.message).toBe('Found a circular dependency between Providers!');
    }
  });
});
