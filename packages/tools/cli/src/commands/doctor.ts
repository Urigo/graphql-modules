import {
  scanForFiles,
  scanGlob,
  buildGraph,
  validateCircularDeps,
  CircularDependencyError,
  checkNodeRequires
} from '@graphql-modules/doctor';
import { print, printCyclePath } from './utils';
import * as logSymbols from 'log-symbols';
import { bold, gray } from 'chalk';
import { relative, basename } from 'path';

export default async function doctor(
  projectDirectory: string = process.cwd(),
  pattern: string,
  verbose: boolean = false
) {
  const filePaths = scanGlob(pattern, projectDirectory);

  try {
    print(logSymbols.info, `Checking your GraphQL-Modules...`);

    const result = scanForFiles(filePaths);

    if (verbose) {
      result.modules.forEach((m: { name: any; path: string; providers: any[]; }) => {
        print('  ', logSymbols.info, bold(`${m.name} (${relative(projectDirectory, m.path)})`));
        print(m.providers.map((p: { name: any; }) => gray(`      └ ${p.name}`)).join('\n'));
      });
    }

    const graph = buildGraph(result.modules, result.providers);
    validateCircularDeps(graph);

    print(logSymbols.success, `All found GraphQL-Modules (${result.modules.length}) are valid!`);
  } catch (e) {
    print(logSymbols.error, e.message);

    if (e instanceof CircularDependencyError) {
      printCyclePath(e.cyclePath);
    }
  }

  try {
    print(logSymbols.info, `Checking your NodeJS "require" usages...`);
    const allCircularDeps = await checkNodeRequires(filePaths, projectDirectory);

    if (allCircularDeps.length > 0) {
      print(logSymbols.warning, `Found circular NodeJS "require" usages:`);

      for (const circularNodeDep of allCircularDeps) {
        printCyclePath([...circularNodeDep, circularNodeDep[0]].map(f => ({ name: basename(f), filePath: f })));
      }
    } else {
      print(logSymbols.success, `No circlar require dependnecies found!`);
    }
  } catch (e) {
    print(logSymbols.error, e.message);
  }
}
