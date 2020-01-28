import madge from 'madge';
import { join } from 'path';

export async function checkNodeRequires(filesPaths: string[], baseDir: string): Promise<string[][]> {
  const result = await madge(filesPaths, {
    baseDir,
    fileExtensions: ['js', 'ts'],
    tsConfig: join(baseDir, './tsconfig.json')
  });

  return result.circular();
}
